// 造对象：类方法和构造。
//
// 和 NacreMethods.mm 分开，是因为这是两个能力域——「造一个东西」和「对已有
// 的东西做事」。改动单元也不一样：加一个新类要动这里，给已有的类加方法不用。
#import "NacreBridge.h"
#import <objc/runtime.h>

const void* kNacreDisplayLinkTargetKey = &kNacreDisplayLinkTargetKey;

namespace nacre_bridge {

nacre::NativeObjectRef CallClassObjectMethod(const std::string& className,
                                             const std::string& name,
                                             const std::string& argsJSON,
                                             const std::vector<void*>& argPtrs,
                                             std::string* error) {
  NSString* sel = @(name.c_str());
  id decoded = DecodeJSON(argsJSON);
  NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  auto arg = [&](NSUInteger i) -> id { return i < args.count ? args[i] : nil; };
  // 字重查不到就填错误并退出。注意和「返回 nil」要分开：fontWithName
  // 找不到字体是合法答案（JS 得到 null），字重写错了是调用方的错。
  // 下标显式传，不写死 1——换个 selector 字重未必还在同一位。
  auto weight = [&](NSUInteger i, UIFontWeight* out) {
    if (FontWeightFromName(arg(i), out)) return true;
    *error = EnumError(@"weight", arg(i), NamesForFontWeight());
    return false;
  };

  // 触感反馈的工厂在 NacreFeedback.mm，它自己说认不认领
  {
    nacre::NativeObjectRef made;
    if (FeedbackClassCall(className, sel, args, argPtrs, &made, error)) return made;
  }

  // 按 spec 造一个颜色。spec 已经由 JS 侧的解析器规范化过
  if (className == "UIColor" && [sel isEqualToString:@"nacreFromSpec"]) {
    UIColor* color = ColorFromSpec(arg(0));
    if (color == nil) {
      *error = "cannot build a color from this specification";
      return {};
    }
    return {(void*)CFAutorelease(CFBridgingRetain(color)), "UIColor"};
  }

  // 批量激活/停用。约束按「每个参数一个对象」传过来（argPtrs 本来就是
  // 一维的句柄数组），所以不用为「数组参数」另开一条通道。
  // 批量比逐个 isActive = true 好的地方是中间态不会短暂地不可满足。
  if (className == "NSLayoutConstraint") {
    BOOL activate = [sel isEqualToString:@"activateConstraints:"];
    if (activate || [sel isEqualToString:@"deactivateConstraints:"]) {
      NSMutableArray<NSLayoutConstraint*>* list = [NSMutableArray array];
      // 数组里每一项都得是约束。以前不是约束的被悄悄过滤掉，
      // activateConstraints([1, 2, 3]) 什么都不发生也不报错
      for (void* ptr : argPtrs) {
        id c = (__bridge id)ptr;
        if (![c isKindOfClass:NSLayoutConstraint.class]) {
          ObjectTypeError(activate ? "activateConstraints" : "deactivateConstraints",
                          "list of NSLayoutConstraint", false, error);
          return {};
        }
        [list addObject:c];
      }
      @try {
        if (activate) {
          [NSLayoutConstraint activateConstraints:list];
        } else {
          [NSLayoutConstraint deactivateConstraints:list];
        }
      } @catch (NSException* e) {
        *error = [NSString stringWithFormat:@"failed to activate constraint: %@", e.reason].UTF8String;
      }
      return {};
    }
  }

  // systemItem 只能在 init 里给（没有对应的可写属性），所以走类方法这条路。
  // target/action 留空——订阅通道会在第一个监听器挂上时接管它们
  if (className == "UIBarButtonItem") {
    if ([sel isEqualToString:@"systemItemWithName:"]) {
      UIBarButtonSystemItem systemItem;
      if (!BarButtonSystemItemFromName(arg(0), &systemItem)) {
        *error = EnumError(@"systemItem", arg(0), NamesForBarButtonSystemItem());
        return {};
      }
      UIBarButtonItem* made =
          [[UIBarButtonItem alloc] initWithBarButtonSystemItem:systemItem
                                                        target:nil
                                                        action:nil];
      // 自己 alloc 的要 CFAutorelease，不然出了这个语句 ARC 就放掉它，
      // WrapNative 再 retain 就是野指针。UIKit 那些类方法返回的本来就在
      // 自动释放池里，所以它们直接 __bridge 没问题
      return {(void*)CFAutorelease(CFBridgingRetain(made)), "UIBarButtonItem"};
    }
    if ([sel isEqualToString:@"flexibleSpaceItem"]) {
      return {(__bridge void*)[UIBarButtonItem flexibleSpaceItem], "UIBarButtonItem"};
    }
    if ([sel isEqualToString:@"fixedSpaceItemOfWidth:"]) {
      return {(__bridge void*)[UIBarButtonItem
                  fixedSpaceItemOfWidth:NACRE_NUM(arg(0), sel)],
              "UIBarButtonItem"};
    }
  }

  if (className == "UIButton" && [sel isEqualToString:@"buttonWithType:"]) {
    UIButtonType type;
    if (!ButtonTypeFromName(arg(0), &type)) {
      *error = EnumError(@"buttonType", arg(0), NamesForButtonType());
      return {};
    }
    return {(__bridge void*)[UIButton buttonWithType:type], "UIButton"};
  }

  if (className == "UIFont") {
    UIFont* font = nil;
    if ([sel isEqualToString:@"systemFontOfSize:"]) {
      font = [UIFont systemFontOfSize:NACRE_NUM(arg(0), sel)];
    } else if ([sel isEqualToString:@"boldSystemFontOfSize:"]) {
      font = [UIFont boldSystemFontOfSize:NACRE_NUM(arg(0), sel)];
    } else if ([sel isEqualToString:@"italicSystemFontOfSize:"]) {
      font = [UIFont italicSystemFontOfSize:NACRE_NUM(arg(0), sel)];
    } else if ([sel isEqualToString:@"systemFontOfSize:weight:"]) {
      UIFontWeight w;
      if (!weight(1, &w)) return {};
      font = [UIFont systemFontOfSize:NACRE_NUM(arg(0), sel) weight:w];
    } else if ([sel isEqualToString:@"monospacedSystemFontOfSize:weight:"]) {
      UIFontWeight w;
      if (!weight(1, &w)) return {};
      font = [UIFont monospacedSystemFontOfSize:NACRE_NUM(arg(0), sel) weight:w];
    } else if ([sel isEqualToString:@"monospacedDigitSystemFontOfSize:weight:"]) {
      UIFontWeight w;
      if (!weight(1, &w)) return {};
      font = [UIFont monospacedDigitSystemFontOfSize:NACRE_NUM(arg(0), sel) weight:w];
    } else if ([sel isEqualToString:@"fontWithName:size:"]) {
      NSString* fontName = [arg(0) isKindOfClass:NSString.class] ? arg(0) : nil;
      if (fontName == nil) return {};
      font = [UIFont fontWithName:fontName size:NACRE_NUM(arg(1), sel)];
    } else if ([sel isEqualToString:@"preferredFontForTextStyle:"]) {
      UIFontTextStyle style = TextStyleFromName(arg(0));
      if (style == nil) {
        *error = EnumError(@"textStyle", arg(0), NamesForTextStyle());
        return {};
      }
      font = [UIFont preferredFontForTextStyle:style];
    }
    if (font == nil) return {};
    return {(__bridge void*)font, "UIFont"};
  }

  // UIImage 的四条取图路径。返回 nil 是**合法答案**（名字不存在、文件读不到、
  // 字节解不出来），所以这里只在参数类型不对时才填 error。
  if (className == "UIImage") {
    UIImage* image = nil;
    NSString* text = [arg(0) isKindOfClass:NSString.class] ? arg(0) : nil;
    if ([sel isEqualToString:@"imageNamed:"]) {
      // Asset Catalog 和 bundle 里的普通文件都能命中，而且认子目录路径
      // （实测 'assets/logo' 可以，但不会递归搜）
      if (text == nil) {
        *error = "imageNamed needs a string name";
        return {};
      }
      image = [UIImage imageNamed:text];
    } else if ([sel isEqualToString:@"systemImageNamed:"]) {
      if (text == nil) {
        *error = "systemImageNamed needs a string name";
        return {};
      }
      image = [UIImage systemImageNamed:text];
    } else if ([sel isEqualToString:@"imageWithContentsOfFile:"]) {
      if (text == nil) {
        *error = "imageWithContentsOfFile needs a string path";
        return {};
      }
      image = [UIImage imageWithContentsOfFile:text];
    } else if ([sel isEqualToString:@"imageWithData:"] ||
               [sel isEqualToString:@"imageWithData:scale:"]) {
      // 字节来自 Blob，全程不进 V8 堆——fetch 下来的图直接上屏走这条
      id source = argPtrs.empty() ? nil : (__bridge id)argPtrs[0];
      if (![source isKindOfClass:NacreBlob.class]) {
        *error = "imageWithData needs a Blob";
        return {};
      }
      NSData* data = ((NacreBlob*)source).data;
      if ([sel isEqualToString:@"imageWithData:scale:"]) {
        double scale = NACRE_NUM(arg(1), sel);
        image = [UIImage imageWithData:data scale:scale > 0 ? scale : 1.0];
      } else {
        image = [UIImage imageWithData:data];
      }
    }
    if (image == nil) return {};
    return {(__bridge void*)image, "UIImage"};
  }

  // 时间曲线。两种来源：五个内置名字，或者四个控制点。
  // 不给 new：ObjC 的 initWithControlPoints 要四个浮点数，而构造通道
  // 只传对象句柄，传不了标量
  if (className == "CAMediaTimingFunction") {
    if ([sel isEqualToString:@"functionWithName:"]) {
      NSString* name = TimingFunctionNameFromName(arg(0));
      if (name == nil) {
        *error = EnumError(@"functionWithName", arg(0), NamesForTimingFunctionName());
        return {};
      }
      return {(__bridge void*)[CAMediaTimingFunction functionWithName:name],
              "CAMediaTimingFunction"};
    }
    if ([sel isEqualToString:@"functionWithControlPoints:"]) {
      return {(__bridge void*)[CAMediaTimingFunction
                  functionWithControlPoints:NACRE_NUM(arg(0), sel)
                                           :NACRE_NUM(arg(1), sel)
                                           :NACRE_NUM(arg(2), sel)
                                           :NACRE_NUM(arg(3), sel)],
              "CAMediaTimingFunction"};
    }
  }

  // 动画。keyPath 在这里就查表，错了当场报，不用等到设 toValue
  if ([sel isEqualToString:@"animationWithKeyPath:"] &&
      (className == "CABasicAnimation" || className == "CAKeyframeAnimation" ||
       className == "CASpringAnimation")) {
    NacreAnimValueKind kind;
    if (!AnimValueKindForKeyPath(arg(0), &kind)) {
      *error = EnumError(@"keyPath", arg(0), NamesForAnimationKeyPath());
      return {};
    }
    if (className == "CAKeyframeAnimation") {
      return {(__bridge void*)[CAKeyframeAnimation animationWithKeyPath:arg(0)],
              "CAKeyframeAnimation"};
    }
    if (className == "CASpringAnimation") {
      return {(__bridge void*)[CASpringAnimation animationWithKeyPath:arg(0)],
              "CASpringAnimation"};
    }
    return {(__bridge void*)[CABasicAnimation animationWithKeyPath:arg(0)],
            "CABasicAnimation"};
  }

  if (className == "CATransaction" && [sel isEqualToString:@"animationTimingFunction"]) {
    CAMediaTimingFunction* fn = [CATransaction animationTimingFunction];
    if (fn == nil) return {nullptr, "CAMediaTimingFunction"};
    return {(__bridge void*)fn, "CAMediaTimingFunction"};
  }

  // 路径的类工厂。角度是弧度，UIKit y 轴朝下所以 0 在正右方、增大是顺时针。
  // bezierPathWithCGPath: 不收——CGPathRef 还没有包装，和 CGColorRef 一样
  // 要单独定。
  if (className == "UIBezierPath") {
    if ([sel isEqualToString:@"bezierPathWithRect:"]) {
      return {(__bridge void*)[UIBezierPath bezierPathWithRect:JSONToRect(arg(0))],
              "UIBezierPath"};
    }
    if ([sel isEqualToString:@"bezierPathWithOvalInRect:"]) {
      return {(__bridge void*)[UIBezierPath bezierPathWithOvalInRect:JSONToRect(arg(0))],
              "UIBezierPath"};
    }
    if ([sel isEqualToString:@"bezierPathWithRoundedRect:cornerRadius:"]) {
      return {(__bridge void*)[UIBezierPath bezierPathWithRoundedRect:JSONToRect(arg(0))
                                                         cornerRadius:NACRE_NUM(arg(1), sel)],
              "UIBezierPath"};
    }
    if ([sel isEqualToString:@"bezierPathWithRoundedRect:byRoundingCorners:cornerRadii:"]) {
      UIRectCorner corners;
      id bad = nil;
      if (!RectCornerFromNames(arg(1), &corners, &bad)) {
        *error = bad != nil
                     ? EnumError(@"byRoundingCorners", bad, NamesForRectCorner())
                     : [NSString stringWithFormat:
                           @"byRoundingCorners needs an array of names; expected any of: %@",
                           NamesForRectCorner()].UTF8String;
        return {};
      }
      return {(__bridge void*)[UIBezierPath bezierPathWithRoundedRect:JSONToRect(arg(0))
                                                    byRoundingCorners:corners
                                                          cornerRadii:JSONToSize(arg(2))],
              "UIBezierPath"};
    }
    if ([sel isEqualToString:@"bezierPathWithArcCenter:radius:startAngle:endAngle:clockwise:"]) {
      return {(__bridge void*)[UIBezierPath bezierPathWithArcCenter:JSONToPoint(arg(0))
                                                             radius:NACRE_NUM(arg(1), sel)
                                                         startAngle:NACRE_NUM(arg(2), sel)
                                                           endAngle:NACRE_NUM(arg(3), sel)
                                                          clockwise:NACRE_BOOL(arg(4), sel)],
              "UIBezierPath"};
    }
  }
  return {};
}

// JS 发起的构造。
// ARC 会在本函数返回时释放局部变量，而调用方要到返回之后才 retain——
// 中间这一瞬对象就没了。CFAutorelease 把它交给当前 run loop 轮次的
// 自动释放池，撑到调用方 retain 为止。
nacre::NativeObjectRef ConstructNative(const std::string& className,
                                       const std::string& argsJSON,
                                       const std::vector<void*>& args) {
  // 标量参数在 argsJSON 里，对象按同样的下标在 args 里——和方法通道一个规则。
  // 现在只有少数类用得上（见下面取 scalar 的那几处），其余忽略它
  id decodedArgs = DecodeJSON(argsJSON);
  NSArray* values = [decodedArgs isKindOfClass:NSArray.class] ? decodedArgs : @[];
  auto scalar = [&](NSUInteger i) -> id { return i < values.count ? values[i] : nil; };
  id object = nil;
  if (className == "UIWindow") {
    id scene = args.empty() ? nil : (__bridge id)args[0];
    if (![scene isKindOfClass:UIWindowScene.class]) return {};
    object = [[UIWindow alloc] initWithWindowScene:(UIWindowScene*)scene];
  } else if (className == "UIViewController") {
    object = [[UIViewController alloc] init];
  } else if (className == "UIView") {
    object = [[UIView alloc] init];
  } else if (className == "UITextField") {
    object = [[UITextField alloc] init];
  } else if (className == "UILabel") {
    object = [[UILabel alloc] init];
  } else if (className == "UIImageView") {
    object = [[UIImageView alloc] init];
  } else if (className == "UIButton") {
    object = [[UIButton alloc] init];
  } else if (className == "UIControl") {
    object = [[UIControl alloc] init];
  } else if (className == "UIBarButtonItem") {
    // 三种口味：{ title }、{ systemItem }、{ customView }。target/action 这里
    // 不接，交给订阅通道（见 setSubscription:）——JS 侧统一走 addEventListener
    id first = args.empty() ? nil : (__bridge id)args[0];
    if ([first isKindOfClass:UIView.class]) {
      object = [[UIBarButtonItem alloc] initWithCustomView:(UIView*)first];
    } else {
      object = [[UIBarButtonItem alloc] init];
    }
  } else if (className == "UITabBarController") {
    object = [[UITabBarController alloc] init];
  } else if (className == "UITabBarItem") {
    object = [[UITabBarItem alloc] init];
  } else if (className == "UINavigationController") {
    id root = args.empty() ? nil : (__bridge id)args[0];
    if ([root isKindOfClass:UIViewController.class]) {
      // 同上：根页面如果正当着某个窗口的根，UIKit 会抛。构造这条通道没有
      // error 出参，所以只能接住返回空——JS 侧会因为拿不到句柄而抛
      @try {
        object = [[UINavigationController alloc] initWithRootViewController:root];
      } @catch (NSException* e) {
        object = nil;
      }
    } else {
      object = [[UINavigationController alloc] init];
    }
  } else if (className == "UIScrollView") {
    object = [[UIScrollView alloc] init];
  } else if (className == "UIStackView") {
    // initWithArrangedSubviews: 的数组按「每个参数一个句柄」传过来，
    // 和 activateConstraints: 一样，不用为数组参数另开通道
    NSMutableArray<UIView*>* views = [NSMutableArray array];
    for (void* ptr : args) {
      id v = (__bridge id)ptr;
      if ([v isKindOfClass:UIView.class]) [views addObject:v];
    }
    object = [[UIStackView alloc] initWithArrangedSubviews:views];
  } else if (className == "UILayoutGuide") {
    object = [[UILayoutGuide alloc] init];
  } else if (className == "CALayer") {
    object = [CALayer layer];
  } else if (className == "CAGradientLayer") {
    object = [CAGradientLayer layer];
  } else if (className == "CAShapeLayer") {
    object = [CAShapeLayer layer];
  } else if (className == "UIBezierPath") {
    object = [UIBezierPath bezierPath];
  } else if (className == "CABasicAnimation") {
    object = [CABasicAnimation animation];
  } else if (className == "CAKeyframeAnimation") {
    object = [CAKeyframeAnimation animation];
  } else if (className == "CASpringAnimation") {
    object = [CASpringAnimation animation];
  } else if (className == "CAAnimationGroup") {
    object = [CAAnimationGroup animation];
  } else if (className == "UITapGestureRecognizer" ||
             className == "UILongPressGestureRecognizer") {
    return GestureConstruct(className);
  } else if (className == "WebSocket") {
    // 第一个用上 argsJSON 的类：url 是字符串，options 是字典
    return WebSocketConstruct(scalar(0), scalar(1));
  } else if (className == "WebView") {
    return WebViewConstruct(scalar(0));
  } else if (className == "CADisplayLink") {
    // ObjC 只有 +displayLinkWithTarget:selector:，而 target / selector 在 JS
    // 里没有对应物，所以运行时自己当 target——和控件事件一个做法。
    // link 强持有 target，trampoline 反过来只弱引用，不成环
    NacreDisplayLinkTarget* hop = [NacreDisplayLinkTarget new];
    CADisplayLink* link = [CADisplayLink displayLinkWithTarget:hop
                                                      selector:@selector(tick:)];
    hop.link = link;
    objc_setAssociatedObject(link, kNacreDisplayLinkTargetKey, hop,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    object = link;
  }
  if (object == nil) return {};
  return {(void*)CFAutorelease(CFBridgingRetain(object)), className};
}

}  // namespace nacre_bridge
