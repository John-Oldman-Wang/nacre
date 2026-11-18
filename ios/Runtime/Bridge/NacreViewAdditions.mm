// 初稿是 bindgen 生成的（docs/internals/bindgen.md）。之后它是普通的手写文件：直接改，bindgen 不会再碰它。
//
// 一个域：UIView、UIScrollView、UITextField、UITextView。写法和手写的域一样，
// 见 docs/internals/adding-classes.md；哪些成员生成、哪些不生成见 docs/internals/bindgen.md。

#import "NacreBridge.h"

namespace nacre_bridge {

NACRE_ENUM_MAP(ViewAdditionsUISemanticContentAttribute, UISemanticContentAttribute,
               @"unspecified": @(UISemanticContentAttributeUnspecified),
               @"playback": @(UISemanticContentAttributePlayback),
               @"spatial": @(UISemanticContentAttributeSpatial),
               @"forceLeftToRight": @(UISemanticContentAttributeForceLeftToRight),
               @"forceRightToLeft": @(UISemanticContentAttributeForceRightToLeft))

NACRE_ENUM_MAP(ViewAdditionsUIUserInterfaceLayoutDirection, UIUserInterfaceLayoutDirection,
               @"leftToRight": @(UIUserInterfaceLayoutDirectionLeftToRight),
               @"rightToLeft": @(UIUserInterfaceLayoutDirectionRightToLeft))

NACRE_ENUM_MAP(ViewAdditionsUIViewTintAdjustmentMode, UIViewTintAdjustmentMode,
               @"automatic": @(UIViewTintAdjustmentModeAutomatic),
               @"normal": @(UIViewTintAdjustmentModeNormal),
               @"dimmed": @(UIViewTintAdjustmentModeDimmed))

NACRE_ENUM_MAP(ViewAdditionsUIScrollViewIndexDisplayMode, UIScrollViewIndexDisplayMode,
               @"automatic": @(UIScrollViewIndexDisplayModeAutomatic),
               @"alwaysHidden": @(UIScrollViewIndexDisplayModeAlwaysHidden))

NACRE_ENUM_MAP(ViewAdditionsUITextFieldViewMode, UITextFieldViewMode,
               @"never": @(UITextFieldViewModeNever),
               @"whileEditing": @(UITextFieldViewModeWhileEditing),
               @"unlessEditing": @(UITextFieldViewModeUnlessEditing),
               @"always": @(UITextFieldViewModeAlways))

NACRE_ENUM_MAP(ViewAdditionsUITextSmartQuotesType, UITextSmartQuotesType,
               @"default": @(UITextSmartQuotesTypeDefault),
               @"no": @(UITextSmartQuotesTypeNo),
               @"yes": @(UITextSmartQuotesTypeYes))

NACRE_ENUM_MAP(ViewAdditionsUITextSmartDashesType, UITextSmartDashesType,
               @"default": @(UITextSmartDashesTypeDefault),
               @"no": @(UITextSmartDashesTypeNo),
               @"yes": @(UITextSmartDashesTypeYes))

NACRE_ENUM_MAP(ViewAdditionsUITextSmartInsertDeleteType, UITextSmartInsertDeleteType,
               @"default": @(UITextSmartInsertDeleteTypeDefault),
               @"no": @(UITextSmartInsertDeleteTypeNo),
               @"yes": @(UITextSmartInsertDeleteTypeYes))

NACRE_ENUM_MAP(ViewAdditionsUITextInlinePredictionType, UITextInlinePredictionType,
               @"default": @(UITextInlinePredictionTypeDefault),
               @"no": @(UITextInlinePredictionTypeNo),
               @"yes": @(UITextInlinePredictionTypeYes))

NACRE_ENUM_MAP(ViewAdditionsUITextMathExpressionCompletionType, UITextMathExpressionCompletionType,
               @"default": @(UITextMathExpressionCompletionTypeDefault),
               @"no": @(UITextMathExpressionCompletionTypeNo),
               @"yes": @(UITextMathExpressionCompletionTypeYes))

NACRE_ENUM_MAP(ViewAdditionsUIWritingToolsBehavior, UIWritingToolsBehavior,
               @"none": @(UIWritingToolsBehaviorNone),
               @"default": @(UIWritingToolsBehaviorDefault),
               @"complete": @(UIWritingToolsBehaviorComplete),
               @"limited": @(UIWritingToolsBehaviorLimited))

NACRE_MASK_MAP(ViewAdditionsUIViewAutoresizing, UIViewAutoresizing,
               @"flexibleLeftMargin": @(UIViewAutoresizingFlexibleLeftMargin),
               @"flexibleWidth": @(UIViewAutoresizingFlexibleWidth),
               @"flexibleRightMargin": @(UIViewAutoresizingFlexibleRightMargin),
               @"flexibleTopMargin": @(UIViewAutoresizingFlexibleTopMargin),
               @"flexibleHeight": @(UIViewAutoresizingFlexibleHeight),
               @"flexibleBottomMargin": @(UIViewAutoresizingFlexibleBottomMargin))

NACRE_MASK_MAP(ViewAdditionsUIRectCorner, UIRectCorner,
               @"topLeft": @(UIRectCornerTopLeft),
               @"topRight": @(UIRectCornerTopRight),
               @"bottomLeft": @(UIRectCornerBottomLeft),
               @"bottomRight": @(UIRectCornerBottomRight))

NACRE_MASK_MAP(ViewAdditionsUIWritingToolsResultOptions, UIWritingToolsResultOptions,
               @"plainText": @(UIWritingToolsResultPlainText),
               @"richText": @(UIWritingToolsResultRichText),
               @"list": @(UIWritingToolsResultList),
               @"table": @(UIWritingToolsResultTable),
               @"presentationIntent": @(UIWritingToolsResultPresentationIntent))

NACRE_MASK_MAP(ViewAdditionsUIDataDetectorTypes, UIDataDetectorTypes,
               @"phoneNumber": @(UIDataDetectorTypePhoneNumber),
               @"link": @(UIDataDetectorTypeLink),
               @"address": @(UIDataDetectorTypeAddress),
               @"calendarEvent": @(UIDataDetectorTypeCalendarEvent),
               @"shipmentTrackingNumber": @(UIDataDetectorTypeShipmentTrackingNumber),
               @"flightNumber": @(UIDataDetectorTypeFlightNumber),
               @"lookupSuggestion": @(UIDataDetectorTypeLookupSuggestion),
               @"money": @(UIDataDetectorTypeMoney),
               @"physicalValue": @(UIDataDetectorTypePhysicalValue))

static std::string ViewAdditionsNotArray(NSString* what, NSString* names) {
  return [NSString stringWithFormat:@"%@ needs an array of names; expected any of: %@", what, names].UTF8String;
}

static bool ViewAdditionsText(id value, NSString* what, bool nullable, NSString** out,
                    std::string* error) {
  if ([value isKindOfClass:NSString.class]) { *out = value; return true; }
  if (nullable && (value == nil || value == NSNull.null)) { *out = nil; return true; }
  *error = [NSString stringWithFormat:@"%@ must be a string%@", what,
                                      nullable ? @" or null" : @""].UTF8String;
  return false;
}

static bool ViewAdditionsObject(id value, Class cls, const char* className, bool nullable,
                    const std::string& name, std::string* error) {
  if ([value isKindOfClass:cls] || (nullable && value == nil)) return true;
  ObjectTypeError(name, className, nullable, error);
  return false;
}

static id ReadViewAdditionsProperty(id object, NSString* key) {
  if ([object isKindOfClass:UIView.class]) {
    UIView* o = (UIView*)object;
    if ([key isEqualToString:@"canBecomeFocused"]) return @(o.canBecomeFocused);
    if ([key isEqualToString:@"isFocused"]) return @(o.isFocused);
    if ([key isEqualToString:@"focusGroupIdentifier"]) return o.focusGroupIdentifier ?: NSNull.null;
    if ([key isEqualToString:@"semanticContentAttribute"]) return NameForViewAdditionsUISemanticContentAttribute(o.semanticContentAttribute) ?: NSNull.null;
    if ([key isEqualToString:@"effectiveUserInterfaceLayoutDirection"]) return NameForViewAdditionsUIUserInterfaceLayoutDirection(o.effectiveUserInterfaceLayoutDirection) ?: NSNull.null;
    if ([key isEqualToString:@"contentScaleFactor"]) return @(o.contentScaleFactor);
    if ([key isEqualToString:@"anchorPoint"]) return PointToJSON(o.anchorPoint);
    if ([key isEqualToString:@"isMultipleTouchEnabled"]) return @(o.isMultipleTouchEnabled);
    if ([key isEqualToString:@"isExclusiveTouch"]) return @(o.isExclusiveTouch);
    if ([key isEqualToString:@"autoresizesSubviews"]) return @(o.autoresizesSubviews);
    if ([key isEqualToString:@"autoresizingMask"]) return NamesInViewAdditionsUIViewAutoresizing(o.autoresizingMask);
    if ([key isEqualToString:@"clearsContextBeforeDrawing"]) return @(o.clearsContextBeforeDrawing);
    if ([key isEqualToString:@"tintAdjustmentMode"]) return NameForViewAdditionsUIViewTintAdjustmentMode(o.tintAdjustmentMode) ?: NSNull.null;
    if ([key isEqualToString:@"alignmentRectInsets"]) return InsetsToJSON(o.alignmentRectInsets);
    if ([key isEqualToString:@"restorationIdentifier"]) return o.restorationIdentifier ?: NSNull.null;
    if ([key isEqualToString:@"appliedContentSizeCategoryLimitsDescription"]) return o.appliedContentSizeCategoryLimitsDescription ?: NSNull.null;
    if ([key isEqualToString:@"accessibilityIgnoresInvertColors"]) return @(o.accessibilityIgnoresInvertColors);
    if ([key isEqualToString:@"showsLargeContentViewer"]) return @(o.showsLargeContentViewer);
    if ([key isEqualToString:@"largeContentTitle"]) return o.largeContentTitle ?: NSNull.null;
    if ([key isEqualToString:@"scalesLargeContentImage"]) return @(o.scalesLargeContentImage);
    if ([key isEqualToString:@"largeContentImageInsets"]) return InsetsToJSON(o.largeContentImageInsets);
  }
  if ([object isKindOfClass:UIScrollView.class]) {
    UIScrollView* o = (UIScrollView*)object;
    if ([key isEqualToString:@"contentAlignmentPoint"]) return PointToJSON(o.contentAlignmentPoint);
    if ([key isEqualToString:@"bouncesHorizontally"]) return @(o.bouncesHorizontally);
    if ([key isEqualToString:@"bouncesVertically"]) return @(o.bouncesVertically);
    if ([key isEqualToString:@"transfersHorizontalScrollingToParent"]) return @(o.transfersHorizontalScrollingToParent);
    if ([key isEqualToString:@"transfersVerticalScrollingToParent"]) return @(o.transfersVerticalScrollingToParent);
    if ([key isEqualToString:@"scrollIndicatorInsets"]) return InsetsToJSON(o.scrollIndicatorInsets);
    if ([key isEqualToString:@"indexDisplayMode"]) return NameForViewAdditionsUIScrollViewIndexDisplayMode(o.indexDisplayMode) ?: NSNull.null;
    if ([key isEqualToString:@"minimumZoomScale"]) return @(o.minimumZoomScale);
    if ([key isEqualToString:@"maximumZoomScale"]) return @(o.maximumZoomScale);
    if ([key isEqualToString:@"zoomScale"]) return @(o.zoomScale);
    if ([key isEqualToString:@"bouncesZoom"]) return @(o.bouncesZoom);
    if ([key isEqualToString:@"isZooming"]) return @(o.isZooming);
    if ([key isEqualToString:@"isZoomBouncing"]) return @(o.isZoomBouncing);
    if ([key isEqualToString:@"isZoomAnimating"]) return @(o.isZoomAnimating);
    if ([key isEqualToString:@"allowsKeyboardScrolling"]) return @(o.allowsKeyboardScrolling);
  }
  if ([object isKindOfClass:UITextField.class]) {
    UITextField* o = (UITextField*)object;
    if ([key isEqualToString:@"allowsEditingTextAttributes"]) return @(o.allowsEditingTextAttributes);
    if ([key isEqualToString:@"leftViewMode"]) return NameForViewAdditionsUITextFieldViewMode(o.leftViewMode) ?: NSNull.null;
    if ([key isEqualToString:@"rightViewMode"]) return NameForViewAdditionsUITextFieldViewMode(o.rightViewMode) ?: NSNull.null;
    if ([key isEqualToString:@"clearsOnInsertion"]) return @(o.clearsOnInsertion);
    if ([key isEqualToString:@"smartQuotesType"]) return NameForViewAdditionsUITextSmartQuotesType(o.smartQuotesType) ?: NSNull.null;
    if ([key isEqualToString:@"smartDashesType"]) return NameForViewAdditionsUITextSmartDashesType(o.smartDashesType) ?: NSNull.null;
    if ([key isEqualToString:@"smartInsertDeleteType"]) return NameForViewAdditionsUITextSmartInsertDeleteType(o.smartInsertDeleteType) ?: NSNull.null;
    if ([key isEqualToString:@"inlinePredictionType"]) return NameForViewAdditionsUITextInlinePredictionType(o.inlinePredictionType) ?: NSNull.null;
    if ([key isEqualToString:@"mathExpressionCompletionType"]) return NameForViewAdditionsUITextMathExpressionCompletionType(o.mathExpressionCompletionType) ?: NSNull.null;
    if ([key isEqualToString:@"writingToolsBehavior"]) return NameForViewAdditionsUIWritingToolsBehavior(o.writingToolsBehavior) ?: NSNull.null;
    if ([key isEqualToString:@"allowedWritingToolsResultOptions"]) return NamesInViewAdditionsUIWritingToolsResultOptions(o.allowedWritingToolsResultOptions);
    if ([key isEqualToString:@"allowsNumberPadPopover"]) return @(o.allowsNumberPadPopover);
  }
  if ([object isKindOfClass:UITextView.class]) {
    UITextView* o = (UITextView*)object;
    if ([key isEqualToString:@"dataDetectorTypes"]) return NamesInViewAdditionsUIDataDetectorTypes(o.dataDetectorTypes);
    if ([key isEqualToString:@"allowsEditingTextAttributes"]) return @(o.allowsEditingTextAttributes);
    if ([key isEqualToString:@"clearsOnInsertion"]) return @(o.clearsOnInsertion);
    if ([key isEqualToString:@"usesStandardTextScaling"]) return @(o.usesStandardTextScaling);
    if ([key isEqualToString:@"isFindInteractionEnabled"]) return @(o.isFindInteractionEnabled);
    if ([key isEqualToString:@"isWritingToolsActive"]) return @(o.isWritingToolsActive);
    if ([key isEqualToString:@"writingToolsBehavior"]) return NameForViewAdditionsUIWritingToolsBehavior(o.writingToolsBehavior) ?: NSNull.null;
    if ([key isEqualToString:@"allowedWritingToolsResultOptions"]) return NamesInViewAdditionsUIWritingToolsResultOptions(o.allowedWritingToolsResultOptions);
    if ([key isEqualToString:@"smartQuotesType"]) return NameForViewAdditionsUITextSmartQuotesType(o.smartQuotesType) ?: NSNull.null;
    if ([key isEqualToString:@"smartDashesType"]) return NameForViewAdditionsUITextSmartDashesType(o.smartDashesType) ?: NSNull.null;
    if ([key isEqualToString:@"smartInsertDeleteType"]) return NameForViewAdditionsUITextSmartInsertDeleteType(o.smartInsertDeleteType) ?: NSNull.null;
    if ([key isEqualToString:@"inlinePredictionType"]) return NameForViewAdditionsUITextInlinePredictionType(o.inlinePredictionType) ?: NSNull.null;
    if ([key isEqualToString:@"mathExpressionCompletionType"]) return NameForViewAdditionsUITextMathExpressionCompletionType(o.mathExpressionCompletionType) ?: NSNull.null;
    if ([key isEqualToString:@"allowsNumberPadPopover"]) return @(o.allowsNumberPadPopover);
  }
  return nil;
}

static BOOL WriteViewAdditionsProperty(id object, NSString* key, id value, std::string* error) {
  if ([object isKindOfClass:UIView.class]) {
    UIView* o = (UIView*)object;
    if ([key isEqualToString:@"focusGroupIdentifier"]) {
      NSString* text = nil;
      if (ViewAdditionsText(value, key, true, &text, error)) o.focusGroupIdentifier = text;
      return YES;
    }
    if ([key isEqualToString:@"semanticContentAttribute"]) {
      UISemanticContentAttribute v;
      if (!ViewAdditionsUISemanticContentAttributeFromName(value, &v)) {
        *error = EnumError(key, value, NamesForViewAdditionsUISemanticContentAttribute());
        return YES;
      }
      o.semanticContentAttribute = v;
      return YES;
    }
    if ([key isEqualToString:@"contentScaleFactor"]) { o.contentScaleFactor = NACRE_NUM(value, key); return YES; }
    if ([key isEqualToString:@"anchorPoint"]) { o.anchorPoint = JSONToPoint(value); return YES; }
    if ([key isEqualToString:@"isMultipleTouchEnabled"]) { o.multipleTouchEnabled = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"isExclusiveTouch"]) { o.exclusiveTouch = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"autoresizesSubviews"]) { o.autoresizesSubviews = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"autoresizingMask"]) {
      UIViewAutoresizing v;
      id bad = nil;
      if (!ViewAdditionsUIViewAutoresizingFromNames(value, &v, &bad)) {
        *error = bad != nil ? EnumError(key, bad, NamesForViewAdditionsUIViewAutoresizing())
                            : ViewAdditionsNotArray(key, NamesForViewAdditionsUIViewAutoresizing());
        return YES;
      }
      o.autoresizingMask = v;
      return YES;
    }
    if ([key isEqualToString:@"clearsContextBeforeDrawing"]) { o.clearsContextBeforeDrawing = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"tintAdjustmentMode"]) {
      UIViewTintAdjustmentMode v;
      if (!ViewAdditionsUIViewTintAdjustmentModeFromName(value, &v)) {
        *error = EnumError(key, value, NamesForViewAdditionsUIViewTintAdjustmentMode());
        return YES;
      }
      o.tintAdjustmentMode = v;
      return YES;
    }
    if ([key isEqualToString:@"restorationIdentifier"]) {
      NSString* text = nil;
      if (ViewAdditionsText(value, key, true, &text, error)) o.restorationIdentifier = text;
      return YES;
    }
    if ([key isEqualToString:@"accessibilityIgnoresInvertColors"]) { o.accessibilityIgnoresInvertColors = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"showsLargeContentViewer"]) { o.showsLargeContentViewer = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"largeContentTitle"]) {
      NSString* text = nil;
      if (ViewAdditionsText(value, key, true, &text, error)) o.largeContentTitle = text;
      return YES;
    }
    if ([key isEqualToString:@"scalesLargeContentImage"]) { o.scalesLargeContentImage = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"largeContentImageInsets"]) { o.largeContentImageInsets = JSONToInsets(value); return YES; }
  }
  if ([object isKindOfClass:UIScrollView.class]) {
    UIScrollView* o = (UIScrollView*)object;
    if ([key isEqualToString:@"contentAlignmentPoint"]) { o.contentAlignmentPoint = JSONToPoint(value); return YES; }
    if ([key isEqualToString:@"bouncesHorizontally"]) { o.bouncesHorizontally = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"bouncesVertically"]) { o.bouncesVertically = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"transfersHorizontalScrollingToParent"]) { o.transfersHorizontalScrollingToParent = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"transfersVerticalScrollingToParent"]) { o.transfersVerticalScrollingToParent = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"scrollIndicatorInsets"]) { o.scrollIndicatorInsets = JSONToInsets(value); return YES; }
    if ([key isEqualToString:@"indexDisplayMode"]) {
      UIScrollViewIndexDisplayMode v;
      if (!ViewAdditionsUIScrollViewIndexDisplayModeFromName(value, &v)) {
        *error = EnumError(key, value, NamesForViewAdditionsUIScrollViewIndexDisplayMode());
        return YES;
      }
      o.indexDisplayMode = v;
      return YES;
    }
    if ([key isEqualToString:@"minimumZoomScale"]) { o.minimumZoomScale = NACRE_NUM(value, key); return YES; }
    if ([key isEqualToString:@"maximumZoomScale"]) { o.maximumZoomScale = NACRE_NUM(value, key); return YES; }
    if ([key isEqualToString:@"zoomScale"]) { o.zoomScale = NACRE_NUM(value, key); return YES; }
    if ([key isEqualToString:@"bouncesZoom"]) { o.bouncesZoom = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"allowsKeyboardScrolling"]) { o.allowsKeyboardScrolling = NACRE_BOOL(value, key); return YES; }
  }
  if ([object isKindOfClass:UITextField.class]) {
    UITextField* o = (UITextField*)object;
    if ([key isEqualToString:@"allowsEditingTextAttributes"]) { o.allowsEditingTextAttributes = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"leftViewMode"]) {
      UITextFieldViewMode v;
      if (!ViewAdditionsUITextFieldViewModeFromName(value, &v)) {
        *error = EnumError(key, value, NamesForViewAdditionsUITextFieldViewMode());
        return YES;
      }
      o.leftViewMode = v;
      return YES;
    }
    if ([key isEqualToString:@"rightViewMode"]) {
      UITextFieldViewMode v;
      if (!ViewAdditionsUITextFieldViewModeFromName(value, &v)) {
        *error = EnumError(key, value, NamesForViewAdditionsUITextFieldViewMode());
        return YES;
      }
      o.rightViewMode = v;
      return YES;
    }
    if ([key isEqualToString:@"clearsOnInsertion"]) { o.clearsOnInsertion = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"smartQuotesType"]) {
      UITextSmartQuotesType v;
      if (!ViewAdditionsUITextSmartQuotesTypeFromName(value, &v)) {
        *error = EnumError(key, value, NamesForViewAdditionsUITextSmartQuotesType());
        return YES;
      }
      o.smartQuotesType = v;
      return YES;
    }
    if ([key isEqualToString:@"smartDashesType"]) {
      UITextSmartDashesType v;
      if (!ViewAdditionsUITextSmartDashesTypeFromName(value, &v)) {
        *error = EnumError(key, value, NamesForViewAdditionsUITextSmartDashesType());
        return YES;
      }
      o.smartDashesType = v;
      return YES;
    }
    if ([key isEqualToString:@"smartInsertDeleteType"]) {
      UITextSmartInsertDeleteType v;
      if (!ViewAdditionsUITextSmartInsertDeleteTypeFromName(value, &v)) {
        *error = EnumError(key, value, NamesForViewAdditionsUITextSmartInsertDeleteType());
        return YES;
      }
      o.smartInsertDeleteType = v;
      return YES;
    }
    if ([key isEqualToString:@"inlinePredictionType"]) {
      UITextInlinePredictionType v;
      if (!ViewAdditionsUITextInlinePredictionTypeFromName(value, &v)) {
        *error = EnumError(key, value, NamesForViewAdditionsUITextInlinePredictionType());
        return YES;
      }
      o.inlinePredictionType = v;
      return YES;
    }
    if ([key isEqualToString:@"mathExpressionCompletionType"]) {
      UITextMathExpressionCompletionType v;
      if (!ViewAdditionsUITextMathExpressionCompletionTypeFromName(value, &v)) {
        *error = EnumError(key, value, NamesForViewAdditionsUITextMathExpressionCompletionType());
        return YES;
      }
      o.mathExpressionCompletionType = v;
      return YES;
    }
    if ([key isEqualToString:@"writingToolsBehavior"]) {
      UIWritingToolsBehavior v;
      if (!ViewAdditionsUIWritingToolsBehaviorFromName(value, &v)) {
        *error = EnumError(key, value, NamesForViewAdditionsUIWritingToolsBehavior());
        return YES;
      }
      o.writingToolsBehavior = v;
      return YES;
    }
    if ([key isEqualToString:@"allowedWritingToolsResultOptions"]) {
      UIWritingToolsResultOptions v;
      id bad = nil;
      if (!ViewAdditionsUIWritingToolsResultOptionsFromNames(value, &v, &bad)) {
        *error = bad != nil ? EnumError(key, bad, NamesForViewAdditionsUIWritingToolsResultOptions())
                            : ViewAdditionsNotArray(key, NamesForViewAdditionsUIWritingToolsResultOptions());
        return YES;
      }
      o.allowedWritingToolsResultOptions = v;
      return YES;
    }
    if ([key isEqualToString:@"allowsNumberPadPopover"]) { o.allowsNumberPadPopover = NACRE_BOOL(value, key); return YES; }
  }
  if ([object isKindOfClass:UITextView.class]) {
    UITextView* o = (UITextView*)object;
    if ([key isEqualToString:@"dataDetectorTypes"]) {
      UIDataDetectorTypes v;
      id bad = nil;
      if (!ViewAdditionsUIDataDetectorTypesFromNames(value, &v, &bad)) {
        *error = bad != nil ? EnumError(key, bad, NamesForViewAdditionsUIDataDetectorTypes())
                            : ViewAdditionsNotArray(key, NamesForViewAdditionsUIDataDetectorTypes());
        return YES;
      }
      o.dataDetectorTypes = v;
      return YES;
    }
    if ([key isEqualToString:@"allowsEditingTextAttributes"]) { o.allowsEditingTextAttributes = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"clearsOnInsertion"]) { o.clearsOnInsertion = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"usesStandardTextScaling"]) { o.usesStandardTextScaling = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"isFindInteractionEnabled"]) { o.findInteractionEnabled = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"writingToolsBehavior"]) {
      UIWritingToolsBehavior v;
      if (!ViewAdditionsUIWritingToolsBehaviorFromName(value, &v)) {
        *error = EnumError(key, value, NamesForViewAdditionsUIWritingToolsBehavior());
        return YES;
      }
      o.writingToolsBehavior = v;
      return YES;
    }
    if ([key isEqualToString:@"allowedWritingToolsResultOptions"]) {
      UIWritingToolsResultOptions v;
      id bad = nil;
      if (!ViewAdditionsUIWritingToolsResultOptionsFromNames(value, &v, &bad)) {
        *error = bad != nil ? EnumError(key, bad, NamesForViewAdditionsUIWritingToolsResultOptions())
                            : ViewAdditionsNotArray(key, NamesForViewAdditionsUIWritingToolsResultOptions());
        return YES;
      }
      o.allowedWritingToolsResultOptions = v;
      return YES;
    }
    if ([key isEqualToString:@"smartQuotesType"]) {
      UITextSmartQuotesType v;
      if (!ViewAdditionsUITextSmartQuotesTypeFromName(value, &v)) {
        *error = EnumError(key, value, NamesForViewAdditionsUITextSmartQuotesType());
        return YES;
      }
      o.smartQuotesType = v;
      return YES;
    }
    if ([key isEqualToString:@"smartDashesType"]) {
      UITextSmartDashesType v;
      if (!ViewAdditionsUITextSmartDashesTypeFromName(value, &v)) {
        *error = EnumError(key, value, NamesForViewAdditionsUITextSmartDashesType());
        return YES;
      }
      o.smartDashesType = v;
      return YES;
    }
    if ([key isEqualToString:@"smartInsertDeleteType"]) {
      UITextSmartInsertDeleteType v;
      if (!ViewAdditionsUITextSmartInsertDeleteTypeFromName(value, &v)) {
        *error = EnumError(key, value, NamesForViewAdditionsUITextSmartInsertDeleteType());
        return YES;
      }
      o.smartInsertDeleteType = v;
      return YES;
    }
    if ([key isEqualToString:@"inlinePredictionType"]) {
      UITextInlinePredictionType v;
      if (!ViewAdditionsUITextInlinePredictionTypeFromName(value, &v)) {
        *error = EnumError(key, value, NamesForViewAdditionsUITextInlinePredictionType());
        return YES;
      }
      o.inlinePredictionType = v;
      return YES;
    }
    if ([key isEqualToString:@"mathExpressionCompletionType"]) {
      UITextMathExpressionCompletionType v;
      if (!ViewAdditionsUITextMathExpressionCompletionTypeFromName(value, &v)) {
        *error = EnumError(key, value, NamesForViewAdditionsUITextMathExpressionCompletionType());
        return YES;
      }
      o.mathExpressionCompletionType = v;
      return YES;
    }
    if ([key isEqualToString:@"allowsNumberPadPopover"]) { o.allowsNumberPadPopover = NACRE_BOOL(value, key); return YES; }
  }
  return NO;
}

static nacre::NativeObjectRef ReadViewAdditionsObjectProperty(id object, const std::string& name) {
  if ([object isKindOfClass:UIView.class]) {
    UIView* o = (UIView*)object;
    if (name == "maskView") return {NacreKeep(o.maskView), "UIView"};
    if (name == "tintColor") return {NacreKeep(o.tintColor), "UIColor"};
    if (name == "viewForFirstBaselineLayout") return {NacreKeep(o.viewForFirstBaselineLayout), "UIView"};
    if (name == "viewForLastBaselineLayout") return {NacreKeep(o.viewForLastBaselineLayout), "UIView"};
    if (name == "largeContentImage") return {NacreKeep(o.largeContentImage), "UIImage"};
  }
  if ([object isKindOfClass:UIScrollView.class]) {
    UIScrollView* o = (UIScrollView*)object;
    if (name == "panGestureRecognizer") return {NacreKeep(o.panGestureRecognizer), "UIPanGestureRecognizer"};
    if (name == "pinchGestureRecognizer") return {NacreKeep(o.pinchGestureRecognizer), "UIPinchGestureRecognizer"};
    if (name == "directionalPressGestureRecognizer") return {NacreKeep(o.directionalPressGestureRecognizer), "UIGestureRecognizer"};
  }
  if ([object isKindOfClass:UITextField.class]) {
    UITextField* o = (UITextField*)object;
    if (name == "background") return {NacreKeep(o.background), "UIImage"};
    if (name == "disabledBackground") return {NacreKeep(o.disabledBackground), "UIImage"};
    if (name == "leftView") return {NacreKeep(o.leftView), "UIView"};
    if (name == "rightView") return {NacreKeep(o.rightView), "UIView"};
    if (name == "inputView") return {NacreKeep(o.inputView), "UIView"};
  }
  if ([object isKindOfClass:UITextView.class]) {
    UITextView* o = (UITextView*)object;
    if (name == "inputView") return {NacreKeep(o.inputView), "UIView"};
  }
  return {};
}

static bool WriteViewAdditionsObjectProperty(id object, const std::string& name, id value,
                                        std::string* error) {
  if ([object isKindOfClass:UIView.class]) {
    UIView* o = (UIView*)object;
    if (name == "maskView") {
      if (ViewAdditionsObject(value, UIView.class, "UIView", true, name, error)) o.maskView = value;
      return true;
    }
    if (name == "tintColor") {
      if (ViewAdditionsObject(value, UIColor.class, "UIColor", true, name, error)) o.tintColor = value;
      return true;
    }
    if (name == "largeContentImage") {
      if (ViewAdditionsObject(value, UIImage.class, "UIImage", true, name, error)) o.largeContentImage = value;
      return true;
    }
  }
  if ([object isKindOfClass:UITextField.class]) {
    UITextField* o = (UITextField*)object;
    if (name == "background") {
      if (ViewAdditionsObject(value, UIImage.class, "UIImage", true, name, error)) o.background = value;
      return true;
    }
    if (name == "disabledBackground") {
      if (ViewAdditionsObject(value, UIImage.class, "UIImage", true, name, error)) o.disabledBackground = value;
      return true;
    }
    if (name == "leftView") {
      if (ViewAdditionsObject(value, UIView.class, "UIView", true, name, error)) o.leftView = value;
      return true;
    }
    if (name == "rightView") {
      if (ViewAdditionsObject(value, UIView.class, "UIView", true, name, error)) o.rightView = value;
      return true;
    }
    if (name == "inputView") {
      if (ViewAdditionsObject(value, UIView.class, "UIView", true, name, error)) o.inputView = value;
      return true;
    }
  }
  if ([object isKindOfClass:UITextView.class]) {
    UITextView* o = (UITextView*)object;
    if (name == "inputView") {
      if (ViewAdditionsObject(value, UIView.class, "UIView", true, name, error)) o.inputView = value;
      return true;
    }
  }
  return false;
}

static bool CallViewAdditionsMethod(id object, NSString* sel, const NacreArgs& args,
                             std::string* out, std::string* error) {
  if ([object isKindOfClass:UIView.class]) {
    UIView* o = (UIView*)object;
    if ([sel isEqualToString:@"exchangeSubviewAtIndex:withSubviewAtIndex:"]) {
      NSInteger a0 = (NSInteger)NACRE_INT(args.value(0), @"exchangeSubviewAtIndex");
      NSInteger a1 = (NSInteger)NACRE_INT(args.value(1), @"withSubviewAtIndex");
      [o exchangeSubviewAtIndex:a0 withSubviewAtIndex:a1];
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"setNeedsUpdateProperties"]) {
      [o setNeedsUpdateProperties];
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"updatePropertiesIfNeeded"]) {
      [o updatePropertiesIfNeeded];
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"setNeedsDisplayInRect:"]) {
      CGRect a0 = JSONToRect(args.value(0));
      [o setNeedsDisplayInRect:a0];
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"updateConstraintsIfNeeded"]) {
      [o updateConstraintsIfNeeded];
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"needsUpdateConstraints"]) {
      *out = EncodeJSON(@([o needsUpdateConstraints]));
      return true;
    }
    if ([sel isEqualToString:@"setNeedsUpdateConstraints"]) {
      [o setNeedsUpdateConstraints];
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"alignmentRectForFrame:"]) {
      CGRect a0 = JSONToRect(args.value(0));
      *out = EncodeJSON(RectToJSON([o alignmentRectForFrame:a0]));
      return true;
    }
    if ([sel isEqualToString:@"frameForAlignmentRect:"]) {
      CGRect a0 = JSONToRect(args.value(0));
      *out = EncodeJSON(RectToJSON([o frameForAlignmentRect:a0]));
      return true;
    }
    if ([sel isEqualToString:@"updateTraitsIfNeeded"]) {
      [o updateTraitsIfNeeded];
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"effectiveRadiusForCorner:"]) {
      UIRectCorner a0;
      id bad0 = nil;
      if (!ViewAdditionsUIRectCornerFromNames(args.value(0), &a0, &bad0)) {
        *error = bad0 != nil ? EnumError(@"effectiveRadiusForCorner", bad0, NamesForViewAdditionsUIRectCorner())
                             : ViewAdditionsNotArray(@"effectiveRadiusForCorner", NamesForViewAdditionsUIRectCorner());
        return true;
      }
      *out = EncodeJSON(@([o effectiveRadiusForCorner:a0]));
      return true;
    }
  }
  if ([object isKindOfClass:UIScrollView.class]) {
    UIScrollView* o = (UIScrollView*)object;
    if ([sel isEqualToString:@"setZoomScale:animated:"]) {
      CGFloat a0 = NACRE_NUM(args.value(0), @"setZoomScale");
      BOOL a1 = NACRE_BOOL(args.value(1), @"animated");
      [o setZoomScale:a0 animated:a1];
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"zoomToRect:animated:"]) {
      CGRect a0 = JSONToRect(args.value(0));
      BOOL a1 = NACRE_BOOL(args.value(1), @"animated");
      [o zoomToRect:a0 animated:a1];
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"stopScrollingAndZooming"]) {
      [o stopScrollingAndZooming];
      *out = "null";
      return true;
    }
  }
  if ([object isKindOfClass:UITextField.class]) {
    UITextField* o = (UITextField*)object;
    if ([sel isEqualToString:@"borderRectForBounds:"]) {
      CGRect a0 = JSONToRect(args.value(0));
      *out = EncodeJSON(RectToJSON([o borderRectForBounds:a0]));
      return true;
    }
    if ([sel isEqualToString:@"textRectForBounds:"]) {
      CGRect a0 = JSONToRect(args.value(0));
      *out = EncodeJSON(RectToJSON([o textRectForBounds:a0]));
      return true;
    }
    if ([sel isEqualToString:@"placeholderRectForBounds:"]) {
      CGRect a0 = JSONToRect(args.value(0));
      *out = EncodeJSON(RectToJSON([o placeholderRectForBounds:a0]));
      return true;
    }
    if ([sel isEqualToString:@"editingRectForBounds:"]) {
      CGRect a0 = JSONToRect(args.value(0));
      *out = EncodeJSON(RectToJSON([o editingRectForBounds:a0]));
      return true;
    }
    if ([sel isEqualToString:@"clearButtonRectForBounds:"]) {
      CGRect a0 = JSONToRect(args.value(0));
      *out = EncodeJSON(RectToJSON([o clearButtonRectForBounds:a0]));
      return true;
    }
    if ([sel isEqualToString:@"leftViewRectForBounds:"]) {
      CGRect a0 = JSONToRect(args.value(0));
      *out = EncodeJSON(RectToJSON([o leftViewRectForBounds:a0]));
      return true;
    }
    if ([sel isEqualToString:@"rightViewRectForBounds:"]) {
      CGRect a0 = JSONToRect(args.value(0));
      *out = EncodeJSON(RectToJSON([o rightViewRectForBounds:a0]));
      return true;
    }
  }
  return false;
}

static bool CallViewAdditionsObjectMethod(id object, NSString* sel, const NacreArgs& args,
                                   nacre::NativeObjectRef* out, std::string* error) {
  if ([object isKindOfClass:UIView.class]) {
    UIView* o = (UIView*)object;
    if ([sel isEqualToString:@"snapshotViewAfterScreenUpdates:"]) {
      BOOL a0 = NACRE_BOOL(args.value(0), @"snapshotViewAfterScreenUpdates");
      *out = {NacreKeep([o snapshotViewAfterScreenUpdates:a0]), "UIView"};
      return true;
    }
    if ([sel isEqualToString:@"resizableSnapshotViewFromRect:afterScreenUpdates:withCapInsets:"]) {
      CGRect a0 = JSONToRect(args.value(0));
      BOOL a1 = NACRE_BOOL(args.value(1), @"afterScreenUpdates");
      UIEdgeInsets a2 = JSONToInsets(args.value(2));
      *out = {NacreKeep([o resizableSnapshotViewFromRect:a0 afterScreenUpdates:a1 withCapInsets:a2]), "UIView"};
      return true;
    }
  }
  return false;
}

}  // namespace nacre_bridge

@interface NacreViewAdditionsDomain : NSObject
@end
@implementation NacreViewAdditionsDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "view-additions";
  d.classes = {UIView.class, UIScrollView.class, UITextField.class, UITextView.class};
  d.read = nacre_bridge::ReadViewAdditionsProperty;
  d.write = nacre_bridge::WriteViewAdditionsProperty;
  d.readObject = nacre_bridge::ReadViewAdditionsObjectProperty;
  d.writeObject = nacre_bridge::WriteViewAdditionsObjectProperty;
  d.call = nacre_bridge::CallViewAdditionsMethod;
  d.callObject = nacre_bridge::CallViewAdditionsObjectMethod;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
