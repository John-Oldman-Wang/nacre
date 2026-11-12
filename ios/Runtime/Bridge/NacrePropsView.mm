// 视图本体和它的两个叶子类。UIView、UILabel、UIImageView。
//
// 属性分发按能力域拆开，这里只装这一个域；调用顺序在 NacreProperties.mm。

#import "NacreBridge.h"

namespace nacre_bridge {

id ReadViewProperty(id object, NSString* key) {
  id value = nil;
  // first responder 的两个状态。挂在 UIResponder 上，所以 view 和
  // viewController 都读得到
  if ([object isKindOfClass:UIResponder.class]) {
    if ([key isEqualToString:@"isFirstResponder"]) {
      return @(((UIResponder*)object).isFirstResponder);
    }
    if ([key isEqualToString:@"canBecomeFirstResponder"]) {
      return @(((UIResponder*)object).canBecomeFirstResponder);
    }
  }
  if (value == nil && [object isKindOfClass:UIView.class]) {
    UIView* view = (UIView*)object;
    if ([key isEqualToString:@"frame"]) {
      value = RectToJSON(view.frame);
    } else if ([key isEqualToString:@"bounds"]) {
      value = RectToJSON(view.bounds);
    } else if ([key isEqualToString:@"center"]) {
      value = PointToJSON(view.center);
    } else if ([key isEqualToString:@"safeAreaInsets"]) {
      value = InsetsToJSON(view.safeAreaInsets);
    } else if ([key isEqualToString:@"layoutMargins"]) {
      value = InsetsToJSON(view.layoutMargins);
    } else if ([key isEqualToString:@"directionalLayoutMargins"]) {
      value = DirectionalInsetsToJSON(view.directionalLayoutMargins);
    } else if ([key isEqualToString:@"insetsLayoutMarginsFromSafeArea"]) {
      value = @(view.insetsLayoutMarginsFromSafeArea);
    } else if ([key isEqualToString:@"preservesSuperviewLayoutMargins"]) {
      value = @(view.preservesSuperviewLayoutMargins);
    } else if ([key isEqualToString:@"alpha"]) {
      value = @(view.alpha);
    } else if ([key isEqualToString:@"isHidden"]) {
      value = @(view.isHidden);
    } else if ([key isEqualToString:@"clipsToBounds"]) {
      value = @(view.clipsToBounds);
    } else if ([key isEqualToString:@"isOpaque"]) {
      value = @(view.isOpaque);
    } else if ([key isEqualToString:@"isUserInteractionEnabled"]) {
      value = @(view.isUserInteractionEnabled);
    } else if ([key isEqualToString:@"tag"]) {
      value = @(view.tag);
    } else if ([key isEqualToString:@"contentMode"]) {
      value = NameForContentMode(view.contentMode);
    } else if ([key isEqualToString:@"intrinsicContentSize"]) {
      value = SizeToJSON(view.intrinsicContentSize);
    } else if ([key isEqualToString:@"transform"]) {
      value = TransformToJSON(view.transform);
    } else if ([key isEqualToString:@"translatesAutoresizingMaskIntoConstraints"]) {
      value = @(view.translatesAutoresizingMaskIntoConstraints);
    } else if ([key isEqualToString:@"hasAmbiguousLayout"]) {
      value = @(view.hasAmbiguousLayout);
    }
  }

  if (value == nil && [object isKindOfClass:UILabel.class]) {
    UILabel* label = (UILabel*)object;
    if ([key isEqualToString:@"text"]) {
      value = label.text;
    } else if ([key isEqualToString:@"textAlignment"]) {
      value = NameForTextAlignment(label.textAlignment);
    } else if ([key isEqualToString:@"lineBreakMode"]) {
      value = NameForLineBreakMode(label.lineBreakMode);
    } else if ([key isEqualToString:@"numberOfLines"]) {
      value = @(label.numberOfLines);
    } else if ([key isEqualToString:@"adjustsFontSizeToFitWidth"]) {
      value = @(label.adjustsFontSizeToFitWidth);
    } else if ([key isEqualToString:@"minimumScaleFactor"]) {
      value = @(label.minimumScaleFactor);
    } else if ([key isEqualToString:@"isHighlighted"]) {
      value = @(label.isHighlighted);
    } else if ([key isEqualToString:@"isEnabled"]) {
      value = @(label.isEnabled);
    } else if ([key isEqualToString:@"preferredMaxLayoutWidth"]) {
      value = @(label.preferredMaxLayoutWidth);
    } else if ([key isEqualToString:@"shadowOffset"]) {
      value = SizeToJSON(label.shadowOffset);
    } else if ([key isEqualToString:@"baselineAdjustment"]) {
      value = NameForBaselineAdjustment(label.baselineAdjustment);
    }
  }

  // UIImageView 要放在 UILabel 之前吗？不用——两者都是 UIView 的兄弟，
  // 名字不重叠。但 isHighlighted 两边都有，所以各自的分支里都写一遍。
  if (value == nil && [object isKindOfClass:UIImageView.class]) {
    UIImageView* iv = (UIImageView*)object;
    if ([key isEqualToString:@"isHighlighted"]) {
      value = @(iv.isHighlighted);
    } else if ([key isEqualToString:@"isAnimating"]) {
      value = @(iv.isAnimating);
    }
  }
  return value;
}

BOOL WriteViewProperty(id object, NSString* key, id value,
                      std::string* error) {
  if ([object isKindOfClass:UIView.class]) {
    UIView* view = (UIView*)object;
    if ([key isEqualToString:@"translatesAutoresizingMaskIntoConstraints"]) {
      view.translatesAutoresizingMaskIntoConstraints = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"transform"]) {
      view.transform = JSONToTransform(value);
      return YES;
    }
    if ([key isEqualToString:@"frame"]) { view.frame = JSONToRect(value); return YES; }
    if ([key isEqualToString:@"bounds"]) { view.bounds = JSONToRect(value); return YES; }
    if ([key isEqualToString:@"center"]) { view.center = JSONToPoint(value); return YES; }
    // 内边距。两个属性是同一份数据的两个视图：写哪个，另一个跟着变
    if ([key isEqualToString:@"layoutMargins"]) {
      view.layoutMargins = JSONToInsets(value);
      return YES;
    }
    if ([key isEqualToString:@"directionalLayoutMargins"]) {
      view.directionalLayoutMargins = JSONToDirectionalInsets(value);
      return YES;
    }
    if ([key isEqualToString:@"insetsLayoutMarginsFromSafeArea"]) {
      view.insetsLayoutMarginsFromSafeArea = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"preservesSuperviewLayoutMargins"]) {
      view.preservesSuperviewLayoutMargins = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"alpha"]) { view.alpha = NACRE_NUM(value, key); return YES; }
    if ([key isEqualToString:@"isHidden"]) { view.hidden = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"clipsToBounds"]) {
      view.clipsToBounds = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"isOpaque"]) { view.opaque = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"isUserInteractionEnabled"]) {
      view.userInteractionEnabled = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"tag"]) { view.tag = NACRE_INT(value, key); return YES; }
    if ([key isEqualToString:@"contentMode"]) {
      UIViewContentMode mode;
      if (!ContentModeFromName(value, &mode)) {
        *error = EnumError(@"contentMode", value, NamesForContentMode());
        return YES;
      }
      view.contentMode = mode;
      return YES;
    }
  }

  if ([object isKindOfClass:UIImageView.class]) {
    UIImageView* iv = (UIImageView*)object;
    if ([key isEqualToString:@"isHighlighted"]) {
      iv.highlighted = NACRE_BOOL(value, key);
      return YES;
    }
  }

  if ([object isKindOfClass:UILabel.class]) {
    UILabel* label = (UILabel*)object;
    if ([key isEqualToString:@"text"]) {
      label.text = [value isKindOfClass:NSString.class] ? value : nil;
      return YES;
    }
    if ([key isEqualToString:@"textAlignment"]) {
      NSTextAlignment a;
      if (!TextAlignmentFromName(value, &a)) {
        *error = EnumError(@"textAlignment", value, NamesForTextAlignment());
        return YES;
      }
      label.textAlignment = a;
      return YES;
    }
    if ([key isEqualToString:@"lineBreakMode"]) {
      NSLineBreakMode m;
      if (!LineBreakModeFromName(value, &m)) {
        *error = EnumError(@"lineBreakMode", value, NamesForLineBreakMode());
        return YES;
      }
      label.lineBreakMode = m;
      return YES;
    }
    if ([key isEqualToString:@"baselineAdjustment"]) {
      UIBaselineAdjustment b;
      if (!BaselineAdjustmentFromName(value, &b)) {
        *error = EnumError(@"baselineAdjustment", value, NamesForBaselineAdjustment());
        return YES;
      }
      label.baselineAdjustment = b;
      return YES;
    }
    if ([key isEqualToString:@"numberOfLines"]) {
      label.numberOfLines = NACRE_INT(value, key);
      return YES;
    }
    if ([key isEqualToString:@"adjustsFontSizeToFitWidth"]) {
      label.adjustsFontSizeToFitWidth = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"minimumScaleFactor"]) {
      label.minimumScaleFactor = NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"isHighlighted"]) {
      label.highlighted = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"isEnabled"]) { label.enabled = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"preferredMaxLayoutWidth"]) {
      label.preferredMaxLayoutWidth = NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"shadowOffset"]) {
      label.shadowOffset = JSONToSize(value);
      return YES;
    }
  }
  return NO;
}

nacre::NativeObjectRef ReadViewObjectProperty(id object,
                                            const std::string& name) {
  if ([object isKindOfClass:UIView.class]) {
    UIView* view = (UIView*)object;
    if (name == "layer") return {(__bridge void*)view.layer, "CALayer"};
    if (name == "backgroundColor") return {(__bridge void*)view.backgroundColor, "UIColor"};
    if (name == "safeAreaLayoutGuide") {
      return {(__bridge void*)view.safeAreaLayoutGuide, "UILayoutGuide"};
    }
    if (name == "layoutMarginsGuide") {
      return {(__bridge void*)view.layoutMarginsGuide, "UILayoutGuide"};
    }
    // 键盘避让：收起时它贴安全区底边，弹出时贴键盘顶边，所以一条约束
    // 管两种状态——不用听键盘通知，也不用自己算动画
    if (name == "keyboardLayoutGuide") {
      return {(__bridge void*)view.keyboardLayoutGuide, "UIKeyboardLayoutGuide"};
    }
    if (name == "readableContentGuide") {
      return {(__bridge void*)view.readableContentGuide, "UILayoutGuide"};
    }
    nacre::NativeObjectRef anchor = AnchorNamed(view, name);
    if (anchor.ptr != nullptr) return anchor;
    if (name == "superview") return {(__bridge void*)view.superview, "UIView"};
    if (name == "window") return {(__bridge void*)view.window, "UIWindow"};
  }

  if ([object isKindOfClass:UIImageView.class]) {
    UIImageView* iv = (UIImageView*)object;
    if (name == "image") return {(__bridge void*)iv.image, "UIImage"};
    if (name == "highlightedImage") {
      return {(__bridge void*)iv.highlightedImage, "UIImage"};
    }
    if (name == "tintColor") return {(__bridge void*)iv.tintColor, "UIColor"};
  }

  // 输入框的字体和文字色。和 UILabel 的同名属性是两个类上的两件事，
  // 所以分开写——UITextField 不是 UILabel 的子类
  if ([object isKindOfClass:UITextField.class]) {
    UITextField* field = (UITextField*)object;
    if (name == "font") return {(__bridge void*)field.font, "UIFont"};
    if (name == "textColor") return {(__bridge void*)field.textColor, "UIColor"};
  }

  if ([object isKindOfClass:UILabel.class]) {
    UILabel* label = (UILabel*)object;
    if (name == "font") return {(__bridge void*)label.font, "UIFont"};
    if (name == "textColor") return {(__bridge void*)label.textColor, "UIColor"};
    if (name == "shadowColor") return {(__bridge void*)label.shadowColor, "UIColor"};
    if (name == "highlightedTextColor") {
      return {(__bridge void*)label.highlightedTextColor, "UIColor"};
    }
  }
  return {};
}

void ReadViewObjectArray(id object, const std::string& name,
                        std::vector<nacre::NativeObjectRef>& refs) {
  if ([object isKindOfClass:UIView.class] && name == "subviews") {
    for (UIView* child in ((UIView*)object).subviews) {
      refs.push_back({(__bridge void*)child, "UIView"});
    }
  }

  if ([object isKindOfClass:UIView.class] && name == "constraints") {
    for (NSLayoutConstraint* c in ((UIView*)object).constraints) {
      refs.push_back({(__bridge void*)c, "NSLayoutConstraint"});
    }
  }

  if ([object isKindOfClass:UIView.class] && name == "layoutGuides") {
    for (UILayoutGuide* g in ((UIView*)object).layoutGuides) {
      refs.push_back({(__bridge void*)g, "UILayoutGuide"});
    }
  }
}

void WriteViewObjectProperty(id object, const std::string& name, id value,
                             std::string* error) {
  if ([object isKindOfClass:UIView.class] && name == "backgroundColor") {
    ((UIView*)object).backgroundColor = NACRE_OBJECT_OR_NIL(value, UIColor, name);
  }

  if ([object isKindOfClass:UIImageView.class]) {
    UIImageView* iv = (UIImageView*)object;
    if (name == "image") {
      iv.image = NACRE_OBJECT_OR_NIL(value, UIImage, name);
    } else if (name == "highlightedImage") {
      iv.highlightedImage = NACRE_OBJECT_OR_NIL(value, UIImage, name);
    } else if (name == "tintColor") {
      // null_resettable：赋 nil 是合法的，表示退回继承来的那个
      iv.tintColor = NACRE_OBJECT_OR_NIL(value, UIColor, name);
    }
  }

  // 这个通道返回 void：没有「认不认领」的约定，各写各的就行
  if ([object isKindOfClass:UITextField.class]) {
    UITextField* field = (UITextField*)object;
    if (name == "font") {
      field.font = NACRE_OBJECT_OR_NIL(value, UIFont, name);
    } else if (name == "textColor") {
      field.textColor = NACRE_OBJECT_OR_NIL(value, UIColor, name);
    }
  }

  if ([object isKindOfClass:UILabel.class]) {
    UILabel* label = (UILabel*)object;
    if (name == "font") {
      label.font = NACRE_OBJECT_OR_NIL(value, UIFont, name);
    } else if (name == "textColor") {
      label.textColor = NACRE_OBJECT_OR_NIL(value, UIColor, name);
    } else if (name == "shadowColor") {
      label.shadowColor = NACRE_OBJECT_OR_NIL(value, UIColor, name);
    } else if (name == "highlightedTextColor") {
      label.highlightedTextColor = NACRE_OBJECT_OR_NIL(value, UIColor, name);
    }
  }
}

}  // namespace nacre_bridge
