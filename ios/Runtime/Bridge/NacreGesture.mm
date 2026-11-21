// 手势识别器：基类 UIGestureRecognizer，七个子类（点按、长按、拖动、捏合、
// 旋转、轻扫、屏幕边缘拖动），以及 UIView 上挂/摘识别器的那三个成员。
//
// 一个域一个文件，装它在所有通道上的分支；每个入口返回「认不认领」。
// 这个域是**登记进来的**（文件末尾的 +load，见 NacreExtension.h 的
// NacreRegisterDomain）：核心的分发器、内部头、NacreRuntime.mm 都不认识它，
// 所以这里的函数全是 static。事件从 NacreEmitEventWithJSON 出去。

#import "NacreBridge.h"

#import <objc/runtime.h>

// 关联对象的 key：识别器 → NacreGestureTarget。
// 识别器的 addTarget:action: 不持有 target，所以靠这个关联让它活着
static const void* kNacreGestureTargetKey = &kNacreGestureTargetKey;
// 识别器 → NacreGestureDelegate。委托属性是 weak，靠这个关联让它活着
static const void* kNacreGestureDelegateKey = &kNacreGestureDelegateKey;

// 手势识别器的委托：系统当场问的两件事。
//   要不要开始   → 当场派发可取消的 beforebegin，preventDefault 就不开始
//   能不能同时   → 查 recognizesSimultaneouslyWith 这张表，不进 JS
// 只装在委托是空的识别器上（JS 自己 new 的那些）。UIKit 自带的识别器（滚动视图
// 内置的拖动）委托必须是它自己，换掉会崩，所以在那上面用报错
@interface NacreGestureDelegate : NSObject <UIGestureRecognizerDelegate>
@property(nonatomic) BOOL asksBegin;
// 弱引用：识别器由它所在的视图持有，这张表不额外持有
@property(nonatomic, strong) NSHashTable<UIGestureRecognizer*>* simultaneous;
@end

// 手势的 trampoline：运行时自己当 target，只记订阅了哪几个事件名。
// 识别器通过关联对象持有它，它对识别器没有引用，不成环
@interface NacreGestureTarget : NSObject
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
- (void)fire:(UIGestureRecognizer*)sender;
@end

namespace nacre_bridge {

// 没有 recognized：它在头文件里是 `Recognized = Ended`，一个值两个名字。
// 主名取被赋值的那一侧，和 UIStackViewAlignment 的 top / leading 同一条规矩
NACRE_ENUM_MAP(GestureState, UIGestureRecognizerState,
               @"possible": @(UIGestureRecognizerStatePossible),
               @"began": @(UIGestureRecognizerStateBegan),
               @"changed": @(UIGestureRecognizerStateChanged),
               @"ended": @(UIGestureRecognizerStateEnded),
               @"cancelled": @(UIGestureRecognizerStateCancelled),
               @"failed": @(UIGestureRecognizerStateFailed))

// 事件名就是状态名。只有这四个状态会调 action（头文件：failed 那条写着
// "the action method will not be called"），所以事件也只有这四个
static NSString* GestureEventNameForState(UIGestureRecognizerState state) {
  switch (state) {
    case UIGestureRecognizerStateBegan: return @"began";
    case UIGestureRecognizerStateChanged: return @"changed";
    case UIGestureRecognizerStateEnded: return @"ended";
    case UIGestureRecognizerStateCancelled: return @"cancelled";
    default: return nil;
  }
}
static NSString* const kGestureEventNames = @"began / changed / ended / cancelled";

// 三个位掩码，JS 侧都是字符串数组。名字带 Gesture 前缀：这个宏定义出来的
// 函数不是 static 的，别的域要是也给 UIRectEdge 建一张表，名字不能撞
NACRE_MASK_MAP(GestureSwipeDirection, UISwipeGestureRecognizerDirection,
               @"right": @(UISwipeGestureRecognizerDirectionRight),
               @"left": @(UISwipeGestureRecognizerDirectionLeft),
               @"up": @(UISwipeGestureRecognizerDirectionUp),
               @"down": @(UISwipeGestureRecognizerDirectionDown))

// 没有 all：它是四个位或起来的值，不是第五个位。四条边写全就是它
NACRE_MASK_MAP(GestureRectEdge, UIRectEdge,
               @"top": @(UIRectEdgeTop),
               @"left": @(UIRectEdgeLeft),
               @"bottom": @(UIRectEdgeBottom),
               @"right": @(UIRectEdgeRight))

NACRE_MASK_MAP(GestureScrollTypeMask, UIScrollTypeMask,
               @"discrete": @(UIScrollTypeMaskDiscrete),
               @"continuous": @(UIScrollTypeMaskContinuous))

// 这个识别器用哪个 JS 类包装。认的是「最近的那个公开父类」，所以系统自己的
// 识别器也有着落：滚动视图的拖动识别器是 UIScrollViewPanGestureRecognizer
// （UIPanGestureRecognizer 的私有子类），读出来就是 UIPanGestureRecognizer。
// 子类要排在父类前面：屏幕边缘拖动是拖动的子类
static const char* GestureClassName(UIGestureRecognizer* recognizer) {
  if ([recognizer isKindOfClass:UIScreenEdgePanGestureRecognizer.class]) {
    return "UIScreenEdgePanGestureRecognizer";
  }
  if ([recognizer isKindOfClass:UIPanGestureRecognizer.class]) {
    return "UIPanGestureRecognizer";
  }
  if ([recognizer isKindOfClass:UIPinchGestureRecognizer.class]) {
    return "UIPinchGestureRecognizer";
  }
  if ([recognizer isKindOfClass:UIRotationGestureRecognizer.class]) {
    return "UIRotationGestureRecognizer";
  }
  if ([recognizer isKindOfClass:UISwipeGestureRecognizer.class]) {
    return "UISwipeGestureRecognizer";
  }
  if ([recognizer isKindOfClass:UITapGestureRecognizer.class]) {
    return "UITapGestureRecognizer";
  }
  if ([recognizer isKindOfClass:UILongPressGestureRecognizer.class]) {
    return "UILongPressGestureRecognizer";
  }
  // 没有公开父类的那些（UIHoverGestureRecognizer、滚动视图里几个私有的）
  // 落到这里，按基类包装
  return "UIGestureRecognizer";
}

// 事件负载里的一个点。和原来 location 的写法一样：六位小数，不是有限数给 null
static NSString* GesturePointJSON(CGPoint p) {
  return (isfinite(p.x) && isfinite(p.y))
             ? [NSString stringWithFormat:@"{\"x\":%.6f,\"y\":%.6f}", p.x, p.y]
             : @"null";
}

static NSString* GestureNumberJSON(CGFloat n) {
  return isfinite(n) ? [NSString stringWithFormat:@"%.17g", (double)n] : @"null";
}

}  // namespace nacre_bridge

// 手势的 trampoline。和控件事件同一个做法：运行时自己当 target，
// **不持有任何 JS 函数**，只记订阅了哪几个事件名。
//
// 事件带 location 和 numberOfTouches，因为回头读不到：头文件写着 action 在
// 「下一轮 run loop」才调、调完识别器就重置成 possible，而我们的事件还要
// 再延后一轮——JS 拿到事件时识别器上的状态和触点都已经清掉了。
//
// 连续手势自己的量是同一个道理，按类各带各的：
//   拖动（含屏幕边缘拖动）  translation、velocity，都是点，在识别器所在视图的坐标系里
//   捏合                    scale、velocity
//   旋转                    rotation、velocity
// 轻扫是离散手势，只有 location 和 numberOfTouches。
@implementation NacreGestureTarget

- (void)fire:(UIGestureRecognizer*)sender {
  NSString* type = nacre_bridge::GestureEventNameForState(sender.state);
  if (type == nil || ![self.types containsObject:type]) return;
  // 位置按识别器所在视图的坐标系给。要别的坐标系，JS 侧用 convertPoint
  NSMutableString* json = [NSMutableString
      stringWithFormat:@"{\"location\":%@,\"numberOfTouches\":%lu",
                       nacre_bridge::GesturePointJSON([sender locationInView:sender.view]),
                       (unsigned long)sender.numberOfTouches];
  if ([sender isKindOfClass:UIPanGestureRecognizer.class]) {
    UIPanGestureRecognizer* pan = (UIPanGestureRecognizer*)sender;
    [json appendFormat:@",\"translation\":%@,\"velocity\":%@",
                       nacre_bridge::GesturePointJSON([pan translationInView:pan.view]),
                       nacre_bridge::GesturePointJSON([pan velocityInView:pan.view])];
  } else if ([sender isKindOfClass:UIPinchGestureRecognizer.class]) {
    UIPinchGestureRecognizer* pinch = (UIPinchGestureRecognizer*)sender;
    [json appendFormat:@",\"scale\":%@,\"velocity\":%@",
                       nacre_bridge::GestureNumberJSON(pinch.scale),
                       nacre_bridge::GestureNumberJSON(pinch.velocity)];
  } else if ([sender isKindOfClass:UIRotationGestureRecognizer.class]) {
    UIRotationGestureRecognizer* turn = (UIRotationGestureRecognizer*)sender;
    [json appendFormat:@",\"rotation\":%@,\"velocity\":%@",
                       nacre_bridge::GestureNumberJSON(turn.rotation),
                       nacre_bridge::GestureNumberJSON(turn.velocity)];
  }
  [json appendString:@"}"];
  nacre_bridge::NacreEmitEventWithJSON(sender, nacre_bridge::GestureClassName(sender), type, json);
}

@end

@implementation NacreGestureDelegate

// 要不要开始：当场派发可取消的 beforebegin，带着这一刻的触点（和别的手势事件一样）
- (BOOL)gestureRecognizerShouldBegin:(UIGestureRecognizer*)recognizer {
  if (!self.asksBegin) return YES;
  NSString* json = [NSString
      stringWithFormat:@"{\"location\":%@,\"numberOfTouches\":%lu}",
                       nacre_bridge::GesturePointJSON([recognizer locationInView:recognizer.view]),
                       (unsigned long)recognizer.numberOfTouches];
  return !nacre_bridge::NacreEmitEventSync(recognizer, nacre_bridge::GestureClassName(recognizer),
                                           @"beforebegin", json);
}

// 能不能和另一个同时识别：在表里就能。UIKit 两边的委托都会问，有一边答能就同时
- (BOOL)gestureRecognizer:(UIGestureRecognizer*)recognizer
    shouldRecognizeSimultaneouslyWithGestureRecognizer:(UIGestureRecognizer*)other {
  return [self.simultaneous containsObject:other];
}

@end

namespace nacre_bridge {

// ---- 构造 ----
// 基类不给构造：UIGestureRecognizer 自己什么手势都不认
static bool GestureConstruct(const std::string& className, const NacreArgs& args,
                             nacre::NativeObjectRef* out, std::string* error) {
  UIGestureRecognizer* recognizer = nil;
  if (className == "UITapGestureRecognizer") {
    recognizer = [[UITapGestureRecognizer alloc] init];
  } else if (className == "UILongPressGestureRecognizer") {
    recognizer = [[UILongPressGestureRecognizer alloc] init];
  } else if (className == "UIPanGestureRecognizer") {
    recognizer = [[UIPanGestureRecognizer alloc] init];
  } else if (className == "UIPinchGestureRecognizer") {
    recognizer = [[UIPinchGestureRecognizer alloc] init];
  } else if (className == "UIRotationGestureRecognizer") {
    recognizer = [[UIRotationGestureRecognizer alloc] init];
  } else if (className == "UISwipeGestureRecognizer") {
    recognizer = [[UISwipeGestureRecognizer alloc] init];
  } else if (className == "UIScreenEdgePanGestureRecognizer") {
    recognizer = [[UIScreenEdgePanGestureRecognizer alloc] init];
  }
  if (recognizer == nil) return false;
  *out = {NacreKeep(recognizer), className};
  return true;
}

// ---- 委托 ----
// 拿到这个识别器上我们装的委托，没有就装一个。委托不是空的、也不是我们的（UIKit
// 自带的识别器）时填 error、返回 nil
static NacreGestureDelegate* GestureDelegateFor(UIGestureRecognizer* recognizer, NSString* what,
                                                std::string* error) {
  NacreGestureDelegate* mine = objc_getAssociatedObject(recognizer, kNacreGestureDelegateKey);
  if (mine != nil && recognizer.delegate == mine) return mine;
  if (recognizer.delegate != nil) {
    *error = [NSString stringWithFormat:
        @"%@ is only available on gesture recognizers you create: this one belongs to UIKit "
        @"(for example a scroll view's built-in pan) and its delegate cannot be replaced", what]
                 .UTF8String;
    return nil;
  }
  mine = [NacreGestureDelegate new];
  mine.simultaneous = [NSHashTable weakObjectsHashTable];
  objc_setAssociatedObject(recognizer, kNacreGestureDelegateKey, mine,
                           OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  recognizer.delegate = mine;
  return mine;
}

// 两件事都不要了就把委托摘掉，识别器回到 UIKit 的默认行为
static void GestureDelegateTrim(UIGestureRecognizer* recognizer) {
  NacreGestureDelegate* mine = objc_getAssociatedObject(recognizer, kNacreGestureDelegateKey);
  if (mine == nil || mine.asksBegin || mine.simultaneous.count > 0) return;
  if (recognizer.delegate == mine) recognizer.delegate = nil;
  objc_setAssociatedObject(recognizer, kNacreGestureDelegateKey, nil,
                           OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

// ---- 订阅 ----
// 惰性：第一个事件名有监听器时才 addTarget，最后一个移走时 removeTarget。
// 没有监听器的识别器照样在识别（也照样会按 cancelsTouchesInView 取消
// 视图的触摸）——那是 UIKit 的事，和有没有人听无关
static NacreSubscribed GestureSetSubscription(id object, NSString* type, BOOL on, std::string* error) {
  if (![object isKindOfClass:UIGestureRecognizer.class]) return false;
  UIGestureRecognizer* recognizer = (UIGestureRecognizer*)object;
  if ([type isEqualToString:@"beforebegin"]) {
    if (on) {
      NacreGestureDelegate* mine = GestureDelegateFor(recognizer, @"beforebegin", error);
      if (mine != nil) mine.asksBegin = YES;
    } else {
      NacreGestureDelegate* mine = objc_getAssociatedObject(recognizer, kNacreGestureDelegateKey);
      mine.asksBegin = NO;
      GestureDelegateTrim(recognizer);
    }
    return true;
  }
  if (![@[@"began", @"changed", @"ended", @"cancelled"] containsObject:type]) {
    return NacreSubscribed::UnknownEvent;
  }
  NacreGestureTarget* hop = objc_getAssociatedObject(recognizer, kNacreGestureTargetKey);
  if (on) {
    if (hop == nil) {
      hop = [NacreGestureTarget new];
      hop.types = [NSMutableSet set];
      [recognizer addTarget:hop action:@selector(fire:)];
      objc_setAssociatedObject(recognizer, kNacreGestureTargetKey, hop,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    [hop.types addObject:type];
  } else if (hop != nil) {
    [hop.types removeObject:type];
    if (hop.types.count == 0) {
      [recognizer removeTarget:hop action:@selector(fire:)];
      objc_setAssociatedObject(recognizer, kNacreGestureTargetKey, nil,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
  }
  return true;
}

// ---- 属性 ----
static id ReadGestureProperty(id object, NSString* key) {
  if (![object isKindOfClass:UIGestureRecognizer.class]) return nil;
  UIGestureRecognizer* r = (UIGestureRecognizer*)object;
  if ([key isEqualToString:@"state"]) return NameForGestureState(r.state);
  if ([key isEqualToString:@"isEnabled"]) return @(r.isEnabled);
  if ([key isEqualToString:@"cancelsTouchesInView"]) return @(r.cancelsTouchesInView);
  if ([key isEqualToString:@"delaysTouchesBegan"]) return @(r.delaysTouchesBegan);
  if ([key isEqualToString:@"delaysTouchesEnded"]) return @(r.delaysTouchesEnded);
  if ([key isEqualToString:@"numberOfTouches"]) return @(r.numberOfTouches);

  if ([r isKindOfClass:UITapGestureRecognizer.class]) {
    UITapGestureRecognizer* tap = (UITapGestureRecognizer*)r;
    if ([key isEqualToString:@"numberOfTapsRequired"]) return @(tap.numberOfTapsRequired);
    if ([key isEqualToString:@"numberOfTouchesRequired"]) {
      return @(tap.numberOfTouchesRequired);
    }
  }
  if ([r isKindOfClass:UILongPressGestureRecognizer.class]) {
    UILongPressGestureRecognizer* press = (UILongPressGestureRecognizer*)r;
    if ([key isEqualToString:@"minimumPressDuration"]) return @(press.minimumPressDuration);
    if ([key isEqualToString:@"allowableMovement"]) return @(press.allowableMovement);
    if ([key isEqualToString:@"numberOfTapsRequired"]) return @(press.numberOfTapsRequired);
    if ([key isEqualToString:@"numberOfTouchesRequired"]) {
      return @(press.numberOfTouchesRequired);
    }
  }
  if ([r isKindOfClass:UIPanGestureRecognizer.class]) {
    UIPanGestureRecognizer* pan = (UIPanGestureRecognizer*)r;
    if ([key isEqualToString:@"minimumNumberOfTouches"]) return @(pan.minimumNumberOfTouches);
    if ([key isEqualToString:@"maximumNumberOfTouches"]) return @(pan.maximumNumberOfTouches);
    if ([key isEqualToString:@"allowedScrollTypesMask"]) {
      return NamesInGestureScrollTypeMask(pan.allowedScrollTypesMask);
    }
  }
  if ([r isKindOfClass:UIScreenEdgePanGestureRecognizer.class]) {
    if ([key isEqualToString:@"edges"]) {
      return NamesInGestureRectEdge(((UIScreenEdgePanGestureRecognizer*)r).edges);
    }
  }
  if ([r isKindOfClass:UIPinchGestureRecognizer.class]) {
    UIPinchGestureRecognizer* pinch = (UIPinchGestureRecognizer*)r;
    if ([key isEqualToString:@"scale"]) return @(pinch.scale);
    if ([key isEqualToString:@"velocity"]) return @(pinch.velocity);
  }
  if ([r isKindOfClass:UIRotationGestureRecognizer.class]) {
    UIRotationGestureRecognizer* turn = (UIRotationGestureRecognizer*)r;
    if ([key isEqualToString:@"rotation"]) return @(turn.rotation);
    if ([key isEqualToString:@"velocity"]) return @(turn.velocity);
  }
  if ([r isKindOfClass:UISwipeGestureRecognizer.class]) {
    UISwipeGestureRecognizer* swipe = (UISwipeGestureRecognizer*)r;
    if ([key isEqualToString:@"numberOfTouchesRequired"]) {
      return @(swipe.numberOfTouchesRequired);
    }
    if ([key isEqualToString:@"direction"]) {
      return NamesInGestureSwipeDirection(swipe.direction);
    }
  }
  return nil;
}

// 取值范围的检查。类型已经由 Require* 把过关了，这里只管「不能是负数」
// ——那是范围的问题，不是类型的问题，所以单独一句报错。
// 注意这两个函数返回 true 表示**值可用**，不能在里面用 NACRE_NUM 那几个宏
// （宏失败时让所在函数返回「真」，在这里意思正好反了）
static bool CountValue(NSString* key, id value, NSUInteger* out, std::string* error) {
  if (!RequireInteger(value, key, error)) return false;
  double d = SafeNumber(value);
  if (d < 0) {
    *error = [NSString stringWithFormat:@"%@ must be a non-negative integer", key].UTF8String;
    return false;
  }
  *out = (NSUInteger)d;
  return true;
}

static bool AmountValue(NSString* key, id value, double* out, std::string* error) {
  if (!RequireNumber(value, key, error)) return false;
  double d = SafeNumber(value);
  if (d < 0) {
    *error = [NSString stringWithFormat:@"%@ must be a non-negative number", key].UTF8String;
    return false;
  }
  *out = d;
  return true;
}

// 位掩码的取值：字符串数组 → 数值。「不是数组」和「名字不认识」是两种错，
// 分开报，后一种把可选的名字列全。返回 true 表示值可用
template <class Mask>
static bool MaskValue(BOOL (*fromNames)(id, Mask*, id*), NSString* choices, NSString* key,
                      id value, Mask* out, std::string* error) {
  id bad = nil;
  if (fromNames(value, out, &bad)) return true;
  *error = bad != nil
               ? EnumError(key, bad, choices)
               : [NSString stringWithFormat:@"%@ needs an array of names; expected any of: %@",
                                            key, choices].UTF8String;
  return false;
}

static BOOL WriteGestureProperty(id object, NSString* key, id value, std::string* error) {
  if (![object isKindOfClass:UIGestureRecognizer.class]) return NO;
  UIGestureRecognizer* r = (UIGestureRecognizer*)object;
  if ([key isEqualToString:@"isEnabled"]) { r.enabled = NACRE_BOOL(value, key); return YES; }
  if ([key isEqualToString:@"cancelsTouchesInView"]) {
    r.cancelsTouchesInView = NACRE_BOOL(value, key);
    return YES;
  }
  if ([key isEqualToString:@"delaysTouchesBegan"]) {
    r.delaysTouchesBegan = NACRE_BOOL(value, key);
    return YES;
  }
  if ([key isEqualToString:@"delaysTouchesEnded"]) {
    r.delaysTouchesEnded = NACRE_BOOL(value, key);
    return YES;
  }

  if ([r isKindOfClass:UITapGestureRecognizer.class]) {
    UITapGestureRecognizer* tap = (UITapGestureRecognizer*)r;
    NSUInteger n = 0;
    if ([key isEqualToString:@"numberOfTapsRequired"]) {
      if (CountValue(key, value, &n, error)) tap.numberOfTapsRequired = n;
      return YES;
    }
    if ([key isEqualToString:@"numberOfTouchesRequired"]) {
      if (CountValue(key, value, &n, error)) tap.numberOfTouchesRequired = n;
      return YES;
    }
  }
  if ([r isKindOfClass:UILongPressGestureRecognizer.class]) {
    UILongPressGestureRecognizer* press = (UILongPressGestureRecognizer*)r;
    NSUInteger n = 0;
    double amount = 0;
    if ([key isEqualToString:@"minimumPressDuration"]) {
      if (AmountValue(key, value, &amount, error)) press.minimumPressDuration = amount;
      return YES;
    }
    if ([key isEqualToString:@"allowableMovement"]) {
      if (AmountValue(key, value, &amount, error)) press.allowableMovement = amount;
      return YES;
    }
    if ([key isEqualToString:@"numberOfTapsRequired"]) {
      if (CountValue(key, value, &n, error)) press.numberOfTapsRequired = n;
      return YES;
    }
    if ([key isEqualToString:@"numberOfTouchesRequired"]) {
      if (CountValue(key, value, &n, error)) press.numberOfTouchesRequired = n;
      return YES;
    }
  }
  if ([r isKindOfClass:UIPanGestureRecognizer.class]) {
    UIPanGestureRecognizer* pan = (UIPanGestureRecognizer*)r;
    NSUInteger n = 0;
    // 实测 UIKit 不检查最少和最多谁大谁小（最少 3、最多 2 照样收下），这里也不拦
    if ([key isEqualToString:@"minimumNumberOfTouches"]) {
      if (CountValue(key, value, &n, error)) pan.minimumNumberOfTouches = n;
      return YES;
    }
    if ([key isEqualToString:@"maximumNumberOfTouches"]) {
      if (CountValue(key, value, &n, error)) pan.maximumNumberOfTouches = n;
      return YES;
    }
    if ([key isEqualToString:@"allowedScrollTypesMask"]) {
      UIScrollTypeMask mask;
      if (MaskValue(GestureScrollTypeMaskFromNames, NamesForGestureScrollTypeMask(), key,
                    value, &mask, error)) {
        pan.allowedScrollTypesMask = mask;
      }
      return YES;
    }
  }
  if ([r isKindOfClass:UIScreenEdgePanGestureRecognizer.class]) {
    if ([key isEqualToString:@"edges"]) {
      UIRectEdge mask;
      if (MaskValue(GestureRectEdgeFromNames, NamesForGestureRectEdge(), key, value, &mask,
                    error)) {
        ((UIScreenEdgePanGestureRecognizer*)r).edges = mask;
      }
      return YES;
    }
  }
  // scale 和 rotation 不设范围：实测 UIKit 收下 0 和负数，原样读得回来
  if ([r isKindOfClass:UIPinchGestureRecognizer.class]) {
    if ([key isEqualToString:@"scale"]) {
      ((UIPinchGestureRecognizer*)r).scale = NACRE_NUM(value, key);
      return YES;
    }
  }
  if ([r isKindOfClass:UIRotationGestureRecognizer.class]) {
    if ([key isEqualToString:@"rotation"]) {
      ((UIRotationGestureRecognizer*)r).rotation = NACRE_NUM(value, key);
      return YES;
    }
  }
  if ([r isKindOfClass:UISwipeGestureRecognizer.class]) {
    UISwipeGestureRecognizer* swipe = (UISwipeGestureRecognizer*)r;
    NSUInteger n = 0;
    if ([key isEqualToString:@"numberOfTouchesRequired"]) {
      if (CountValue(key, value, &n, error)) swipe.numberOfTouchesRequired = n;
      return YES;
    }
    // 实测 UIKit 收下空的方向（数值 0），所以空数组不拦
    if ([key isEqualToString:@"direction"]) {
      UISwipeGestureRecognizerDirection mask;
      if (MaskValue(GestureSwipeDirectionFromNames, NamesForGestureSwipeDirection(), key,
                    value, &mask, error)) {
        swipe.direction = mask;
      }
      return YES;
    }
  }
  return NO;
}

// 识别器挂在哪个视图上。回边，不是持有（头文件里这个属性是 readonly，
// 视图那一侧才是强持有）
static nacre::NativeObjectRef ReadGestureObjectProperty(id object, const std::string& name) {
  if (![object isKindOfClass:UIGestureRecognizer.class]) return {};
  if (name == "view") {
    return {NacreKeep(((UIGestureRecognizer*)object).view), "UIView"};
  }
  return {};
}

static void ReadGestureObjectArray(id object, const std::string& name,
                                   std::vector<nacre::NativeObjectRef>& refs) {
  if ([object isKindOfClass:UIGestureRecognizer.class] && name == "recognizesSimultaneouslyWith") {
    NacreGestureDelegate* mine = objc_getAssociatedObject(object, kNacreGestureDelegateKey);
    for (UIGestureRecognizer* r in mine.simultaneous.allObjects) {
      refs.push_back({NacreKeep(r), GestureClassName(r)});
    }
    return;
  }
  if ([object isKindOfClass:UIView.class] && name == "gestureRecognizers") {
    for (UIGestureRecognizer* r in ((UIView*)object).gestureRecognizers) {
      refs.push_back({NacreKeep(r), GestureClassName(r)});
    }
  }
}

// 写 recognizesSimultaneouslyWith。每一项都要是识别器；空数组把这件事摘掉
static bool WriteGestureObjectArray(id object, const std::string& name,
                                    const std::vector<void*>& values, std::string* error) {
  if (![object isKindOfClass:UIGestureRecognizer.class] || name != "recognizesSimultaneouslyWith") {
    return false;
  }
  UIGestureRecognizer* recognizer = (UIGestureRecognizer*)object;
  for (void* p : values) {
    if (![(__bridge id)p isKindOfClass:UIGestureRecognizer.class]) {
      *error = "recognizesSimultaneouslyWith needs an array of UIGestureRecognizer";
      return true;
    }
  }
  NacreGestureDelegate* mine = objc_getAssociatedObject(recognizer, kNacreGestureDelegateKey);
  if (values.empty() && mine == nil) return true;
  if (mine == nil || recognizer.delegate != mine) {
    mine = GestureDelegateFor(recognizer, @"recognizesSimultaneouslyWith", error);
    if (mine == nil) return true;
  }
  [mine.simultaneous removeAllObjects];
  for (void* p : values) [mine.simultaneous addObject:(__bridge UIGestureRecognizer*)p];
  GestureDelegateTrim(recognizer);
  return true;
}

// ---- 方法 ----
// 取参带错误出口：给的不是识别器就填一句话，不当 nil 吞掉
static UIGestureRecognizer* gestureArg(const NacreArgs& args, size_t i, NSString* sel,
                                       std::string* error) {
  id given = args.object(i);
  if ([given isKindOfClass:UIGestureRecognizer.class]) return (UIGestureRecognizer*)given;
  *error = [NSString stringWithFormat:@"%@ needs a UIGestureRecognizer",
                                      [sel stringByReplacingOccurrencesOfString:@":"
                                                                     withString:@""]]
               .UTF8String;
  return nil;
}

// 可以是 null 的视图参数（translationInView: 那一组，nil 表示窗口的坐标系）。
// 照 Web IDL：null 和 undefined 是 nil；给了别的东西——数、字符串、不是视图的
// 原生对象——就填报错，不当成 nil 吞掉。返回 false 表示参数不可用
static bool optionalViewArg(const NacreArgs& args, size_t i, NSString* sel, UIView** out,
                            std::string* error) {
  id given = args.object(i);
  id raw = args.value(i);
  if ([given isKindOfClass:UIView.class]) {
    *out = (UIView*)given;
    return true;
  }
  if (given == nil && (raw == nil || raw == NSNull.null)) {
    *out = nil;
    return true;
  }
  NSString* head = [sel componentsSeparatedByString:@":"].firstObject ?: sel;
  ObjectTypeError(head.UTF8String, "UIView", true, error);
  return false;
}

// 视图上的：挂和摘
static bool GestureCallViewMethod(UIView* view, NSString* sel, const NacreArgs& args,
                                  std::string* out, std::string* error) {
  if ([sel isEqualToString:@"addGestureRecognizer:"]) {
    if (UIGestureRecognizer* r = gestureArg(args, 0, sel, error)) {
      [view addGestureRecognizer:r];
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"removeGestureRecognizer:"]) {
    if (UIGestureRecognizer* r = gestureArg(args, 0, sel, error)) {
      [view removeGestureRecognizer:r];
    }
    *out = "null";
    return true;
  }
  return false;
}

// 识别器自己的
static bool GestureCallRecognizerMethod(UIGestureRecognizer* recognizer, NSString* sel,
                                        const NacreArgs& args, std::string* out,
                                        std::string* error) {
  // nacre:ownership-exempt requireGestureRecognizerToFail: —— 实测两边都不持有对方：建了关系之后放掉任何一个，它都当场释放
  if ([sel isEqualToString:@"requireGestureRecognizerToFail:"]) {
    if (UIGestureRecognizer* other = gestureArg(args, 0, sel, error)) {
      [recognizer requireGestureRecognizerToFail:other];
    }
    *out = "null";
    return true;
  }

  if (![recognizer isKindOfClass:UIPanGestureRecognizer.class]) return false;
  UIPanGestureRecognizer* pan = (UIPanGestureRecognizer*)recognizer;
  // nacre:ownership-exempt translationInView: —— 只拿视图的坐标系来换算，不持有
  if ([sel isEqualToString:@"translationInView:"]) {
    UIView* view = nil;
    // 参数不可用时也给一个合法的返回值占位：引擎看到 error 就抛，不会用它
    *out = "null";
    if (optionalViewArg(args, 0, sel, &view, error)) {
      *out = EncodeJSON(PointToJSON([pan translationInView:view]));
    }
    return true;
  }
  // nacre:ownership-exempt velocityInView: —— 只拿视图的坐标系来换算，不持有
  if ([sel isEqualToString:@"velocityInView:"]) {
    UIView* view = nil;
    // 参数不可用时也给一个合法的返回值占位：引擎看到 error 就抛，不会用它
    *out = "null";
    if (optionalViewArg(args, 0, sel, &view, error)) {
      *out = EncodeJSON(PointToJSON([pan velocityInView:view]));
    }
    return true;
  }
  // nacre:ownership-exempt setTranslation:inView: —— 只拿视图的坐标系来换算，不持有
  if ([sel isEqualToString:@"setTranslation:inView:"]) {
    UIView* view = nil;
    if (optionalViewArg(args, 1, sel, &view, error)) {
      [pan setTranslation:JSONToPoint(args.value(0)) inView:view];
    }
    *out = "null";
    return true;
  }
  return false;
}

static bool GestureCallMethod(id object, NSString* sel, const NacreArgs& args,
                              std::string* out, std::string* error) {
  if ([object isKindOfClass:UIView.class]) {
    return GestureCallViewMethod((UIView*)object, sel, args, out, error);
  }
  if ([object isKindOfClass:UIGestureRecognizer.class]) {
    return GestureCallRecognizerMethod((UIGestureRecognizer*)object, sel, args, out, error);
  }
  return false;
}

}  // namespace nacre_bridge

// ---- 登记 ----
// 列了 UIView：gestureRecognizers、addGestureRecognizer:、
// removeGestureRecognizer: 是 UIView 的成员，由这个域认领
@interface NacreGestureDomain : NSObject
@end
@implementation NacreGestureDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "gesture";
  d.classes = {UIGestureRecognizer.class, UIView.class};
  d.read = nacre_bridge::ReadGestureProperty;
  d.write = nacre_bridge::WriteGestureProperty;
  d.readObject = nacre_bridge::ReadGestureObjectProperty;
  d.readObjectArray = nacre_bridge::ReadGestureObjectArray;
  d.writeObjectArray = nacre_bridge::WriteGestureObjectArray;
  d.call = nacre_bridge::GestureCallMethod;
  d.construct = nacre_bridge::GestureConstruct;
  d.subscribe = nacre_bridge::GestureSetSubscription;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
