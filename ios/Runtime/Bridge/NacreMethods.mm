// 方法分发和构造。selector 是完整的 ObjC selector。

#import "NacreBridge.h"

#import <os/log.h>

namespace nacre_bridge {

void CallVoidMethod(id object, const std::string& name) {
  if (NavCallVoidMethod(object, name)) return;
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

  // ---- first responder ----
  // 输入框弹不弹键盘就看它。返回值是「成没成」——系统可能拒绝（视图还没
  // 上屏、canBecomeFirstResponder 为假），所以 JS 侧别忽略返回值。
  // endEditing: 是收键盘最常用的那一个：让整棵子树里的 first responder
  // 交出身份，不用先找到是哪一个控件。
  if ([object isKindOfClass:UIResponder.class]) {
    UIResponder* responder = (UIResponder*)object;
    if ([sel isEqualToString:@"becomeFirstResponder"]) {
      return EncodeJSON(@([responder becomeFirstResponder]));
    }
    if ([sel isEqualToString:@"resignFirstResponder"]) {
      return EncodeJSON(@([responder resignFirstResponder]));
    }
    if ([sel isEqualToString:@"endEditing:"] && [object isKindOfClass:UIView.class]) {
      return EncodeJSON(@([(UIView*)object endEditing:NACRE_BOOL(valueArg(0), sel)]));
    }
  }

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

  {
    std::string layerResult;
    if (LayerCallMethod(object, sel, NacreArgs{args, &argPtrs}, &layerResult, error)) {
      return layerResult;
    }
  }

  {
    std::string pathResult;
    if (PathCallMethod(object, sel, NacreArgs{args, &argPtrs}, &pathResult, error)) {
      return pathResult;
    }
  }

  {
    std::string animResult;
    if (AnimationCallMethod(object, sel, NacreArgs{args, &argPtrs}, &animResult, error)) {
      return animResult;
    }
  }

  {
    std::string wsResult;
    if (WebSocketCallMethod(object, sel, NacreArgs{args, &argPtrs}, &wsResult, error)) {
      return wsResult;
    }
  }

  {
    std::string feedbackResult;
    if (FeedbackCallMethod(object, sel, NacreArgs{args, &argPtrs}, &feedbackResult, error)) {
      return feedbackResult;
    }
  }

  {
    std::string gestureResult;
    if (GestureCallMethod(object, sel, NacreArgs{args, &argPtrs}, &gestureResult, error)) {
      return gestureResult;
    }
  }

  {
    std::string navResult;
    if (NavCallMethod(object, sel, NacreArgs{args, &argPtrs}, &navResult, error)) {
      return navResult;
    }
  }

  if ([object isKindOfClass:UIScrollView.class]) {
    UIScrollView* sv = (UIScrollView*)object;
    if ([sel isEqualToString:@"setContentOffset:animated:"]) {
      [sv setContentOffset:JSONToPoint(valueArg(0))
                  animated:NACRE_BOOL(valueArg(1), sel)];
      return "null";
    }
    if ([sel isEqualToString:@"scrollRectToVisible:animated:"]) {
      [sv scrollRectToVisible:JSONToRect(valueArg(0))
                     animated:NACRE_BOOL(valueArg(1), sel)];
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
        NSInteger index = NACRE_INT(valueArg(1), sel);
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
        [view insertSubview:child atIndex:NACRE_INT(valueArg(1), sel)];
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
  {
    id navDecoded = DecodeJSON(argsJSON);
    NSArray* navArgs = [navDecoded isKindOfClass:NSArray.class] ? navDecoded : @[];
    nacre::NativeObjectRef navResult;
    if (NavCallObjectMethod(object, name, NacreArgs{navArgs, &argPtrs},
                            &navResult, error)) {
      return navResult;
    }
  }
  {
    id pathDecoded = DecodeJSON(argsJSON);
    NSArray* pathArgs = [pathDecoded isKindOfClass:NSArray.class] ? pathDecoded : @[];
    nacre::NativeObjectRef pathResult;
    if (PathCallObjectMethod(object, name, NacreArgs{pathArgs, &argPtrs},
                             &pathResult, error)) {
      return pathResult;
    }
  }
  {
    id animDecoded = DecodeJSON(argsJSON);
    NSArray* animArgs = [animDecoded isKindOfClass:NSArray.class] ? animDecoded : @[];
    nacre::NativeObjectRef animResult;
    if (AnimationCallObjectMethod(object, name, NacreArgs{animArgs, &argPtrs},
                                  &animResult, error)) {
      return animResult;
    }
  }
  NSString* sel = @(name.c_str());
  id decoded = DecodeJSON(argsJSON);
  NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  if ([object isKindOfClass:UIView.class]) {
    UIView* view = (UIView*)object;
    if ([sel isEqualToString:@"viewWithTag:"] && args.count > 0) {
      return {(__bridge void*)[view viewWithTag:NACRE_INT(args[0], sel)], "UIView"};
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
    // 这一组方法的标量参数全是数（multiplier、constant）。对象参数在
    // 数组里是 null，跳过；其余的先整体查一遍，下面才敢直接取
    for (id given in args) {
      if (given != NSNull.null && !RequireNumber(given, sel, error)) return {};
    }
    auto num = [&](NSUInteger i) -> CGFloat {
      return i < args.count ? SafeNumber(args[i]) : 0;
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
  {
    id navDecoded = DecodeJSON(argsJSON);
    NSArray* navArgs = [navDecoded isKindOfClass:NSArray.class] ? navDecoded : @[];
    std::vector<nacre::NativeObjectRef> navResult;
    if (NavCallObjectArrayMethod(object, name, NacreArgs{navArgs, &argPtrs},
                                 &navResult, error)) {
      return navResult;
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


// 返回值不是原生对象的类方法。现在只有 CATransaction 走这条，
// 但通道是通用的：「返回一个对象」和「返回一个值」在桥上是两种编码
std::string CallClassMethod(const std::string& className, const std::string& name,
                            const std::string& argsJSON,
                            const std::vector<void*>& argPtrs, std::string* error) {
  NSString* sel = @(name.c_str());
  id decoded = DecodeJSON(argsJSON);
  NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  std::string out;
  if (TransactionCallClassMethod(className, sel, NacreArgs{args, &argPtrs}, &out, error)) {
    return out;
  }
  *error = [NSString stringWithFormat:@"%s has no class method %@",
                                      className.c_str(), sel].UTF8String;
  return "null";
}

}  // namespace nacre_bridge
