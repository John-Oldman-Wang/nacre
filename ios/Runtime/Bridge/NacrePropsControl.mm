// 控件。UIControl 和 UIButton —— UIButton 的分支必须在 UIControl 之前，它是子类。
//
// 属性分发按能力域拆开，这里只装这一个域；调用顺序在 NacreProperties.mm。

#import "NacreBridge.h"

namespace nacre_bridge {

id ReadControlProperty(id object, NSString* key) {
  id value = nil;
  if ([object isKindOfClass:UIBarButtonItem.class]) {
    UIBarButtonItem* item = (UIBarButtonItem*)object;
    if ([key isEqualToString:@"style"]) {
      value = NameForBarButtonItemStyle(item.style);
    } else if ([key isEqualToString:@"width"]) {
      value = @(item.width);
    } else if ([key isEqualToString:@"isHidden"]) {
      value = @(item.isHidden);
    } else if ([key isEqualToString:@"title"]) {
      value = item.title;
    } else if ([key isEqualToString:@"isEnabled"]) {
      value = @(item.isEnabled);
    } else if ([key isEqualToString:@"tag"]) {
      value = @(item.tag);
    }
  }
  // UIButton 放在 UIControl 之前：它是 UIControl 的子类
  if (value == nil && [object isKindOfClass:UIButton.class]) {
    UIButton* button = (UIButton*)object;
    if ([key isEqualToString:@"buttonType"]) {
      value = NameForButtonType(button.buttonType);
    } else if ([key isEqualToString:@"role"]) {
      value = NameForButtonRole(button.role);
    } else if ([key isEqualToString:@"currentTitle"]) {
      value = button.currentTitle;
    }
  }

  // UIControl 放在 UIView 之后：它是 UIView 的子类，名字不重叠
  if (value == nil && [object isKindOfClass:UIControl.class]) {
    UIControl* control = (UIControl*)object;
    if ([key isEqualToString:@"isEnabled"]) {
      value = @(control.isEnabled);
    } else if ([key isEqualToString:@"isSelected"]) {
      value = @(control.isSelected);
    } else if ([key isEqualToString:@"isHighlighted"]) {
      value = @(control.isHighlighted);
    } else if ([key isEqualToString:@"isTracking"]) {
      value = @(control.isTracking);
    } else if ([key isEqualToString:@"isTouchInside"]) {
      value = @(control.isTouchInside);
    } else if ([key isEqualToString:@"state"]) {
      // normal 是 0，从掩码里拆不出来，单独给
      NSArray<NSString*>* names = NamesInControlState(control.state);
      value = names.count > 0 ? names : @[ @"normal" ];
    } else if ([key isEqualToString:@"contentHorizontalAlignment"]) {
      value = NameForControlHorizontalAlignment(control.contentHorizontalAlignment);
    } else if ([key isEqualToString:@"contentVerticalAlignment"]) {
      value = NameForControlVerticalAlignment(control.contentVerticalAlignment);
    }
  }
  return value;
}

BOOL WriteControlProperty(id object, NSString* key, id value,
                      std::string* error) {
  if ([object isKindOfClass:UIBarButtonItem.class]) {
    UIBarButtonItem* item = (UIBarButtonItem*)object;
    if ([key isEqualToString:@"style"]) {
      UIBarButtonItemStyle style;
      if (!BarButtonItemStyleFromName(value, &style)) {
        *error = EnumError(@"style", value, NamesForBarButtonItemStyle());
        return YES;
      }
      item.style = style;
      return YES;
    }
    if ([key isEqualToString:@"width"]) { item.width = [value doubleValue]; return YES; }
    if ([key isEqualToString:@"isHidden"]) { item.hidden = [value boolValue]; return YES; }
    if ([key isEqualToString:@"title"]) {
      item.title = [value isKindOfClass:NSString.class] ? value : nil;
      return YES;
    }
    if ([key isEqualToString:@"isEnabled"]) {
      item.enabled = [value boolValue];
      return YES;
    }
    if ([key isEqualToString:@"tag"]) { item.tag = [value integerValue]; return YES; }
  }
  if ([object isKindOfClass:UIButton.class]) {
    if ([key isEqualToString:@"role"]) {
      UIButtonRole role;
      if (!ButtonRoleFromName(value, &role)) {
        *error = EnumError(@"role", value, NamesForButtonRole());
        return YES;
      }
      ((UIButton*)object).role = role;
      return YES;
    }
  }

  if ([object isKindOfClass:UIControl.class]) {
    UIControl* control = (UIControl*)object;
    if ([key isEqualToString:@"isEnabled"]) { control.enabled = [value boolValue]; return YES; }
    if ([key isEqualToString:@"isSelected"]) { control.selected = [value boolValue]; return YES; }
    if ([key isEqualToString:@"isHighlighted"]) {
      control.highlighted = [value boolValue];
      return YES;
    }
    if ([key isEqualToString:@"contentHorizontalAlignment"]) {
      UIControlContentHorizontalAlignment a;
      if (!ControlHorizontalAlignmentFromName(value, &a)) {
        *error = EnumError(@"contentHorizontalAlignment", value,
                           NamesForControlHorizontalAlignment());
        return YES;
      }
      control.contentHorizontalAlignment = a;
      return YES;
    }
    if ([key isEqualToString:@"contentVerticalAlignment"]) {
      UIControlContentVerticalAlignment a;
      if (!ControlVerticalAlignmentFromName(value, &a)) {
        *error = EnumError(@"contentVerticalAlignment", value,
                           NamesForControlVerticalAlignment());
        return YES;
      }
      control.contentVerticalAlignment = a;
      return YES;
    }
  }
  return NO;
}

nacre::NativeObjectRef ReadControlObjectProperty(id object,
                                            const std::string& name) {
  if ([object isKindOfClass:UIBarButtonItem.class]) {
    UIBarButtonItem* item = (UIBarButtonItem*)object;
    if (name == "customView") {
      return {(__bridge void*)item.customView, "UIView"};
    }
    if (name == "image") {
      return {(__bridge void*)item.image, "UIImage"};
    }
  }
  if ([object isKindOfClass:UIButton.class]) {
    UIButton* button = (UIButton*)object;
    if (name == "titleLabel") return {(__bridge void*)button.titleLabel, "UILabel"};
    if (name == "imageView") return {(__bridge void*)button.imageView, "UIImageView"};
    if (name == "currentTitleColor") {
      return {(__bridge void*)button.currentTitleColor, "UIColor"};
    }
    if (name == "currentImage") return {(__bridge void*)button.currentImage, "UIImage"};
    if (name == "currentBackgroundImage") {
      return {(__bridge void*)button.currentBackgroundImage, "UIImage"};
    }
  }
  return {};
}

void WriteControlObjectProperty(id object, const std::string& name, id value) {
  if ([object isKindOfClass:UIBarButtonItem.class]) {
    UIBarButtonItem* item = (UIBarButtonItem*)object;
    if (name == "customView") {
      item.customView = [value isKindOfClass:UIView.class] ? value : nil;
    } else if (name == "image") {
      item.image = [value isKindOfClass:UIImage.class] ? value : nil;
    }
  }
}

}  // namespace nacre_bridge
