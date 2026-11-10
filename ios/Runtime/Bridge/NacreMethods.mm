// 方法分发和构造。selector 是完整的 ObjC selector。

#import "NacreBridge.h"

#import <os/log.h>

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

void CallVoidMethod(id object, const std::string& name) {
  if ([object isKindOfClass:UIWindow.class]) {
    UIWindow* window = (UIWindow*)object;
    if (name == "makeKeyAndVisible") {
      [window makeKeyAndVisible];
    } else if (name == "makeKeyWindow") {
      [window makeKeyWindow];
    }
  }
}

// 带参数的方法。name 是完整的 ObjC selector（JS 层负责把
// 「第一段 + options」还原成 selector），所以这里的表和 Apple 文档一一对上。
// 对象参数在 args 里是 NSNull，真正的指针按同样的下标在 argPtrs 里。
// error 暂时没有填的地方：这些方法的参数里还没有枚举。通道先铺好，
// 到 NSLayoutConstraint 和 UIControlEvents 就用得上了。
std::string CallMethod(id object, const std::string& name, const std::string& argsJSON,
                       const std::vector<void*>& argPtrs, std::string* error) {
  // 本地存储在 NacreStorage.mm，它自己说认不认领
  std::string storageResult;
  if (StorageCallMethod(object, name, argsJSON, &storageResult, error)) return storageResult;
  // 颜色 → spec 在 NacrePropsResource.mm，同样的规矩
  std::string colorResult;
  if (ColorCallMethod(object, name, &colorResult)) return colorResult;

  NSString* sel = @(name.c_str());
  id decoded = DecodeJSON(argsJSON);
  NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  id result = nil;

  auto objectArg = [&](size_t i) -> id {
    return i < argPtrs.size() ? (__bridge id)argPtrs[i] : nil;
  };
  auto valueArg = [&](NSUInteger i) -> id { return i < args.count ? args[i] : nil; };
  auto viewArg = [&](size_t i) -> UIView* {
    id v = objectArg(i);
    return [v isKindOfClass:UIView.class] ? (UIView*)v : nil;
  };
  // 状态参数：字符串数组 → UIControlState。拿不到就填错误并返回 false
  auto stateArg = [&](NSUInteger i, UIControlState* out) {
    id given = i < args.count ? args[i] : nil;
    id bad = nil;
    if (ControlStateArgFromNames(given, out, &bad)) return true;
    *error = bad != nil
                 ? EnumError(@"forState", bad, NamesForControlStateArg())
                 : [NSString stringWithFormat:
                       @"forState needs an array of state names; expected any of: %@",
                       NamesForControlStateArg()].UTF8String;
    return false;
  };
  auto guideArg = [&](size_t i) -> UILayoutGuide* {
    id g = objectArg(i);
    return [g isKindOfClass:UILayoutGuide.class] ? (UILayoutGuide*)g : nil;
  };

  if ([object isKindOfClass:UIButton.class]) {
    UIButton* button = (UIButton*)object;
    auto colorArg = [&](size_t i) -> UIColor* {
      id c = i < argPtrs.size() ? (__bridge id)argPtrs[i] : nil;
      return [c isKindOfClass:UIColor.class] ? (UIColor*)c : nil;
    };
    auto imageArg = [&](size_t i) -> UIImage* {
      id m = i < argPtrs.size() ? (__bridge id)argPtrs[i] : nil;
      return [m isKindOfClass:UIImage.class] ? (UIImage*)m : nil;
    };
    UIControlState state;
    if ([sel isEqualToString:@"setTitle:forState:"]) {
      if (!stateArg(1, &state)) return "null";
      id title = args.count > 0 ? args[0] : nil;
      [button setTitle:[title isKindOfClass:NSString.class] ? title : nil forState:state];
      return "null";
    }
    if ([sel isEqualToString:@"setTitleColor:forState:"]) {
      if (!stateArg(1, &state)) return "null";
      [button setTitleColor:colorArg(0) forState:state];
      return "null";
    }
    if ([sel isEqualToString:@"setImage:forState:"]) {
      if (!stateArg(1, &state)) return "null";
      [button setImage:imageArg(0) forState:state];
      return "null";
    }
    if ([sel isEqualToString:@"setBackgroundImage:forState:"]) {
      if (!stateArg(1, &state)) return "null";
      [button setBackgroundImage:imageArg(0) forState:state];
      return "null";
    }
    if ([sel isEqualToString:@"titleForState:"]) {
      if (!stateArg(0, &state)) return "null";
      return EncodeJSON([button titleForState:state]);
    }
  }

  if ([object isKindOfClass:UINavigationController.class]) {
    UINavigationController* nav = (UINavigationController*)object;
    auto vcArg = [&](size_t i) -> UIViewController* {
      id v = objectArg(i);
      return [v isKindOfClass:UIViewController.class] ? (UIViewController*)v : nil;
    };
    BOOL animated = [valueArg(1) boolValue];
    if ([sel isEqualToString:@"pushViewController:animated:"]) {
      UIViewController* vc = vcArg(0);
      if (vc == nil) {
        *error = "pushViewController: expects a UIViewController";
        return "null";
      }
      // UIKit 会为「层级不一致」抛 ObjC 异常，最典型的是把一个正在当窗口根
      // 的 VC 塞进来（UIViewControllerHierarchyInconsistency）。不接住就是
      // 整个 App 死掉，而错误来自调用方——和约束激活同一个判据
      @try {
        [nav pushViewController:vc animated:animated];
      } @catch (NSException* e) {
        *error = [NSString stringWithFormat:@"pushViewController: %@", e.reason].UTF8String;
      }
      return "null";
    }
    if ([sel isEqualToString:@"setNavigationBarHidden:animated:"]) {
      [nav setNavigationBarHidden:[valueArg(0) boolValue] animated:animated];
      return "null";
    }
  }

  if ([object isKindOfClass:UIScrollView.class]) {
    UIScrollView* sv = (UIScrollView*)object;
    if ([sel isEqualToString:@"setContentOffset:animated:"]) {
      [sv setContentOffset:JSONToPoint(valueArg(0))
                  animated:[valueArg(1) boolValue]];
      return "null";
    }
    if ([sel isEqualToString:@"scrollRectToVisible:animated:"]) {
      [sv scrollRectToVisible:JSONToRect(valueArg(0))
                     animated:[valueArg(1) boolValue]];
      return "null";
    }
    if ([sel isEqualToString:@"flashScrollIndicators"]) {
      [sv flashScrollIndicators];
      return "null";
    }
  }

  if ([object isKindOfClass:UIStackView.class]) {
    UIStackView* stack = (UIStackView*)object;
    if ([sel isEqualToString:@"addArrangedSubview:"]) {
      if (UIView* child = viewArg(0)) [stack addArrangedSubview:child];
      return "null";
    }
    if ([sel isEqualToString:@"removeArrangedSubview:"]) {
      // 只移出排列，不移出 subviews——头文件明说的，要移走得自己
      // removeFromSuperview（那边 stack 会自动把它从排列里摘掉）
      if (UIView* child = viewArg(0)) [stack removeArrangedSubview:child];
      return "null";
    }
    if ([sel isEqualToString:@"insertArrangedSubview:atIndex:"]) {
      if (UIView* child = viewArg(0)) {
        NSInteger index = [valueArg(1) integerValue];
        if (index < 0 || (NSUInteger)index > stack.arrangedSubviews.count) {
          *error = [NSString stringWithFormat:
                       @"insertArrangedSubview: atIndex %ld is out of range (0...%lu)",
                       (long)index, (unsigned long)stack.arrangedSubviews.count].UTF8String;
          return "null";
        }
        [stack insertArrangedSubview:child atIndex:(NSUInteger)index];
      }
      return "null";
    }
    if ([sel isEqualToString:@"setCustomSpacing:afterView:"]) {
      CGFloat spacing;
      if (!StackSpacingFromValue(valueArg(0), &spacing, YES)) {
        *error = EnumError(@"setCustomSpacing", valueArg(0), NamesForStackSpacing(YES));
        return "null";
      }
      if (UIView* child = viewArg(1)) [stack setCustomSpacing:spacing afterView:child];
      return "null";
    }
    if ([sel isEqualToString:@"customSpacingAfterView:"]) {
      if (UIView* child = viewArg(0)) {
        return EncodeJSON(ValueForStackSpacing([stack customSpacingAfterView:child]));
      }
      return "null";
    }
  }

  if ([object isKindOfClass:UIView.class]) {
    UIView* view = (UIView*)object;
    if ([sel isEqualToString:@"addSubview:"]) {
      if (UIView* child = viewArg(0)) [view addSubview:child];
    } else if ([sel isEqualToString:@"insertSubview:atIndex:"]) {
      if (UIView* child = viewArg(0)) {
        [view insertSubview:child atIndex:[valueArg(1) integerValue]];
      }
    } else if ([sel isEqualToString:@"insertSubview:belowSubview:"]) {
      if (UIView* child = viewArg(0)) {
        if (UIView* sibling = viewArg(1)) [view insertSubview:child belowSubview:sibling];
      }
    } else if ([sel isEqualToString:@"insertSubview:aboveSubview:"]) {
      if (UIView* child = viewArg(0)) {
        if (UIView* sibling = viewArg(1)) [view insertSubview:child aboveSubview:sibling];
      }
    } else if ([sel isEqualToString:@"removeFromSuperview"]) {
      [view removeFromSuperview];
    } else if ([sel isEqualToString:@"bringSubviewToFront:"]) {
      if (UIView* child = viewArg(0)) [view bringSubviewToFront:child];
    } else if ([sel isEqualToString:@"sendSubviewToBack:"]) {
      if (UIView* child = viewArg(0)) [view sendSubviewToBack:child];
    } else if ([sel isEqualToString:@"isDescendantOfView:"]) {
      UIView* other = viewArg(0);
      result = @(other != nil && [view isDescendantOfView:other]);
    } else if ([sel isEqualToString:@"sizeThatFits:"]) {
      result = SizeToJSON([view sizeThatFits:JSONToSize(valueArg(0))]);
    } else if ([sel isEqualToString:@"sizeToFit"]) {
      [view sizeToFit];
    } else if ([sel isEqualToString:@"convertPoint:toView:"]) {
      result = PointToJSON([view convertPoint:JSONToPoint(valueArg(0)) toView:viewArg(1)]);
    } else if ([sel isEqualToString:@"convertPoint:fromView:"]) {
      result = PointToJSON([view convertPoint:JSONToPoint(valueArg(0)) fromView:viewArg(1)]);
    } else if ([sel isEqualToString:@"convertRect:toView:"]) {
      result = RectToJSON([view convertRect:JSONToRect(valueArg(0)) toView:viewArg(1)]);
    } else if ([sel isEqualToString:@"convertRect:fromView:"]) {
      result = RectToJSON([view convertRect:JSONToRect(valueArg(0)) fromView:viewArg(1)]);
    } else if ([sel isEqualToString:@"setNeedsLayout"]) {
      [view setNeedsLayout];
    } else if ([sel isEqualToString:@"layoutIfNeeded"]) {
      [view layoutIfNeeded];
    } else if ([sel isEqualToString:@"setNeedsDisplay"]) {
      [view setNeedsDisplay];
    } else if ([sel isEqualToString:@"sendActionsForControlEvents:"] &&
               [view isKindOfClass:UIControl.class]) {
      // 参数是字符串数组，一次可以触发多个
      id given = valueArg(0);
      UIControlEvents mask = (UIControlEvents)0;
      if (![given isKindOfClass:NSArray.class]) {
        *error = [NSString stringWithFormat:
                      @"sendActionsForControlEvents needs an array of names; "
                      @"expected any of: %@", NamesForControlEvent()].UTF8String;
      } else {
        BOOL ok = YES;
        for (id name in (NSArray*)given) {
          UIControlEvents bit;
          if (!ControlEventFromName(name, &bit)) {
            *error = EnumError(@"sendActionsForControlEvents", name, NamesForControlEvent());
            ok = NO;
            break;
          }
          mask |= bit;
        }
        if (ok) [(UIControl*)view sendActionsForControlEvents:mask];
      }
    } else if ([sel isEqualToString:@"invalidateIntrinsicContentSize"]) {
      [view invalidateIntrinsicContentSize];
    } else if ([sel isEqualToString:@"addLayoutGuide:"]) {
      if (UILayoutGuide* guide = guideArg(0)) [view addLayoutGuide:guide];
    } else if ([sel isEqualToString:@"removeLayoutGuide:"]) {
      if (UILayoutGuide* guide = guideArg(0)) [view removeLayoutGuide:guide];
    } else if ([sel isEqualToString:@"exerciseAmbiguityInLayout"]) {
      [view exerciseAmbiguityInLayout];
    } else if ([sel isEqualToString:@"contentHuggingPriorityForAxis:"]) {
      UILayoutConstraintAxis axis;
      if (!LayoutConstraintAxisFromName(valueArg(0), &axis)) {
        *error = EnumError(@"axis", valueArg(0), NamesForLayoutConstraintAxis());
      } else {
        result = @([view contentHuggingPriorityForAxis:axis]);
      }
    } else if ([sel isEqualToString:@"contentCompressionResistancePriorityForAxis:"]) {
      UILayoutConstraintAxis axis;
      if (!LayoutConstraintAxisFromName(valueArg(0), &axis)) {
        *error = EnumError(@"axis", valueArg(0), NamesForLayoutConstraintAxis());
      } else {
        result = @([view contentCompressionResistancePriorityForAxis:axis]);
      }
    } else if ([sel isEqualToString:@"setContentHuggingPriority:forAxis:"]) {
      UILayoutPriority priority;
      UILayoutConstraintAxis axis;
      if (!LayoutPriorityFromValue(valueArg(0), &priority)) {
        *error = EnumError(@"priority", valueArg(0), NamesForLayoutPriority());
      } else if (!LayoutConstraintAxisFromName(valueArg(1), &axis)) {
        *error = EnumError(@"forAxis", valueArg(1), NamesForLayoutConstraintAxis());
      } else {
        [view setContentHuggingPriority:priority forAxis:axis];
      }
    } else if ([sel isEqualToString:@"setContentCompressionResistancePriority:forAxis:"]) {
      UILayoutPriority priority;
      UILayoutConstraintAxis axis;
      if (!LayoutPriorityFromValue(valueArg(0), &priority)) {
        *error = EnumError(@"priority", valueArg(0), NamesForLayoutPriority());
      } else if (!LayoutConstraintAxisFromName(valueArg(1), &axis)) {
        *error = EnumError(@"forAxis", valueArg(1), NamesForLayoutConstraintAxis());
      } else {
        [view setContentCompressionResistancePriority:priority forAxis:axis];
      }
    } else if ([sel isEqualToString:@"systemLayoutSizeFittingSize:"]) {
      result = SizeToJSON([view systemLayoutSizeFittingSize:JSONToSize(valueArg(0))]);
    } else if ([sel isEqualToString:@"systemLayoutSizeFittingSize:"
                                     "withHorizontalFittingPriority:"
                                     "verticalFittingPriority:"]) {
      UILayoutPriority h;
      UILayoutPriority v;
      if (!LayoutPriorityFromValue(valueArg(1), &h)) {
        *error = EnumError(@"withHorizontalFittingPriority", valueArg(1),
                           NamesForLayoutPriority());
      } else if (!LayoutPriorityFromValue(valueArg(2), &v)) {
        *error = EnumError(@"verticalFittingPriority", valueArg(2),
                           NamesForLayoutPriority());
      } else {
        result = SizeToJSON([view systemLayoutSizeFittingSize:JSONToSize(valueArg(0))
                               withHorizontalFittingPriority:h
                                     verticalFittingPriority:v]);
      }
    }
  }
  return EncodeJSON(result);
}

// 带参数、返回原生对象的方法
nacre::NativeObjectRef CallObjectMethod(id object, const std::string& name,
                                        const std::string& argsJSON,
                                        const std::vector<void*>& argPtrs,
                                        std::string* error) {
  if ([object isKindOfClass:UINavigationController.class]) {
    UINavigationController* nav = (UINavigationController*)object;
    if (name == "popViewControllerAnimated:") {
      id decoded = DecodeJSON(argsJSON);
      NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
      BOOL animated = args.count > 0 ? [args[0] boolValue] : NO;
      // 栈底那一个弹不动，返回 nil —— 「没命中」和「你问错了」要分开，
      // 所以这里不填 error
      return {(__bridge void*)[nav popViewControllerAnimated:animated],
              "UIViewController"};
    }
  }
  NSString* sel = @(name.c_str());
  id decoded = DecodeJSON(argsJSON);
  NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  if ([object isKindOfClass:UIView.class]) {
    UIView* view = (UIView*)object;
    if ([sel isEqualToString:@"viewWithTag:"] && args.count > 0) {
      return {(__bridge void*)[view viewWithTag:[args[0] integerValue]], "UIView"};
    }
    if ([sel isEqualToString:@"hitTest:withEvent:"] && args.count > 0) {
      return {(__bridge void*)[view hitTest:JSONToPoint(args[0]) withEvent:nil], "UIView"};
    }
  }
  // UIButton 按状态取出来的颜色和图
  if ([object isKindOfClass:UIButton.class]) {
    UIButton* button = (UIButton*)object;
    id given = args.count > 0 ? args[0] : nil;
    UIControlState state;
    id bad = nil;
    BOOL wants = [sel isEqualToString:@"titleColorForState:"] ||
                 [sel isEqualToString:@"imageForState:"] ||
                 [sel isEqualToString:@"backgroundImageForState:"];
    if (wants) {
      if (!ControlStateArgFromNames(given, &state, &bad)) {
        *error = bad != nil
                     ? EnumError(@"state", bad, NamesForControlStateArg())
                     : [NSString stringWithFormat:
                           @"state needs an array of state names; expected any of: %@",
                           NamesForControlStateArg()].UTF8String;
        return {};
      }
      if ([sel isEqualToString:@"titleColorForState:"]) {
        return {(__bridge void*)[button titleColorForState:state], "UIColor"};
      }
      if ([sel isEqualToString:@"imageForState:"]) {
        return {(__bridge void*)[button imageForState:state], "UIImage"};
      }
      return {(__bridge void*)[button backgroundImageForState:state], "UIImage"};
    }
  }

  // 锚点。一条约束只能连同类的锚点，跨类连原生抛 NSInvalidArgumentException，
  // 所以这里先查，把「你问错了」变成 TypeError 而不是崩溃。
  if ([object isKindOfClass:NSLayoutAnchor.class]) {
    NSLayoutAnchor* anchor = (NSLayoutAnchor*)object;
    auto num = [&](NSUInteger i) -> CGFloat {
      return i < args.count ? [args[i] doubleValue] : 0;
    };
    id otherRaw = argPtrs.empty() ? nil : (__bridge id)argPtrs[0];
    NSLayoutConstraint* made = nil;

    // 尺寸锚点的「等于一个常数」系列不需要另一个锚点
    if ([anchor isKindOfClass:NSLayoutDimension.class]) {
      NSLayoutDimension* dim = (NSLayoutDimension*)anchor;
      if ([sel isEqualToString:@"constraintEqualToConstant:"]) {
        made = [dim constraintEqualToConstant:num(0)];
      } else if ([sel isEqualToString:@"constraintGreaterThanOrEqualToConstant:"]) {
        made = [dim constraintGreaterThanOrEqualToConstant:num(0)];
      } else if ([sel isEqualToString:@"constraintLessThanOrEqualToConstant:"]) {
        made = [dim constraintLessThanOrEqualToConstant:num(0)];
      }
      if (made != nil) return {(__bridge void*)made, "NSLayoutConstraint"};
    }

    if (![otherRaw isKindOfClass:NSLayoutAnchor.class]) {
      *error = [NSString stringWithFormat:@"%@ needs an anchor as its argument", sel].UTF8String;
      return {};
    }
    NSLayoutAnchor* other = (NSLayoutAnchor*)otherRaw;
    if (strcmp(AnchorClassName(anchor), AnchorClassName(other)) != 0) {
      *error = [NSString stringWithFormat:@"%s cannot be constrained to %s: their units are not compatible",
                                          AnchorClassName(anchor),
                                          AnchorClassName(other)]
                   .UTF8String;
      return {};
    }

    if ([sel isEqualToString:@"constraintEqualToAnchor:"]) {
      made = [anchor constraintEqualToAnchor:other];
    } else if ([sel isEqualToString:@"constraintEqualToAnchor:constant:"]) {
      made = [anchor constraintEqualToAnchor:other constant:num(1)];
    } else if ([sel isEqualToString:@"constraintGreaterThanOrEqualToAnchor:"]) {
      made = [anchor constraintGreaterThanOrEqualToAnchor:other];
    } else if ([sel isEqualToString:@"constraintGreaterThanOrEqualToAnchor:constant:"]) {
      made = [anchor constraintGreaterThanOrEqualToAnchor:other constant:num(1)];
    } else if ([sel isEqualToString:@"constraintLessThanOrEqualToAnchor:"]) {
      made = [anchor constraintLessThanOrEqualToAnchor:other];
    } else if ([sel isEqualToString:@"constraintLessThanOrEqualToAnchor:constant:"]) {
      made = [anchor constraintLessThanOrEqualToAnchor:other constant:num(1)];
    }
    if (made != nil) return {(__bridge void*)made, "NSLayoutConstraint"};

    if ([anchor isKindOfClass:NSLayoutDimension.class]) {
      NSLayoutDimension* dim = (NSLayoutDimension*)anchor;
      NSLayoutDimension* od = (NSLayoutDimension*)other;
      if ([sel isEqualToString:@"constraintEqualToAnchor:multiplier:"]) {
        made = [dim constraintEqualToAnchor:od multiplier:num(1)];
      } else if ([sel isEqualToString:@"constraintEqualToAnchor:multiplier:constant:"]) {
        made = [dim constraintEqualToAnchor:od multiplier:num(1) constant:num(2)];
      } else if ([sel isEqualToString:@"constraintGreaterThanOrEqualToAnchor:multiplier:"]) {
        made = [dim constraintGreaterThanOrEqualToAnchor:od multiplier:num(1)];
      } else if ([sel isEqualToString:
                          @"constraintGreaterThanOrEqualToAnchor:multiplier:constant:"]) {
        made = [dim constraintGreaterThanOrEqualToAnchor:od
                                              multiplier:num(1)
                                                constant:num(2)];
      } else if ([sel isEqualToString:@"constraintLessThanOrEqualToAnchor:multiplier:"]) {
        made = [dim constraintLessThanOrEqualToAnchor:od multiplier:num(1)];
      } else if ([sel isEqualToString:
                          @"constraintLessThanOrEqualToAnchor:multiplier:constant:"]) {
        made = [dim constraintLessThanOrEqualToAnchor:od
                                           multiplier:num(1)
                                             constant:num(2)];
      }
      if (made != nil) return {(__bridge void*)made, "NSLayoutConstraint"};
    }

    // 系统标准间距。两个锚点之间差多少由系统按上下文决定（8pt 起步，
    // 但靠近屏幕边缘、不同控件之间都不一样）——这是 iOS 独有的能力，
    // Web 里没有对应物，所以原样暴露。
    if ([anchor isKindOfClass:NSLayoutXAxisAnchor.class]) {
      NSLayoutXAxisAnchor* x = (NSLayoutXAxisAnchor*)anchor;
      NSLayoutXAxisAnchor* ox = (NSLayoutXAxisAnchor*)other;
      if ([sel isEqualToString:@"constraintEqualToSystemSpacingAfterAnchor:multiplier:"]) {
        made = [x constraintEqualToSystemSpacingAfterAnchor:ox multiplier:num(1)];
      } else if ([sel isEqualToString:
                          @"constraintGreaterThanOrEqualToSystemSpacingAfterAnchor:"
                          @"multiplier:"]) {
        made = [x constraintGreaterThanOrEqualToSystemSpacingAfterAnchor:ox
                                                              multiplier:num(1)];
      } else if ([sel isEqualToString:
                          @"constraintLessThanOrEqualToSystemSpacingAfterAnchor:"
                          @"multiplier:"]) {
        made = [x constraintLessThanOrEqualToSystemSpacingAfterAnchor:ox
                                                           multiplier:num(1)];
      } else if ([sel isEqualToString:@"anchorWithOffsetToAnchor:"]) {
        return {(__bridge void*)[x anchorWithOffsetToAnchor:ox], "NSLayoutDimension"};
      }
    } else if ([anchor isKindOfClass:NSLayoutYAxisAnchor.class]) {
      NSLayoutYAxisAnchor* y = (NSLayoutYAxisAnchor*)anchor;
      NSLayoutYAxisAnchor* oy = (NSLayoutYAxisAnchor*)other;
      if ([sel isEqualToString:@"constraintEqualToSystemSpacingBelowAnchor:multiplier:"]) {
        made = [y constraintEqualToSystemSpacingBelowAnchor:oy multiplier:num(1)];
      } else if ([sel isEqualToString:
                          @"constraintGreaterThanOrEqualToSystemSpacingBelowAnchor:"
                          @"multiplier:"]) {
        made = [y constraintGreaterThanOrEqualToSystemSpacingBelowAnchor:oy
                                                              multiplier:num(1)];
      } else if ([sel isEqualToString:
                          @"constraintLessThanOrEqualToSystemSpacingBelowAnchor:"
                          @"multiplier:"]) {
        made = [y constraintLessThanOrEqualToSystemSpacingBelowAnchor:oy
                                                           multiplier:num(1)];
      } else if ([sel isEqualToString:@"anchorWithOffsetToAnchor:"]) {
        return {(__bridge void*)[y anchorWithOffsetToAnchor:oy], "NSLayoutDimension"};
      }
    }
    if (made != nil) return {(__bridge void*)made, "NSLayoutConstraint"};
  }

  // UIImage 不可变：这些方法都返回一张新图，不改原图。
  if ([object isKindOfClass:UIImage.class]) {
    UIImage* image = (UIImage*)object;
    auto arg = [&](NSUInteger i) -> id { return i < args.count ? args[i] : nil; };
    if ([sel isEqualToString:@"resizableImageWithCapInsets:"]) {
      return {(__bridge void*)[image resizableImageWithCapInsets:JSONToInsets(arg(0))],
              "UIImage"};
    }
    if ([sel isEqualToString:@"resizableImageWithCapInsets:resizingMode:"]) {
      UIImageResizingMode mode;
      if (!ImageResizingModeFromName(arg(1), &mode)) {
        *error = EnumError(@"resizingMode", arg(1), NamesForImageResizingMode());
        return {};
      }
      return {(__bridge void*)[image resizableImageWithCapInsets:JSONToInsets(arg(0))
                                                    resizingMode:mode],
              "UIImage"};
    }
    if ([sel isEqualToString:@"imageWithRenderingMode:"]) {
      UIImageRenderingMode mode;
      if (!ImageRenderingModeFromName(arg(0), &mode)) {
        *error = EnumError(@"renderingMode", arg(0), NamesForImageRenderingMode());
        return {};
      }
      return {(__bridge void*)[image imageWithRenderingMode:mode], "UIImage"};
    }
  }
  return {};
}

// 返回原生对象数组的方法。目前只有排版调试那一个——UIKit 在我们这个
// 环境里对约束冲突一声不吭（stdout / stderr / os_log 三路实测全空），
// JS 开发者也没有 Xcode 控制台可看，这是唯一的自查手段。
std::vector<nacre::NativeObjectRef> CallObjectArrayMethod(
    id object, const std::string& name, const std::string& argsJSON,
    const std::vector<void*>& argPtrs, std::string* error) {
  if ([object isKindOfClass:UINavigationController.class]) {
    UINavigationController* nav = (UINavigationController*)object;
    id decoded = DecodeJSON(argsJSON);
    NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
    NSArray<UIViewController*>* popped = nil;
    BOOL matched = NO;
    if (name == "popToViewController:animated:") {
      id vc = argPtrs.empty() ? nil : (__bridge id)argPtrs[0];
      if (![vc isKindOfClass:UIViewController.class]) {
        *error = "popToViewController: expects a UIViewController";
        return {};
      }
      popped = [nav popToViewController:vc
                               animated:args.count > 1 ? [args[1] boolValue] : NO];
      matched = YES;
    } else if (name == "popToRootViewControllerAnimated:") {
      popped = [nav popToRootViewControllerAnimated:
                        args.count > 0 ? [args[0] boolValue] : NO];
      matched = YES;
    } else if (name == "setViewControllers:animated:") {
      // 数组按「每个参数一个句柄」传，最后一个参数是 animated
      NSMutableArray<UIViewController*>* list = [NSMutableArray array];
      for (void* ptr : argPtrs) {
        id vc = (__bridge id)ptr;
        if (vc != nil && ![vc isKindOfClass:UIViewController.class]) {
          *error = "setViewControllers: only accepts UIViewController";
          return {};
        }
        if (vc != nil) [list addObject:vc];
      }
      BOOL animated = args.count > 0 && [args.lastObject boolValue];
      @try {
        [nav setViewControllers:list animated:animated];
      } @catch (NSException* e) {
        *error = [NSString stringWithFormat:@"setViewControllers: %@", e.reason].UTF8String;
      }
      return {};
    }
    if (matched) {
      std::vector<nacre::NativeObjectRef> refs;
      for (UIViewController* vc in popped) {
        refs.push_back({(__bridge void*)vc, "UIViewController"});
      }
      return refs;
    }
  }
  std::vector<nacre::NativeObjectRef> refs;
  NSString* sel = @(name.c_str());
  id decoded = DecodeJSON(argsJSON);
  NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  if ([object isKindOfClass:UIView.class] &&
      [sel isEqualToString:@"constraintsAffectingLayoutForAxis:"]) {
    UILayoutConstraintAxis axis;
    id given = args.count > 0 ? args[0] : nil;
    if (!LayoutConstraintAxisFromName(given, &axis)) {
      *error = EnumError(@"axis", given, NamesForLayoutConstraintAxis());
      return refs;
    }
    for (NSLayoutConstraint* c in
         [(UIView*)object constraintsAffectingLayoutForAxis:axis]) {
      refs.push_back({(__bridge void*)c, "NSLayoutConstraint"});
    }
  }
  return refs;
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
