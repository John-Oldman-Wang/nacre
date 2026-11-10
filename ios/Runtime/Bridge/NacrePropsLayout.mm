// Auto Layout。NSLayoutConstraint 和 UILayoutGuide。
//
// 属性分发按能力域拆开，这里只装这一个域；调用顺序在 NacreProperties.mm。

#import "NacreBridge.h"

namespace nacre_bridge {

id ReadLayoutProperty(id object, NSString* key) {
  id value = nil;
  // 键盘 guide 自己的三个开关
  if ([object isKindOfClass:UIKeyboardLayoutGuide.class]) {
    UIKeyboardLayoutGuide* guide = (UIKeyboardLayoutGuide*)object;
    if ([key isEqualToString:@"followsUndockedKeyboard"]) {
      return @(guide.followsUndockedKeyboard);
    }
    if ([key isEqualToString:@"keyboardDismissPadding"]) {
      return @(guide.keyboardDismissPadding);
    }
  }
  if (value == nil && [object isKindOfClass:NSLayoutConstraint.class]) {
    NSLayoutConstraint* c = (NSLayoutConstraint*)object;
    if ([key isEqualToString:@"isActive"]) {
      value = @(c.isActive);
    } else if ([key isEqualToString:@"constant"]) {
      value = @(c.constant);
    } else if ([key isEqualToString:@"multiplier"]) {
      value = @(c.multiplier);
    } else if ([key isEqualToString:@"priority"]) {
      // 读永远是数字：749 这种值没有名字
      value = @(c.priority);
    } else if ([key isEqualToString:@"relation"]) {
      value = NameForLayoutRelation(c.relation);
    } else if ([key isEqualToString:@"firstAttribute"]) {
      value = NameForLayoutAttribute(c.firstAttribute);
    } else if ([key isEqualToString:@"secondAttribute"]) {
      value = NameForLayoutAttribute(c.secondAttribute);
    } else if ([key isEqualToString:@"identifier"]) {
      value = c.identifier;
    }
  }

  if (value == nil && [object isKindOfClass:UILayoutGuide.class]) {
    UILayoutGuide* guide = (UILayoutGuide*)object;
    if ([key isEqualToString:@"layoutFrame"]) {
      value = RectToJSON(guide.layoutFrame);
    } else if ([key isEqualToString:@"identifier"]) {
      value = guide.identifier;
    }
  }
  return value;
}

BOOL WriteLayoutProperty(id object, NSString* key, id value,
                      std::string* error) {
  if ([object isKindOfClass:UIKeyboardLayoutGuide.class]) {
    UIKeyboardLayoutGuide* guide = (UIKeyboardLayoutGuide*)object;
    if ([key isEqualToString:@"followsUndockedKeyboard"]) {
      guide.followsUndockedKeyboard = [value boolValue];
      return YES;
    }
    if ([key isEqualToString:@"keyboardDismissPadding"]) {
      guide.keyboardDismissPadding = [value doubleValue];
      return YES;
    }
  }
  if ([object isKindOfClass:NSLayoutConstraint.class]) {
    NSLayoutConstraint* c = (NSLayoutConstraint*)object;
    if ([key isEqualToString:@"constant"]) { c.constant = [value doubleValue]; return YES; }
    if ([key isEqualToString:@"identifier"]) {
      c.identifier = [value isKindOfClass:NSString.class] ? value : nil;
      return YES;
    }
    if ([key isEqualToString:@"priority"]) {
      UILayoutPriority priority;
      if (!LayoutPriorityFromValue(value, &priority)) {
        *error = EnumError(@"priority", value, NamesForLayoutPriority());
        return YES;
      }
      c.priority = priority;
      return YES;
    }
    if ([key isEqualToString:@"isActive"]) {
      // 两端没有公共祖先时 UIKit 抛 NSGenericException。不接住整个 App 就挂了，
      // 而这是 JS 写错了，必须变成 JS 的异常。这是少数几处接 NSException 的地方
      // ——判据是「不接的代价是崩溃，而错误来自调用方」。
      @try {
        c.active = [value boolValue];
      } @catch (NSException* e) {
        *error = [NSString stringWithFormat:@"failed to activate constraint: %@", e.reason].UTF8String;
      }
      return YES;
    }
  }

  if ([object isKindOfClass:UILayoutGuide.class]) {
    if ([key isEqualToString:@"identifier"]) {
      ((UILayoutGuide*)object).identifier =
          [value isKindOfClass:NSString.class] ? value : @"";
      return YES;
    }
  }
  return NO;
}

nacre::NativeObjectRef ReadLayoutObjectProperty(id object,
                                            const std::string& name) {
  // UIWindow 也是 UIView，所以这条放在 UIWindow 的分支之后，名字不重叠。
  if ([object isKindOfClass:UILayoutGuide.class]) {
    UILayoutGuide* guide = (UILayoutGuide*)object;
    if (name == "owningView") return {(__bridge void*)guide.owningView, "UIView"};
    nacre::NativeObjectRef anchor = AnchorNamed(guide, name);
    if (anchor.ptr != nullptr) return anchor;
  }

  if ([object isKindOfClass:NSLayoutConstraint.class]) {
    NSLayoutConstraint* c = (NSLayoutConstraint*)object;
    // firstItem / secondItem 刻意不暴露：它们是 assign，view 死了就是野指针，
    // 头文件自己写着「Access to these properties is not recommended」。
    if (name == "firstAnchor") {
      return {(__bridge void*)c.firstAnchor, AnchorClassName(c.firstAnchor)};
    }
    if (name == "secondAnchor") {
      return {(__bridge void*)c.secondAnchor, AnchorClassName(c.secondAnchor)};
    }
  }
  return {};
}

}  // namespace nacre_bridge
