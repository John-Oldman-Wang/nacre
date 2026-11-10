// 造对象：类方法和构造。
//
// 和 NacreMethods.mm 分开，是因为这是两个能力域——「造一个东西」和「对已有
// 的东西做事」。改动单元也不一样：加一个新类要动这里，给已有的类加方法不用。
#import "NacreBridge.h"

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
      for (void* ptr : argPtrs) {
        id c = (__bridge id)ptr;
        if ([c isKindOfClass:NSLayoutConstraint.class]) [list addObject:c];
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
                  fixedSpaceItemOfWidth:[arg(0) doubleValue]],
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
      font = [UIFont systemFontOfSize:[arg(0) doubleValue]];
    } else if ([sel isEqualToString:@"boldSystemFontOfSize:"]) {
      font = [UIFont boldSystemFontOfSize:[arg(0) doubleValue]];
    } else if ([sel isEqualToString:@"italicSystemFontOfSize:"]) {
      font = [UIFont italicSystemFontOfSize:[arg(0) doubleValue]];
    } else if ([sel isEqualToString:@"systemFontOfSize:weight:"]) {
      UIFontWeight w;
      if (!weight(1, &w)) return {};
      font = [UIFont systemFontOfSize:[arg(0) doubleValue] weight:w];
    } else if ([sel isEqualToString:@"monospacedSystemFontOfSize:weight:"]) {
      UIFontWeight w;
      if (!weight(1, &w)) return {};
      font = [UIFont monospacedSystemFontOfSize:[arg(0) doubleValue] weight:w];
    } else if ([sel isEqualToString:@"monospacedDigitSystemFontOfSize:weight:"]) {
      UIFontWeight w;
      if (!weight(1, &w)) return {};
      font = [UIFont monospacedDigitSystemFontOfSize:[arg(0) doubleValue] weight:w];
    } else if ([sel isEqualToString:@"fontWithName:size:"]) {
      NSString* fontName = [arg(0) isKindOfClass:NSString.class] ? arg(0) : nil;
      if (fontName == nil) return {};
      font = [UIFont fontWithName:fontName size:[arg(1) doubleValue]];
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
        *error = "imageNamed 需要一个字符串名字";
        return {};
      }
      image = [UIImage imageNamed:text];
    } else if ([sel isEqualToString:@"systemImageNamed:"]) {
      if (text == nil) {
        *error = "systemImageNamed 需要一个字符串名字";
        return {};
      }
      image = [UIImage systemImageNamed:text];
    } else if ([sel isEqualToString:@"imageWithContentsOfFile:"]) {
      if (text == nil) {
        *error = "imageWithContentsOfFile 需要一个字符串路径";
        return {};
      }
      image = [UIImage imageWithContentsOfFile:text];
    } else if ([sel isEqualToString:@"imageWithData:"] ||
               [sel isEqualToString:@"imageWithData:scale:"]) {
      // 字节来自 Blob，全程不进 V8 堆——fetch 下来的图直接上屏走这条
      id source = argPtrs.empty() ? nil : (__bridge id)argPtrs[0];
      if (![source isKindOfClass:NacreBlob.class]) {
        *error = "imageWithData 需要一个 Blob";
        return {};
      }
      NSData* data = ((NacreBlob*)source).data;
      if ([sel isEqualToString:@"imageWithData:scale:"]) {
        double scale = [arg(1) doubleValue];
        image = [UIImage imageWithData:data scale:scale > 0 ? scale : 1.0];
      } else {
        image = [UIImage imageWithData:data];
      }
    }
    if (image == nil) return {};
    return {(__bridge void*)image, "UIImage"};
  }
  return {};
}

// JS 发起的构造。
// ARC 会在本函数返回时释放局部变量，而调用方要到返回之后才 retain——
// 中间这一瞬对象就没了。CFAutorelease 把它交给当前 run loop 轮次的
// 自动释放池，撑到调用方 retain 为止。
nacre::NativeObjectRef ConstructNative(const std::string& className,
                                       const std::vector<void*>& args) {
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
  }
  if (object == nil) return {};
  return {(void*)CFAutorelease(CFBridgingRetain(object)), className};
}

}  // namespace nacre_bridge
