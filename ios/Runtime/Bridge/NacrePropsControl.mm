// 控件。UIControl 和 UIButton —— UIButton 的分支必须在 UIControl 之前，它是子类。
//
// 属性分发按能力域拆开，这里只装这一个域；调用顺序在 NacreProperties.mm。

#import "NacreBridge.h"

namespace nacre_bridge {

id ReadControlProperty(id object, NSString* key) {
  id value = nil;
  if ([object isKindOfClass:UITextField.class]) {
    UITextField* field = (UITextField*)object;
    if ([key isEqualToString:@"text"]) return field.text ?: @"";
    if ([key isEqualToString:@"placeholder"]) return field.placeholder;
    if ([key isEqualToString:@"isEditing"]) return @(field.isEditing);
    if ([key isEqualToString:@"isSecureTextEntry"]) return @(field.isSecureTextEntry);
    if ([key isEqualToString:@"clearsOnBeginEditing"]) return @(field.clearsOnBeginEditing);
    if ([key isEqualToString:@"adjustsFontSizeToFitWidth"]) {
      return @(field.adjustsFontSizeToFitWidth);
    }
    if ([key isEqualToString:@"minimumFontSize"]) return @(field.minimumFontSize);
    if ([key isEqualToString:@"textAlignment"]) {
      return NameForTextAlignment(field.textAlignment);
    }
    if ([key isEqualToString:@"enablesReturnKeyAutomatically"]) {
      return @(field.enablesReturnKeyAutomatically);
    }
    if ([key isEqualToString:@"keyboardType"]) return NameForKeyboardType(field.keyboardType);
    if ([key isEqualToString:@"returnKeyType"]) return NameForReturnKeyType(field.returnKeyType);
    if ([key isEqualToString:@"autocapitalizationType"]) {
      return NameForTextAutocapitalizationType(field.autocapitalizationType);
    }
    if ([key isEqualToString:@"autocorrectionType"]) {
      return NameForTextAutocorrectionType(field.autocorrectionType);
    }
    if ([key isEqualToString:@"spellCheckingType"]) {
      return NameForTextSpellCheckingType(field.spellCheckingType);
    }
    if ([key isEqualToString:@"keyboardAppearance"]) {
      return NameForKeyboardAppearance(field.keyboardAppearance);
    }
    if ([key isEqualToString:@"borderStyle"]) return NameForTextBorderStyle(field.borderStyle);
    if ([key isEqualToString:@"clearButtonMode"]) {
      return NameForTextFieldViewMode(field.clearButtonMode);
    }
    // 没配过是 nil，JS 侧读到 null
    if ([key isEqualToString:@"textContentType"]) {
      return NameForTextContentType(field.textContentType);
    }
  }
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
  if ([object isKindOfClass:UITextField.class]) {
    UITextField* field = (UITextField*)object;
    if ([key isEqualToString:@"text"]) {
      field.text = [value isKindOfClass:NSString.class] ? value : @"";
      return YES;
    }
    if ([key isEqualToString:@"placeholder"]) {
      field.placeholder = [value isKindOfClass:NSString.class] ? value : nil;
      return YES;
    }
    if ([key isEqualToString:@"isSecureTextEntry"]) {
      field.secureTextEntry = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"clearsOnBeginEditing"]) {
      field.clearsOnBeginEditing = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"adjustsFontSizeToFitWidth"]) {
      field.adjustsFontSizeToFitWidth = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"minimumFontSize"]) {
      field.minimumFontSize = NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"textAlignment"]) {
      NSTextAlignment out;
      if (!TextAlignmentFromName(value, &out)) {
        *error = EnumError(@"textAlignment", value, NamesForTextAlignment());
        return YES;
      }
      field.textAlignment = out;
      return YES;
    }
    if ([key isEqualToString:@"enablesReturnKeyAutomatically"]) {
      field.enablesReturnKeyAutomatically = NACRE_BOOL(value, key);
      return YES;
    }
    // 这八个形状一样，但**不用宏铺开**：check-api.sh 按 isEqualToString
    // 后面那个字符串字面量抽属性名，宏会把它藏成 @KEY，于是这八个属性在
    // 三边核对里凭空消失。能被检查看见比少写几行重要。
    if ([key isEqualToString:@"keyboardType"]) {
      UIKeyboardType out;
      if (!KeyboardTypeFromName(value, &out)) {
        *error = EnumError(@"keyboardType", value, NamesForKeyboardType());
        return YES;
      }
      field.keyboardType = out;
      return YES;
    }
    if ([key isEqualToString:@"returnKeyType"]) {
      UIReturnKeyType out;
      if (!ReturnKeyTypeFromName(value, &out)) {
        *error = EnumError(@"returnKeyType", value, NamesForReturnKeyType());
        return YES;
      }
      field.returnKeyType = out;
      return YES;
    }
    if ([key isEqualToString:@"autocapitalizationType"]) {
      UITextAutocapitalizationType out;
      if (!TextAutocapitalizationTypeFromName(value, &out)) {
        *error = EnumError(@"autocapitalizationType", value, NamesForTextAutocapitalizationType());
        return YES;
      }
      field.autocapitalizationType = out;
      return YES;
    }
    if ([key isEqualToString:@"autocorrectionType"]) {
      UITextAutocorrectionType out;
      if (!TextAutocorrectionTypeFromName(value, &out)) {
        *error = EnumError(@"autocorrectionType", value, NamesForTextAutocorrectionType());
        return YES;
      }
      field.autocorrectionType = out;
      return YES;
    }
    if ([key isEqualToString:@"spellCheckingType"]) {
      UITextSpellCheckingType out;
      if (!TextSpellCheckingTypeFromName(value, &out)) {
        *error = EnumError(@"spellCheckingType", value, NamesForTextSpellCheckingType());
        return YES;
      }
      field.spellCheckingType = out;
      return YES;
    }
    if ([key isEqualToString:@"keyboardAppearance"]) {
      UIKeyboardAppearance out;
      if (!KeyboardAppearanceFromName(value, &out)) {
        *error = EnumError(@"keyboardAppearance", value, NamesForKeyboardAppearance());
        return YES;
      }
      field.keyboardAppearance = out;
      return YES;
    }
    if ([key isEqualToString:@"borderStyle"]) {
      UITextBorderStyle out;
      if (!TextBorderStyleFromName(value, &out)) {
        *error = EnumError(@"borderStyle", value, NamesForTextBorderStyle());
        return YES;
      }
      field.borderStyle = out;
      return YES;
    }
    if ([key isEqualToString:@"clearButtonMode"]) {
      UITextFieldViewMode out;
      if (!TextFieldViewModeFromName(value, &out)) {
        *error = EnumError(@"clearButtonMode", value, NamesForTextFieldViewMode());
        return YES;
      }
      field.clearButtonMode = out;
      return YES;
    }
    if ([key isEqualToString:@"textContentType"]) {
      if (value == nil || value == NSNull.null) {
        field.textContentType = nil;
        return YES;
      }
      UITextContentType out = nil;
      if (!TextContentTypeFromName(value, &out)) {
        *error = EnumError(@"textContentType", value, NamesForTextContentType());
        return YES;
      }
      field.textContentType = out;
      return YES;
    }
  }
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
    if ([key isEqualToString:@"width"]) { item.width = NACRE_NUM(value, key); return YES; }
    if ([key isEqualToString:@"isHidden"]) { item.hidden = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"title"]) {
      item.title = [value isKindOfClass:NSString.class] ? value : nil;
      return YES;
    }
    if ([key isEqualToString:@"isEnabled"]) {
      item.enabled = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"tag"]) { item.tag = NACRE_INT(value, key); return YES; }
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
    if ([key isEqualToString:@"isEnabled"]) { control.enabled = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"isSelected"]) { control.selected = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"isHighlighted"]) {
      control.highlighted = NACRE_BOOL(value, key);
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
