// 手势识别器：UIGestureRecognizer、UITapGestureRecognizer、
// UILongPressGestureRecognizer，以及 UIView 上挂/摘识别器的那三个成员。
//
// 一个域一个文件，装它在所有通道上的分支；每个入口返回「认不认领」。
// 这个文件**不认识 NacreRuntime**，事件走订阅时塞进来的 emit 块出去
// ——和 WebSocket 一个路子，免得 NacreRuntime.mm 再长。

#import "NacreBridge.h"

#import <objc/runtime.h>

// 关联对象的 key：识别器 → NacreGestureTarget。
// 识别器的 addTarget:action: 不持有 target，所以靠这个关联让它活着
static const void* kNacreGestureTargetKey = &kNacreGestureTargetKey;

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

const char* GestureClassName(UIGestureRecognizer* recognizer) {
  if ([recognizer isKindOfClass:UITapGestureRecognizer.class]) {
    return "UITapGestureRecognizer";
  }
  if ([recognizer isKindOfClass:UILongPressGestureRecognizer.class]) {
    return "UILongPressGestureRecognizer";
  }
  // 系统自带的那些（滚动视图的拖动识别器之类）落到这里，按基类包装
  return "UIGestureRecognizer";
}

}  // namespace nacre_bridge

// 手势的 trampoline。和控件事件同一个做法：运行时自己当 target，
// **不持有任何 JS 函数**，只记订阅了哪几个事件名。
//
// 事件带 location 和 numberOfTouches，因为回头读不到：头文件写着 action 在
// 「下一轮 run loop」才调、调完识别器就重置成 possible，而我们的事件还要
// 再延后一轮——JS 拿到事件时识别器上的状态和触点都已经清掉了。
@implementation NacreGestureTarget

- (void)fire:(UIGestureRecognizer*)sender {
  NacreGestureEmit emit = self.emit;
  if (emit == nil) return;
  NSString* type = nacre_bridge::GestureEventNameForState(sender.state);
  if (type == nil || ![self.types containsObject:type]) return;
  // 位置按识别器所在视图的坐标系给。要别的坐标系，JS 侧用 convertPoint
  CGPoint p = [sender locationInView:sender.view];
  NSString* location = (isfinite(p.x) && isfinite(p.y))
                           ? [NSString stringWithFormat:@"{\"x\":%.6f,\"y\":%.6f}", p.x, p.y]
                           : @"null";
  NSString* json =
      [NSString stringWithFormat:@"{\"location\":%@,\"numberOfTouches\":%lu}",
                                 location, (unsigned long)sender.numberOfTouches];
  emit(sender, type, json);
}

@end

namespace nacre_bridge {

// ---- 构造 ----
// 基类不给构造：UIGestureRecognizer 自己什么手势都不认
nacre::NativeObjectRef GestureConstruct(const std::string& className) {
  UIGestureRecognizer* recognizer = nil;
  if (className == "UITapGestureRecognizer") {
    recognizer = [[UITapGestureRecognizer alloc] init];
  } else if (className == "UILongPressGestureRecognizer") {
    recognizer = [[UILongPressGestureRecognizer alloc] init];
  }
  if (recognizer == nil) return {};
  return {(void*)CFAutorelease(CFBridgingRetain(recognizer)), className};
}

// ---- 订阅 ----
// 惰性：第一个事件名有监听器时才 addTarget，最后一个移走时 removeTarget。
// 没有监听器的识别器照样在识别（也照样会按 cancelsTouchesInView 取消
// 视图的触摸）——那是 UIKit 的事，和有没有人听无关
bool GestureSetSubscription(id object, NSString* type, BOOL on, NacreGestureEmit emit,
                            std::string* error) {
  if (![object isKindOfClass:UIGestureRecognizer.class]) return false;
  UIGestureRecognizer* recognizer = (UIGestureRecognizer*)object;
  if (![@[@"began", @"changed", @"ended", @"cancelled"] containsObject:type]) {
    *error = EnumError(@"addEventListener", type, kGestureEventNames);
    return true;
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
    hop.emit = emit;
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
id ReadGestureProperty(id object, NSString* key) {
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

BOOL WriteGestureProperty(id object, NSString* key, id value, std::string* error) {
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
  return NO;
}

// 识别器挂在哪个视图上。回边，不是持有（头文件里这个属性是 readonly，
// 视图那一侧才是强持有）
nacre::NativeObjectRef ReadGestureObjectProperty(id object, const std::string& name) {
  if (![object isKindOfClass:UIGestureRecognizer.class]) return {};
  if (name == "view") {
    return {NacreKeep(((UIGestureRecognizer*)object).view), "UIView"};
  }
  return {};
}

void ReadGestureObjectArray(id object, const std::string& name,
                            std::vector<nacre::NativeObjectRef>& refs) {
  if ([object isKindOfClass:UIView.class] && name == "gestureRecognizers") {
    for (UIGestureRecognizer* r in ((UIView*)object).gestureRecognizers) {
      refs.push_back({NacreKeep(r), GestureClassName(r)});
    }
  }
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

bool GestureCallMethod(id object, NSString* sel, const NacreArgs& args,
                       std::string* out, std::string* error) {
  if (![object isKindOfClass:UIView.class]) return false;
  UIView* view = (UIView*)object;
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

}  // namespace nacre_bridge
