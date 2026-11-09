// 滚动和排列。UIScrollView 和 UIStackView。
//
// 属性分发按能力域拆开，这里只装这一个域；调用顺序在 NacreProperties.mm。

#import "NacreBridge.h"

namespace nacre_bridge {

id ReadScrollProperty(id object, NSString* key) {
  id value = nil;
  if (value == nil && [object isKindOfClass:UIScrollView.class]) {
    UIScrollView* sv = (UIScrollView*)object;
    if ([key isEqualToString:@"contentOffset"]) {
      value = PointToJSON(sv.contentOffset);
    } else if ([key isEqualToString:@"contentSize"]) {
      value = SizeToJSON(sv.contentSize);
    } else if ([key isEqualToString:@"contentInset"]) {
      value = InsetsToJSON(sv.contentInset);
    } else if ([key isEqualToString:@"adjustedContentInset"]) {
      value = InsetsToJSON(sv.adjustedContentInset);
    } else if ([key isEqualToString:@"contentInsetAdjustmentBehavior"]) {
      value = NameForContentInsetAdjustmentBehavior(sv.contentInsetAdjustmentBehavior);
    } else if ([key isEqualToString:@"automaticallyAdjustsScrollIndicatorInsets"]) {
      value = @(sv.automaticallyAdjustsScrollIndicatorInsets);
    } else if ([key isEqualToString:@"isScrollEnabled"]) {
      value = @(sv.isScrollEnabled);
    } else if ([key isEqualToString:@"isDirectionalLockEnabled"]) {
      value = @(sv.isDirectionalLockEnabled);
    } else if ([key isEqualToString:@"bounces"]) {
      value = @(sv.bounces);
    } else if ([key isEqualToString:@"alwaysBounceVertical"]) {
      value = @(sv.alwaysBounceVertical);
    } else if ([key isEqualToString:@"alwaysBounceHorizontal"]) {
      value = @(sv.alwaysBounceHorizontal);
    } else if ([key isEqualToString:@"isPagingEnabled"]) {
      value = @(sv.isPagingEnabled);
    } else if ([key isEqualToString:@"scrollsToTop"]) {
      value = @(sv.scrollsToTop);
    } else if ([key isEqualToString:@"showsVerticalScrollIndicator"]) {
      value = @(sv.showsVerticalScrollIndicator);
    } else if ([key isEqualToString:@"showsHorizontalScrollIndicator"]) {
      value = @(sv.showsHorizontalScrollIndicator);
    } else if ([key isEqualToString:@"indicatorStyle"]) {
      value = NameForIndicatorStyle(sv.indicatorStyle);
    } else if ([key isEqualToString:@"verticalScrollIndicatorInsets"]) {
      value = InsetsToJSON(sv.verticalScrollIndicatorInsets);
    } else if ([key isEqualToString:@"horizontalScrollIndicatorInsets"]) {
      value = InsetsToJSON(sv.horizontalScrollIndicatorInsets);
    } else if ([key isEqualToString:@"decelerationRate"]) {
      value = ValueForDecelerationRate(sv.decelerationRate);
    } else if ([key isEqualToString:@"delaysContentTouches"]) {
      value = @(sv.delaysContentTouches);
    } else if ([key isEqualToString:@"canCancelContentTouches"]) {
      value = @(sv.canCancelContentTouches);
    } else if ([key isEqualToString:@"isTracking"]) {
      value = @(sv.isTracking);
    } else if ([key isEqualToString:@"isDragging"]) {
      value = @(sv.isDragging);
    } else if ([key isEqualToString:@"isDecelerating"]) {
      value = @(sv.isDecelerating);
    } else if ([key isEqualToString:@"isScrollAnimating"]) {
      value = @(sv.isScrollAnimating);
    }
  }

  if (value == nil && [object isKindOfClass:UIStackView.class]) {
    UIStackView* stack = (UIStackView*)object;
    if ([key isEqualToString:@"axis"]) {
      value = NameForLayoutConstraintAxis(stack.axis);
    } else if ([key isEqualToString:@"distribution"]) {
      value = NameForStackDistribution(stack.distribution);
    } else if ([key isEqualToString:@"alignment"]) {
      // 别名在这里收敛：leading 和 top 是同一个值，读出来永远是 leading
      value = NameForStackAlignment(stack.alignment);
    } else if ([key isEqualToString:@"spacing"]) {
      value = ValueForStackSpacing(stack.spacing);
    } else if ([key isEqualToString:@"isBaselineRelativeArrangement"]) {
      value = @(stack.isBaselineRelativeArrangement);
    } else if ([key isEqualToString:@"isLayoutMarginsRelativeArrangement"]) {
      value = @(stack.isLayoutMarginsRelativeArrangement);
    }
  }
  return value;
}

BOOL WriteScrollProperty(id object, NSString* key, id value,
                      std::string* error) {
  if ([object isKindOfClass:UIScrollView.class]) {
    UIScrollView* sv = (UIScrollView*)object;
    if ([key isEqualToString:@"contentOffset"]) {
      sv.contentOffset = JSONToPoint(value);
      return YES;
    }
    if ([key isEqualToString:@"contentSize"]) {
      sv.contentSize = JSONToSize(value);
      return YES;
    }
    if ([key isEqualToString:@"contentInset"]) {
      sv.contentInset = JSONToInsets(value);
      return YES;
    }
    if ([key isEqualToString:@"contentInsetAdjustmentBehavior"]) {
      UIScrollViewContentInsetAdjustmentBehavior b;
      if (!ContentInsetAdjustmentBehaviorFromName(value, &b)) {
        *error = EnumError(@"contentInsetAdjustmentBehavior", value,
                           NamesForContentInsetAdjustmentBehavior());
        return YES;
      }
      sv.contentInsetAdjustmentBehavior = b;
      return YES;
    }
    if ([key isEqualToString:@"automaticallyAdjustsScrollIndicatorInsets"]) {
      sv.automaticallyAdjustsScrollIndicatorInsets = [value boolValue];
      return YES;
    }
    if ([key isEqualToString:@"isScrollEnabled"]) {
      sv.scrollEnabled = [value boolValue];
      return YES;
    }
    if ([key isEqualToString:@"isDirectionalLockEnabled"]) {
      sv.directionalLockEnabled = [value boolValue];
      return YES;
    }
    if ([key isEqualToString:@"bounces"]) { sv.bounces = [value boolValue]; return YES; }
    if ([key isEqualToString:@"alwaysBounceVertical"]) {
      sv.alwaysBounceVertical = [value boolValue];
      return YES;
    }
    if ([key isEqualToString:@"alwaysBounceHorizontal"]) {
      sv.alwaysBounceHorizontal = [value boolValue];
      return YES;
    }
    if ([key isEqualToString:@"isPagingEnabled"]) {
      sv.pagingEnabled = [value boolValue];
      return YES;
    }
    if ([key isEqualToString:@"scrollsToTop"]) {
      sv.scrollsToTop = [value boolValue];
      return YES;
    }
    if ([key isEqualToString:@"showsVerticalScrollIndicator"]) {
      sv.showsVerticalScrollIndicator = [value boolValue];
      return YES;
    }
    if ([key isEqualToString:@"showsHorizontalScrollIndicator"]) {
      sv.showsHorizontalScrollIndicator = [value boolValue];
      return YES;
    }
    if ([key isEqualToString:@"indicatorStyle"]) {
      UIScrollViewIndicatorStyle style;
      if (!IndicatorStyleFromName(value, &style)) {
        *error = EnumError(@"indicatorStyle", value, NamesForIndicatorStyle());
        return YES;
      }
      sv.indicatorStyle = style;
      return YES;
    }
    if ([key isEqualToString:@"verticalScrollIndicatorInsets"]) {
      sv.verticalScrollIndicatorInsets = JSONToInsets(value);
      return YES;
    }
    if ([key isEqualToString:@"horizontalScrollIndicatorInsets"]) {
      sv.horizontalScrollIndicatorInsets = JSONToInsets(value);
      return YES;
    }
    if ([key isEqualToString:@"decelerationRate"]) {
      CGFloat rate;
      if (!DecelerationRateFromValue(value, &rate)) {
        *error = EnumError(@"decelerationRate", value, NamesForDecelerationRate());
        return YES;
      }
      sv.decelerationRate = rate;
      return YES;
    }
    if ([key isEqualToString:@"delaysContentTouches"]) {
      sv.delaysContentTouches = [value boolValue];
      return YES;
    }
    if ([key isEqualToString:@"canCancelContentTouches"]) {
      sv.canCancelContentTouches = [value boolValue];
      return YES;
    }
  }

  if ([object isKindOfClass:UIStackView.class]) {
    UIStackView* stack = (UIStackView*)object;
    if ([key isEqualToString:@"axis"]) {
      UILayoutConstraintAxis axis;
      if (!LayoutConstraintAxisFromName(value, &axis)) {
        *error = EnumError(@"axis", value, NamesForLayoutConstraintAxis());
        return YES;
      }
      stack.axis = axis;
      return YES;
    }
    if ([key isEqualToString:@"distribution"]) {
      UIStackViewDistribution d;
      if (!StackDistributionFromName(value, &d)) {
        *error = EnumError(@"distribution", value, NamesForStackDistribution());
        return YES;
      }
      stack.distribution = d;
      return YES;
    }
    if ([key isEqualToString:@"alignment"]) {
      UIStackViewAlignment a;
      if (!StackAlignmentFromName(value, &a)) {
        *error = EnumError(@"alignment", value, NamesForStackAlignment());
        return YES;
      }
      stack.alignment = a;
      return YES;
    }
    if ([key isEqualToString:@"spacing"]) {
      CGFloat spacing;
      if (!StackSpacingFromValue(value, &spacing, NO)) {
        *error = EnumError(@"spacing", value, NamesForStackSpacing(NO));
        return YES;
      }
      stack.spacing = spacing;
      return YES;
    }
    if ([key isEqualToString:@"isBaselineRelativeArrangement"]) {
      stack.baselineRelativeArrangement = [value boolValue];
      return YES;
    }
    if ([key isEqualToString:@"isLayoutMarginsRelativeArrangement"]) {
      stack.layoutMarginsRelativeArrangement = [value boolValue];
      return YES;
    }
  }
  return NO;
}

nacre::NativeObjectRef ReadScrollObjectProperty(id object,
                                            const std::string& name) {
  // 两个 layout guide：scroll 套 stack 的标准写法全靠它们。
  // contentLayoutGuide 定内容多大，frameLayoutGuide 定可视范围
  if ([object isKindOfClass:UIScrollView.class]) {
    UIScrollView* sv = (UIScrollView*)object;
    if (name == "contentLayoutGuide") {
      return {(__bridge void*)sv.contentLayoutGuide, "UILayoutGuide"};
    }
    if (name == "frameLayoutGuide") {
      return {(__bridge void*)sv.frameLayoutGuide, "UILayoutGuide"};
    }
  }
  return {};
}

void ReadScrollObjectArray(id object, const std::string& name,
                        std::vector<nacre::NativeObjectRef>& refs) {
  // arrangedSubviews 是 subviews 的子集，但顺序由 stack 的排列决定，
  // 不是 subview 的 z 序，所以两个都要能读
  if ([object isKindOfClass:UIStackView.class] && name == "arrangedSubviews") {
    for (UIView* child in ((UIStackView*)object).arrangedSubviews) {
      refs.push_back({(__bridge void*)child, "UIView"});
    }
  }
}

}  // namespace nacre_bridge
