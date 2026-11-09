// 属性分发。标量走 JSON，对象走句柄，数组走句柄数组。
// 加一个属性只要在这里加一行，不用动 C++ 的桥。

#import "NacreBridge.h"

#import <os/log.h>

namespace nacre_bridge {

std::string ReadNativeProperty(id object, const std::string& name) {
  NSString* key = @(name.c_str());
  id value = nil;
  if ([object isKindOfClass:UIScene.class]) {
    UIScene* scene = (UIScene*)object;
    if ([key isEqualToString:@"activationState"]) {
      value = SceneActivationName(scene.activationState);
    } else if ([key isEqualToString:@"title"]) {
      value = scene.title;
    } else if ([key isEqualToString:@"subtitle"]) {
      value = scene.subtitle;
    } else if ([key isEqualToString:@"isFullScreen"] &&
               [scene isKindOfClass:UIWindowScene.class]) {
      value = @(((UIWindowScene*)scene).isFullScreen);
    }
  } else if ([object isKindOfClass:UIWindow.class]) {
    UIWindow* window = (UIWindow*)object;
    if ([key isEqualToString:@"windowLevel"]) {
      value = @(window.windowLevel);
    } else if ([key isEqualToString:@"isKeyWindow"]) {
      value = @(window.isKeyWindow);
    } else if ([key isEqualToString:@"canBecomeKeyWindow"]) {
      value = @(window.canBecomeKeyWindow);
    }
  } else if ([object isKindOfClass:UISceneSession.class]) {
    UISceneSession* session = (UISceneSession*)object;
    if ([key isEqualToString:@"role"]) {
      value = session.role;
    } else if ([key isEqualToString:@"persistentIdentifier"]) {
      value = session.persistentIdentifier;
    } else if ([key isEqualToString:@"userInfo"]) {
      value = session.userInfo;
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
    } else if ([key isEqualToString:@"translatesAutoresizingMaskIntoConstraints"]) {
      value = @(view.translatesAutoresizingMaskIntoConstraints);
    } else if ([key isEqualToString:@"hasAmbiguousLayout"]) {
      value = @(view.hasAmbiguousLayout);
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
  if (value == nil && [object isKindOfClass:CALayer.class]) {
    CALayer* layer = (CALayer*)object;
    if ([key isEqualToString:@"cornerRadius"]) {
      value = @(layer.cornerRadius);
    } else if ([key isEqualToString:@"cornerCurve"]) {
      value = NameForCornerCurve(layer.cornerCurve);
    } else if ([key isEqualToString:@"maskedCorners"]) {
      value = NamesInCornerMask(layer.maskedCorners);
    } else if ([key isEqualToString:@"borderWidth"]) {
      value = @(layer.borderWidth);
    } else if ([key isEqualToString:@"shadowOpacity"]) {
      value = @(layer.shadowOpacity);
    } else if ([key isEqualToString:@"shadowRadius"]) {
      value = @(layer.shadowRadius);
    } else if ([key isEqualToString:@"shadowOffset"]) {
      value = SizeToJSON(layer.shadowOffset);
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
  if (value == nil && [object isKindOfClass:UIImage.class]) {
    UIImage* image = (UIImage*)object;
    if ([key isEqualToString:@"size"]) {
      // 点，不是像素。像素 = size × scale
      value = SizeToJSON(image.size);
    } else if ([key isEqualToString:@"scale"]) {
      value = @(image.scale);
    } else if ([key isEqualToString:@"imageOrientation"]) {
      value = NameForImageOrientation(image.imageOrientation);
    } else if ([key isEqualToString:@"isSymbolImage"]) {
      value = @(image.isSymbolImage);
    } else if ([key isEqualToString:@"renderingMode"]) {
      value = NameForImageRenderingMode(image.renderingMode);
    } else if ([key isEqualToString:@"capInsets"]) {
      value = InsetsToJSON(image.capInsets);
    } else if ([key isEqualToString:@"resizingMode"]) {
      value = NameForImageResizingMode(image.resizingMode);
    } else if ([key isEqualToString:@"alignmentRectInsets"]) {
      value = InsetsToJSON(image.alignmentRectInsets);
    } else if ([key isEqualToString:@"duration"]) {
      value = @(image.duration);
    }
  }
  if (value == nil && [object isKindOfClass:NacreBlob.class]) {
    NacreBlob* blob = (NacreBlob*)object;
    if ([key isEqualToString:@"size"]) {
      value = @(blob.data.length);
    } else if ([key isEqualToString:@"type"]) {
      value = blob.type ?: @"";
    }
  }
  if (value == nil && [object isKindOfClass:UIFont.class]) {
    UIFont* font = (UIFont*)object;
    if ([key isEqualToString:@"familyName"]) {
      value = font.familyName;
    } else if ([key isEqualToString:@"fontName"]) {
      value = font.fontName;
    } else if ([key isEqualToString:@"pointSize"]) {
      value = @(font.pointSize);
    } else if ([key isEqualToString:@"ascender"]) {
      value = @(font.ascender);
    } else if ([key isEqualToString:@"descender"]) {
      value = @(font.descender);
    } else if ([key isEqualToString:@"capHeight"]) {
      value = @(font.capHeight);
    } else if ([key isEqualToString:@"xHeight"]) {
      value = @(font.xHeight);
    } else if ([key isEqualToString:@"lineHeight"]) {
      value = @(font.lineHeight);
    } else if ([key isEqualToString:@"leading"]) {
      value = @(font.leading);
    }
  }
  return EncodeJSON(value);
}

// 写不进去就往 error 里写一句话，引擎据此抛 TypeError——写不进去又不报错
// 是最难查的那种错。两种情况都在这里凑话：这个对象没有这个可写属性，或者
// 枚举给了个不认识的名字。
//
// 错误信息只能在这里凑：可选值列表就在上面那几张表里，而且这里知道上下文
// （哪个类、哪个属性），所以不会有 UIControl.state 和 UIGestureRecognizer
// .state 这种按属性名索引就会撞的问题。
void WriteNativeProperty(id object, const std::string& name, const std::string& json,
                         std::string* error) {
  NSString* key = @(name.c_str());
  id value = DecodeJSON(json);
  // 每个分支写完就 return，末尾统一填「没有这个属性」。
  if ([object isKindOfClass:UIScene.class]) {
    UIScene* scene = (UIScene*)object;
    if ([key isEqualToString:@"title"]) {
      scene.title = [value isKindOfClass:NSString.class] ? value : nil;
      return;
    }
    if ([key isEqualToString:@"subtitle"]) {
      scene.subtitle = [value isKindOfClass:NSString.class] ? value : @"";
      return;
    }
  }
  if ([object isKindOfClass:UIWindow.class]) {
    if ([key isEqualToString:@"windowLevel"]) {
      ((UIWindow*)object).windowLevel = [value doubleValue];
      return;
    }
  }
  if ([object isKindOfClass:UISceneSession.class]) {
    if ([key isEqualToString:@"userInfo"]) {
      ((UISceneSession*)object).userInfo =
          [value isKindOfClass:NSDictionary.class] ? value : nil;
      return;
    }
  }
  if ([object isKindOfClass:UIButton.class]) {
    if ([key isEqualToString:@"role"]) {
      UIButtonRole role;
      if (!ButtonRoleFromName(value, &role)) {
        *error = EnumError(@"role", value, NamesForButtonRole());
        return;
      }
      ((UIButton*)object).role = role;
      return;
    }
  }
  if ([object isKindOfClass:UIControl.class]) {
    UIControl* control = (UIControl*)object;
    if ([key isEqualToString:@"isEnabled"]) { control.enabled = [value boolValue]; return; }
    if ([key isEqualToString:@"isSelected"]) { control.selected = [value boolValue]; return; }
    if ([key isEqualToString:@"isHighlighted"]) {
      control.highlighted = [value boolValue];
      return;
    }
    if ([key isEqualToString:@"contentHorizontalAlignment"]) {
      UIControlContentHorizontalAlignment a;
      if (!ControlHorizontalAlignmentFromName(value, &a)) {
        *error = EnumError(@"contentHorizontalAlignment", value,
                           NamesForControlHorizontalAlignment());
        return;
      }
      control.contentHorizontalAlignment = a;
      return;
    }
    if ([key isEqualToString:@"contentVerticalAlignment"]) {
      UIControlContentVerticalAlignment a;
      if (!ControlVerticalAlignmentFromName(value, &a)) {
        *error = EnumError(@"contentVerticalAlignment", value,
                           NamesForControlVerticalAlignment());
        return;
      }
      control.contentVerticalAlignment = a;
      return;
    }
  }
  if ([object isKindOfClass:NSLayoutConstraint.class]) {
    NSLayoutConstraint* c = (NSLayoutConstraint*)object;
    if ([key isEqualToString:@"constant"]) { c.constant = [value doubleValue]; return; }
    if ([key isEqualToString:@"identifier"]) {
      c.identifier = [value isKindOfClass:NSString.class] ? value : nil;
      return;
    }
    if ([key isEqualToString:@"priority"]) {
      UILayoutPriority priority;
      if (!LayoutPriorityFromValue(value, &priority)) {
        *error = EnumError(@"priority", value, NamesForLayoutPriority());
        return;
      }
      c.priority = priority;
      return;
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
      return;
    }
  }
  if ([object isKindOfClass:CALayer.class]) {
    CALayer* layer = (CALayer*)object;
    if ([key isEqualToString:@"cornerRadius"]) {
      layer.cornerRadius = [value doubleValue];
      return;
    }
    if ([key isEqualToString:@"borderWidth"]) {
      layer.borderWidth = [value doubleValue];
      return;
    }
    if ([key isEqualToString:@"shadowOpacity"]) {
      layer.shadowOpacity = [value floatValue];
      return;
    }
    if ([key isEqualToString:@"shadowRadius"]) {
      layer.shadowRadius = [value doubleValue];
      return;
    }
    if ([key isEqualToString:@"shadowOffset"]) {
      layer.shadowOffset = JSONToSize(value);
      return;
    }
    if ([key isEqualToString:@"cornerCurve"]) {
      NSString* curve = CornerCurveFromName(value);
      if (curve == nil) {
        *error = EnumError(@"cornerCurve", value, NamesForCornerCurve());
        return;
      }
      layer.cornerCurve = curve;
      return;
    }
    if ([key isEqualToString:@"maskedCorners"]) {
      CACornerMask mask;
      id bad = nil;
      if (!CornerMaskFromNames(value, &mask, &bad)) {
        *error = bad != nil
                     ? EnumError(@"maskedCorners", bad, NamesForCornerMask())
                     : [NSString stringWithFormat:
                           @"maskedCorners needs an array of names; expected any of: %@",
                           NamesForCornerMask()].UTF8String;
        return;
      }
      layer.maskedCorners = mask;
      return;
    }
  }
  if ([object isKindOfClass:UILayoutGuide.class]) {
    if ([key isEqualToString:@"identifier"]) {
      ((UILayoutGuide*)object).identifier =
          [value isKindOfClass:NSString.class] ? value : @"";
      return;
    }
  }
  if ([object isKindOfClass:UIView.class]) {
    UIView* view = (UIView*)object;
    if ([key isEqualToString:@"translatesAutoresizingMaskIntoConstraints"]) {
      view.translatesAutoresizingMaskIntoConstraints = [value boolValue];
      return;
    }
    if ([key isEqualToString:@"frame"]) { view.frame = JSONToRect(value); return; }
    if ([key isEqualToString:@"bounds"]) { view.bounds = JSONToRect(value); return; }
    if ([key isEqualToString:@"center"]) { view.center = JSONToPoint(value); return; }
    if ([key isEqualToString:@"alpha"]) { view.alpha = [value doubleValue]; return; }
    if ([key isEqualToString:@"isHidden"]) { view.hidden = [value boolValue]; return; }
    if ([key isEqualToString:@"clipsToBounds"]) {
      view.clipsToBounds = [value boolValue];
      return;
    }
    if ([key isEqualToString:@"isOpaque"]) { view.opaque = [value boolValue]; return; }
    if ([key isEqualToString:@"isUserInteractionEnabled"]) {
      view.userInteractionEnabled = [value boolValue];
      return;
    }
    if ([key isEqualToString:@"tag"]) { view.tag = [value integerValue]; return; }
    if ([key isEqualToString:@"contentMode"]) {
      UIViewContentMode mode;
      if (!ContentModeFromName(value, &mode)) {
        *error = EnumError(@"contentMode", value, NamesForContentMode());
        return;
      }
      view.contentMode = mode;
      return;
    }
  }
  if ([object isKindOfClass:UIStackView.class]) {
    UIStackView* stack = (UIStackView*)object;
    if ([key isEqualToString:@"axis"]) {
      UILayoutConstraintAxis axis;
      if (!LayoutConstraintAxisFromName(value, &axis)) {
        *error = EnumError(@"axis", value, NamesForLayoutConstraintAxis());
        return;
      }
      stack.axis = axis;
      return;
    }
    if ([key isEqualToString:@"distribution"]) {
      UIStackViewDistribution d;
      if (!StackDistributionFromName(value, &d)) {
        *error = EnumError(@"distribution", value, NamesForStackDistribution());
        return;
      }
      stack.distribution = d;
      return;
    }
    if ([key isEqualToString:@"alignment"]) {
      UIStackViewAlignment a;
      if (!StackAlignmentFromName(value, &a)) {
        *error = EnumError(@"alignment", value, NamesForStackAlignment());
        return;
      }
      stack.alignment = a;
      return;
    }
    if ([key isEqualToString:@"spacing"]) {
      CGFloat spacing;
      if (!StackSpacingFromValue(value, &spacing, NO)) {
        *error = EnumError(@"spacing", value, NamesForStackSpacing(NO));
        return;
      }
      stack.spacing = spacing;
      return;
    }
    if ([key isEqualToString:@"isBaselineRelativeArrangement"]) {
      stack.baselineRelativeArrangement = [value boolValue];
      return;
    }
    if ([key isEqualToString:@"isLayoutMarginsRelativeArrangement"]) {
      stack.layoutMarginsRelativeArrangement = [value boolValue];
      return;
    }
  }
  if ([object isKindOfClass:UIImageView.class]) {
    UIImageView* iv = (UIImageView*)object;
    if ([key isEqualToString:@"isHighlighted"]) {
      iv.highlighted = [value boolValue];
      return;
    }
  }
  if ([object isKindOfClass:UILabel.class]) {
    UILabel* label = (UILabel*)object;
    if ([key isEqualToString:@"text"]) {
      label.text = [value isKindOfClass:NSString.class] ? value : nil;
      return;
    }
    if ([key isEqualToString:@"textAlignment"]) {
      NSTextAlignment a;
      if (!TextAlignmentFromName(value, &a)) {
        *error = EnumError(@"textAlignment", value, NamesForTextAlignment());
        return;
      }
      label.textAlignment = a;
      return;
    }
    if ([key isEqualToString:@"lineBreakMode"]) {
      NSLineBreakMode m;
      if (!LineBreakModeFromName(value, &m)) {
        *error = EnumError(@"lineBreakMode", value, NamesForLineBreakMode());
        return;
      }
      label.lineBreakMode = m;
      return;
    }
    if ([key isEqualToString:@"baselineAdjustment"]) {
      UIBaselineAdjustment b;
      if (!BaselineAdjustmentFromName(value, &b)) {
        *error = EnumError(@"baselineAdjustment", value, NamesForBaselineAdjustment());
        return;
      }
      label.baselineAdjustment = b;
      return;
    }
    if ([key isEqualToString:@"numberOfLines"]) {
      label.numberOfLines = [value integerValue];
      return;
    }
    if ([key isEqualToString:@"adjustsFontSizeToFitWidth"]) {
      label.adjustsFontSizeToFitWidth = [value boolValue];
      return;
    }
    if ([key isEqualToString:@"minimumScaleFactor"]) {
      label.minimumScaleFactor = [value doubleValue];
      return;
    }
    if ([key isEqualToString:@"isHighlighted"]) {
      label.highlighted = [value boolValue];
      return;
    }
    if ([key isEqualToString:@"isEnabled"]) { label.enabled = [value boolValue]; return; }
    if ([key isEqualToString:@"preferredMaxLayoutWidth"]) {
      label.preferredMaxLayoutWidth = [value doubleValue];
      return;
    }
    if ([key isEqualToString:@"shadowOffset"]) {
      label.shadowOffset = JSONToSize(value);
      return;
    }
  }
  // 注意：走正常的 JS 路径到不了这里。JS 侧的属性是一个个显式定义的
  // 取值器，名字不认识的赋值压根不会过桥，而是在包装对象上挂一个普通
  // 属性（JS 包装对象还是可扩展的，见 project.md 的 TODO）。这句话是
  // 给直接调 __nacre_native.setProp 的情况兜底的。
  *error = [NSString stringWithFormat:@"%@ has no writable property %@",
                                      NSStringFromClass([object class]), key]
               .UTF8String;
}

nacre::NativeObjectRef ReadNativeObjectProperty(id object, const std::string& name) {
  if ([object isKindOfClass:UIScene.class] && name == "session") {
    return {(__bridge void*)((UIScene*)object).session, "UISceneSession"};
  }
  if ([object isKindOfClass:UIWindow.class]) {
    UIWindow* window = (UIWindow*)object;
    if (name == "windowScene") return {(__bridge void*)window.windowScene, "UIWindowScene"};
    if (name == "rootViewController") {
      return {(__bridge void*)window.rootViewController, "UIViewController"};
    }
  }
  if ([object isKindOfClass:UIViewController.class] && name == "view") {
    return {(__bridge void*)((UIViewController*)object).view, "UIView"};
  }
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
  // CGColorRef 不是 ObjC 对象，JS 侧统一用 UIColor。读出来是新建的包装——
  // 动态色在这一步被定死了，见 docs/api/ca-layer.md。
  if ([object isKindOfClass:CALayer.class]) {
    CALayer* layer = (CALayer*)object;
    if (name == "borderColor") {
      if (layer.borderColor == NULL) return {};
      return {(__bridge void*)[UIColor colorWithCGColor:layer.borderColor], "UIColor"};
    }
    if (name == "shadowColor") {
      if (layer.shadowColor == NULL) return {};
      return {(__bridge void*)[UIColor colorWithCGColor:layer.shadowColor], "UIColor"};
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

// 属性值是原生对象数组
std::vector<nacre::NativeObjectRef> ReadNativeObjectArrayProperty(
    id object, const std::string& name) {
  std::vector<nacre::NativeObjectRef> refs;
  if ([object isKindOfClass:UIView.class] && name == "subviews") {
    for (UIView* child in ((UIView*)object).subviews) {
      refs.push_back({(__bridge void*)child, "UIView"});
    }
  }
  // arrangedSubviews 是 subviews 的子集，但顺序由 stack 的排列决定，
  // 不是 subview 的 z 序，所以两个都要能读
  if ([object isKindOfClass:UIStackView.class] && name == "arrangedSubviews") {
    for (UIView* child in ((UIStackView*)object).arrangedSubviews) {
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
  return refs;
}

// 类级只读属性。目前只有 UIColor 的颜色常量，手写成表：
// 用名字拼 selector 再 performSelector 等于把任意 ObjC 调用的入口开给 JS，
// 通用的能力暴露方案做好之前不开这个口子。
NSDictionary<NSString*, UIColor*>* NamedColors() {
  static NSDictionary<NSString*, UIColor*>* colors = nil;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    colors = @{
      // UIColor.h：基础色
      @"blackColor": UIColor.blackColor,
      @"darkGrayColor": UIColor.darkGrayColor,
      @"lightGrayColor": UIColor.lightGrayColor,
      @"whiteColor": UIColor.whiteColor,
      @"grayColor": UIColor.grayColor,
      @"redColor": UIColor.redColor,
      @"greenColor": UIColor.greenColor,
      @"blueColor": UIColor.blueColor,
      @"cyanColor": UIColor.cyanColor,
      @"yellowColor": UIColor.yellowColor,
      @"magentaColor": UIColor.magentaColor,
      @"orangeColor": UIColor.orangeColor,
      @"purpleColor": UIColor.purpleColor,
      @"brownColor": UIColor.brownColor,
      @"clearColor": UIColor.clearColor,
      // UIInterface.h：系统色
      @"systemRedColor": UIColor.systemRedColor,
      @"systemGreenColor": UIColor.systemGreenColor,
      @"systemBlueColor": UIColor.systemBlueColor,
      @"systemOrangeColor": UIColor.systemOrangeColor,
      @"systemYellowColor": UIColor.systemYellowColor,
      @"systemPinkColor": UIColor.systemPinkColor,
      @"systemPurpleColor": UIColor.systemPurpleColor,
      @"systemTealColor": UIColor.systemTealColor,
      @"systemIndigoColor": UIColor.systemIndigoColor,
      @"systemBrownColor": UIColor.systemBrownColor,
      @"systemMintColor": UIColor.systemMintColor,
      @"systemCyanColor": UIColor.systemCyanColor,
      @"systemGrayColor": UIColor.systemGrayColor,
      // UIInterface.h：语义色，按绘制时的外观动态解析
      @"labelColor": UIColor.labelColor,
      @"secondaryLabelColor": UIColor.secondaryLabelColor,
      @"tertiaryLabelColor": UIColor.tertiaryLabelColor,
      @"quaternaryLabelColor": UIColor.quaternaryLabelColor,
      @"placeholderTextColor": UIColor.placeholderTextColor,
      @"separatorColor": UIColor.separatorColor,
      @"opaqueSeparatorColor": UIColor.opaqueSeparatorColor,
      @"linkColor": UIColor.linkColor,
      @"systemBackgroundColor": UIColor.systemBackgroundColor,
      @"secondarySystemBackgroundColor": UIColor.secondarySystemBackgroundColor,
      @"tertiarySystemBackgroundColor": UIColor.tertiarySystemBackgroundColor,
    };
  });
  return colors;
}

// URL 解析，底子是 NSURLComponents。
//
// 为什么用原生而不是自己写 WHATWG 的解析状态机：按能力对齐，NSURL 是 iOS
// 的真实能力，先无损映射它。代价是 NSURL 遵循 RFC 3986，和 WHATWG URL 在
// 边界情况上有差异（某些串一边接受一边拒绝），已知差异写进文档。
//
// 取的全是 percentEncoded* 系列：WHATWG 的 pathname / search 返回的是**编码后**
// 的形式，用解码版会让 '/a%20b' 读出 '/a b'，再拼回去就坏了。

nacre::NativeObjectRef ReadClassObjectProperty(const std::string& className,
                                               const std::string& name) {
  if (className == "UIColor") {
    UIColor* color = NamedColors()[@(name.c_str())];
    if (color != nil) return {(__bridge void*)color, "UIColor"};
  }
  return {};
}

void WriteNativeObjectProperty(id object, const std::string& name, void* valuePtr) {
  id value = (__bridge id)valuePtr;
  if ([object isKindOfClass:UIWindow.class]) {
    UIWindow* window = (UIWindow*)object;
    if (name == "rootViewController") {
      window.rootViewController = [value isKindOfClass:UIViewController.class] ? value : nil;
    } else if (name == "windowScene") {
      window.windowScene = [value isKindOfClass:UIWindowScene.class] ? value : nil;
    }
  }
  if ([object isKindOfClass:CALayer.class]) {
    CALayer* layer = (CALayer*)object;
    UIColor* color = [value isKindOfClass:UIColor.class] ? (UIColor*)value : nil;
    if (name == "borderColor") {
      layer.borderColor = color.CGColor;
    } else if (name == "shadowColor") {
      layer.shadowColor = color.CGColor;
    }
  }
  if ([object isKindOfClass:UIView.class] && name == "backgroundColor") {
    ((UIView*)object).backgroundColor = [value isKindOfClass:UIColor.class] ? value : nil;
  }
  if ([object isKindOfClass:UIImageView.class]) {
    UIImageView* iv = (UIImageView*)object;
    UIImage* image = [value isKindOfClass:UIImage.class] ? (UIImage*)value : nil;
    if (name == "image") {
      iv.image = image;
    } else if (name == "highlightedImage") {
      iv.highlightedImage = image;
    } else if (name == "tintColor") {
      // null_resettable：赋 nil 是合法的，表示退回继承来的那个
      iv.tintColor = [value isKindOfClass:UIColor.class] ? (UIColor*)value : nil;
    }
  }
  if ([object isKindOfClass:UILabel.class]) {
    UILabel* label = (UILabel*)object;
    UIColor* color = [value isKindOfClass:UIColor.class] ? (UIColor*)value : nil;
    if (name == "font") {
      label.font = [value isKindOfClass:UIFont.class] ? (UIFont*)value : nil;
    } else if (name == "textColor") {
      label.textColor = color;
    } else if (name == "shadowColor") {
      label.shadowColor = color;
    } else if (name == "highlightedTextColor") {
      label.highlightedTextColor = color;
    }
  }
}

}  // namespace nacre_bridge
