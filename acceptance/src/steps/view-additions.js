// 初稿是 bindgen 生成的（docs/internals/bindgen.md）。之后它是普通的手写文件：直接改，bindgen 不会再碰它。
//
// 补到已接的类上的成员：UIView、UIScrollView、UITextField、UITextView。这四个类是手写的，
// 这里的成员是 2026-11-18 用 bindgen 出的初稿补上去的（挂在它们的原型上），之后是手写的。
//
// 前半是初稿带的读写往返；后半是手写的，按实际怎么用来验待办里点名要的那几样：
// 滚动视图的缩放、视图的 tintColor 和 maskView、输入框两边的视图、键盘设置里智能引号那一组。

import { enumIgnored, ENUM_IGNORED } from '../support.js';

// 一组断言中途抛了只废这一组，不连累后面的
/**
 * @param {string} name
 * @param {() => void} fn
 */
function group(name, fn) {
  try {
    fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log('  ✗ ' + name + ' 这一组中断了 = ' + message + '（期望跑完）');
  }
}

/**
 * 做一件该抛 TypeError 的事，把实际发生的写成一句话
 * @param {() => void} fn
 * @returns {string}
 */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : String(err);
  }
}

/** @param {import("../main.js").StepContext} ctx */
export function stepViewAdditions(ctx) {
  const { assert } = ctx;
  console.log('--- 补到已接的类上的成员：属性的读写往返 ---');

  group('UIView', () => {
    const o = new UIView();
    assert('UIView.canBecomeFocused 读出来是布尔', typeof o.canBecomeFocused, 'boolean');
    assert('UIView.isFocused 读出来是布尔', typeof o.isFocused, 'boolean');
    assert('UIView.focusGroupIdentifier 读出来是字符串或 null', o.focusGroupIdentifier === null || typeof o.focusGroupIdentifier === 'string', true);
    {
      const before = o.focusGroupIdentifier;
      o.focusGroupIdentifier = before;
      assert('UIView.focusGroupIdentifier 写回原值，读到的不变', o.focusGroupIdentifier, before);
    }
    assert('UIView.semanticContentAttribute 读出来是 unspecified / playback / spatial / forceLeftToRight / forceRightToLeft 里的一个', ['unspecified','playback','spatial','forceLeftToRight','forceRightToLeft'].includes(o.semanticContentAttribute), true);
    {
      const before = o.semanticContentAttribute;
      o.semanticContentAttribute = before;
      assert('UIView.semanticContentAttribute 写回原值，读到的不变', o.semanticContentAttribute, before);
    }
    assert('UIView.effectiveUserInterfaceLayoutDirection 读出来是 leftToRight / rightToLeft 里的一个', ['leftToRight','rightToLeft'].includes(o.effectiveUserInterfaceLayoutDirection), true);
    assert('UIView.contentScaleFactor 读出来是数', typeof o.contentScaleFactor, 'number');
    {
      const before = o.contentScaleFactor;
      o.contentScaleFactor = before;
      assert('UIView.contentScaleFactor 写回原值，读到的不变', o.contentScaleFactor, before);
    }
    assert('UIView.anchorPoint 读出来是 CGPoint', o.anchorPoint instanceof CGPoint, true);
    {
      const before = o.anchorPoint;
      o.anchorPoint = before;
      assert('UIView.anchorPoint 写回原值，读到的不变', [o.anchorPoint.x, o.anchorPoint.y].join(','), [before.x, before.y].join(','));
    }
    assert('UIView.isMultipleTouchEnabled 读出来是布尔', typeof o.isMultipleTouchEnabled, 'boolean');
    {
      const before = o.isMultipleTouchEnabled;
      o.isMultipleTouchEnabled = before;
      assert('UIView.isMultipleTouchEnabled 写回原值，读到的不变', o.isMultipleTouchEnabled, before);
    }
    assert('UIView.isExclusiveTouch 读出来是布尔', typeof o.isExclusiveTouch, 'boolean');
    {
      const before = o.isExclusiveTouch;
      o.isExclusiveTouch = before;
      assert('UIView.isExclusiveTouch 写回原值，读到的不变', o.isExclusiveTouch, before);
    }
    assert('UIView.autoresizesSubviews 读出来是布尔', typeof o.autoresizesSubviews, 'boolean');
    {
      const before = o.autoresizesSubviews;
      o.autoresizesSubviews = before;
      assert('UIView.autoresizesSubviews 写回原值，读到的不变', o.autoresizesSubviews, before);
    }
    assert('UIView.autoresizingMask 读出来是名字的数组', Array.isArray(o.autoresizingMask), true);
    {
      const before = o.autoresizingMask;
      o.autoresizingMask = before;
      assert('UIView.autoresizingMask 写回原值，读到的不变', o.autoresizingMask.join(','), before.join(','));
    }
    assert('UIView.clearsContextBeforeDrawing 读出来是布尔', typeof o.clearsContextBeforeDrawing, 'boolean');
    {
      const before = o.clearsContextBeforeDrawing;
      o.clearsContextBeforeDrawing = before;
      assert('UIView.clearsContextBeforeDrawing 写回原值，读到的不变', o.clearsContextBeforeDrawing, before);
    }
    assert('UIView.maskView 读出来是 UIView 或 null', o.maskView === null || o.maskView instanceof UIView, true);
    {
      const before = o.maskView;
      o.maskView = before;
      assert('UIView.maskView 写回原值不抛', true, true);
    }
    assert('UIView.tintColor 读出来是颜色的字符串或 null', o.tintColor === null || typeof o.tintColor === 'string', true);
    {
      const before = o.tintColor;
      o.tintColor = before;
      assert('UIView.tintColor 写回原值，读到的不变', o.tintColor, before);
    }
    assert('UIView.tintAdjustmentMode 读出来是 automatic / normal / dimmed 里的一个', ['automatic','normal','dimmed'].includes(o.tintAdjustmentMode), true);
    {
      const before = o.tintAdjustmentMode;
      o.tintAdjustmentMode = before;
      assert('UIView.tintAdjustmentMode 写回原值，读到的不变', o.tintAdjustmentMode, before);
    }
    assert('UIView.alignmentRectInsets 读出来是 UIEdgeInsets', o.alignmentRectInsets instanceof UIEdgeInsets, true);
    assert('UIView.viewForFirstBaselineLayout 读出来是 UIView 或 null', o.viewForFirstBaselineLayout === null || o.viewForFirstBaselineLayout instanceof UIView, true);
    assert('UIView.viewForLastBaselineLayout 读出来是 UIView 或 null', o.viewForLastBaselineLayout === null || o.viewForLastBaselineLayout instanceof UIView, true);
    assert('UIView.restorationIdentifier 读出来是字符串或 null', o.restorationIdentifier === null || typeof o.restorationIdentifier === 'string', true);
    {
      const before = o.restorationIdentifier;
      o.restorationIdentifier = before;
      assert('UIView.restorationIdentifier 写回原值，读到的不变', o.restorationIdentifier, before);
    }
    assert('UIView.appliedContentSizeCategoryLimitsDescription 读出来是字符串或 null', o.appliedContentSizeCategoryLimitsDescription === null || typeof o.appliedContentSizeCategoryLimitsDescription === 'string', true);
    assert('UIView.accessibilityIgnoresInvertColors 读出来是布尔', typeof o.accessibilityIgnoresInvertColors, 'boolean');
    {
      const before = o.accessibilityIgnoresInvertColors;
      o.accessibilityIgnoresInvertColors = before;
      assert('UIView.accessibilityIgnoresInvertColors 写回原值，读到的不变', o.accessibilityIgnoresInvertColors, before);
    }
    assert('UIView.showsLargeContentViewer 读出来是布尔', typeof o.showsLargeContentViewer, 'boolean');
    {
      const before = o.showsLargeContentViewer;
      o.showsLargeContentViewer = before;
      assert('UIView.showsLargeContentViewer 写回原值，读到的不变', o.showsLargeContentViewer, before);
    }
    assert('UIView.largeContentTitle 读出来是字符串或 null', o.largeContentTitle === null || typeof o.largeContentTitle === 'string', true);
    {
      const before = o.largeContentTitle;
      o.largeContentTitle = before;
      assert('UIView.largeContentTitle 写回原值，读到的不变', o.largeContentTitle, before);
    }
    assert('UIView.largeContentImage 读出来是 UIImage 或 null', o.largeContentImage === null || o.largeContentImage instanceof UIImage, true);
    {
      const before = o.largeContentImage;
      o.largeContentImage = before;
      assert('UIView.largeContentImage 写回原值不抛', true, true);
    }
    assert('UIView.scalesLargeContentImage 读出来是布尔', typeof o.scalesLargeContentImage, 'boolean');
    {
      const before = o.scalesLargeContentImage;
      o.scalesLargeContentImage = before;
      assert('UIView.scalesLargeContentImage 写回原值，读到的不变', o.scalesLargeContentImage, before);
    }
    assert('UIView.largeContentImageInsets 读出来是 UIEdgeInsets', o.largeContentImageInsets instanceof UIEdgeInsets, true);
    {
      const before = o.largeContentImageInsets;
      o.largeContentImageInsets = before;
      assert('UIView.largeContentImageInsets 写回原值，读到的不变', [o.largeContentImageInsets.top, o.largeContentImageInsets.left, o.largeContentImageInsets.bottom, o.largeContentImageInsets.right].join(','), [before.top, before.left, before.bottom, before.right].join(','));
    }
  });

  group('UIScrollView', () => {
    const o = new UIScrollView();
    assert('UIScrollView.contentAlignmentPoint 读出来是 CGPoint', o.contentAlignmentPoint instanceof CGPoint, true);
    {
      const before = o.contentAlignmentPoint;
      o.contentAlignmentPoint = before;
      assert('UIScrollView.contentAlignmentPoint 写回原值，读到的不变', [o.contentAlignmentPoint.x, o.contentAlignmentPoint.y].join(','), [before.x, before.y].join(','));
    }
    assert('UIScrollView.bouncesHorizontally 读出来是布尔', typeof o.bouncesHorizontally, 'boolean');
    {
      const before = o.bouncesHorizontally;
      o.bouncesHorizontally = before;
      assert('UIScrollView.bouncesHorizontally 写回原值，读到的不变', o.bouncesHorizontally, before);
    }
    assert('UIScrollView.bouncesVertically 读出来是布尔', typeof o.bouncesVertically, 'boolean');
    {
      const before = o.bouncesVertically;
      o.bouncesVertically = before;
      assert('UIScrollView.bouncesVertically 写回原值，读到的不变', o.bouncesVertically, before);
    }
    assert('UIScrollView.transfersHorizontalScrollingToParent 读出来是布尔', typeof o.transfersHorizontalScrollingToParent, 'boolean');
    {
      const before = o.transfersHorizontalScrollingToParent;
      o.transfersHorizontalScrollingToParent = before;
      assert('UIScrollView.transfersHorizontalScrollingToParent 写回原值，读到的不变', o.transfersHorizontalScrollingToParent, before);
    }
    assert('UIScrollView.transfersVerticalScrollingToParent 读出来是布尔', typeof o.transfersVerticalScrollingToParent, 'boolean');
    {
      const before = o.transfersVerticalScrollingToParent;
      o.transfersVerticalScrollingToParent = before;
      assert('UIScrollView.transfersVerticalScrollingToParent 写回原值，读到的不变', o.transfersVerticalScrollingToParent, before);
    }
    assert('UIScrollView.scrollIndicatorInsets 读出来是 UIEdgeInsets', o.scrollIndicatorInsets instanceof UIEdgeInsets, true);
    {
      const before = o.scrollIndicatorInsets;
      o.scrollIndicatorInsets = before;
      assert('UIScrollView.scrollIndicatorInsets 写回原值，读到的不变', [o.scrollIndicatorInsets.top, o.scrollIndicatorInsets.left, o.scrollIndicatorInsets.bottom, o.scrollIndicatorInsets.right].join(','), [before.top, before.left, before.bottom, before.right].join(','));
    }
    assert('UIScrollView.indexDisplayMode 读出来是 automatic / alwaysHidden 里的一个', ['automatic','alwaysHidden'].includes(o.indexDisplayMode), true);
    {
      const before = o.indexDisplayMode;
      o.indexDisplayMode = before;
      assert('UIScrollView.indexDisplayMode 写回原值，读到的不变', o.indexDisplayMode, before);
    }
    assert('UIScrollView.minimumZoomScale 读出来是数', typeof o.minimumZoomScale, 'number');
    {
      const before = o.minimumZoomScale;
      o.minimumZoomScale = before;
      assert('UIScrollView.minimumZoomScale 写回原值，读到的不变', o.minimumZoomScale, before);
    }
    assert('UIScrollView.maximumZoomScale 读出来是数', typeof o.maximumZoomScale, 'number');
    {
      const before = o.maximumZoomScale;
      o.maximumZoomScale = before;
      assert('UIScrollView.maximumZoomScale 写回原值，读到的不变', o.maximumZoomScale, before);
    }
    assert('UIScrollView.zoomScale 读出来是数', typeof o.zoomScale, 'number');
    {
      const before = o.zoomScale;
      o.zoomScale = before;
      assert('UIScrollView.zoomScale 写回原值，读到的不变', o.zoomScale, before);
    }
    assert('UIScrollView.bouncesZoom 读出来是布尔', typeof o.bouncesZoom, 'boolean');
    {
      const before = o.bouncesZoom;
      o.bouncesZoom = before;
      assert('UIScrollView.bouncesZoom 写回原值，读到的不变', o.bouncesZoom, before);
    }
    assert('UIScrollView.isZooming 读出来是布尔', typeof o.isZooming, 'boolean');
    assert('UIScrollView.isZoomBouncing 读出来是布尔', typeof o.isZoomBouncing, 'boolean');
    assert('UIScrollView.isZoomAnimating 读出来是布尔', typeof o.isZoomAnimating, 'boolean');
    assert('UIScrollView.panGestureRecognizer 读出来是 UIPanGestureRecognizer 或 null', o.panGestureRecognizer === null || o.panGestureRecognizer instanceof UIPanGestureRecognizer, true);
    assert('UIScrollView.pinchGestureRecognizer 读出来是 UIPinchGestureRecognizer 或 null', o.pinchGestureRecognizer === null || o.pinchGestureRecognizer instanceof UIPinchGestureRecognizer, true);
    assert('UIScrollView.directionalPressGestureRecognizer 读出来是 UIGestureRecognizer 或 null', o.directionalPressGestureRecognizer === null || o.directionalPressGestureRecognizer instanceof UIGestureRecognizer, true);
    assert('UIScrollView.allowsKeyboardScrolling 读出来是布尔', typeof o.allowsKeyboardScrolling, 'boolean');
    {
      const before = o.allowsKeyboardScrolling;
      o.allowsKeyboardScrolling = before;
      assert('UIScrollView.allowsKeyboardScrolling 写回原值，读到的不变', o.allowsKeyboardScrolling, before);
    }
  });

  group('UITextField', () => {
    const o = new UITextField();
    assert('UITextField.background 读出来是 UIImage 或 null', o.background === null || o.background instanceof UIImage, true);
    {
      const before = o.background;
      o.background = before;
      assert('UITextField.background 写回原值不抛', true, true);
    }
    assert('UITextField.disabledBackground 读出来是 UIImage 或 null', o.disabledBackground === null || o.disabledBackground instanceof UIImage, true);
    {
      const before = o.disabledBackground;
      o.disabledBackground = before;
      assert('UITextField.disabledBackground 写回原值不抛', true, true);
    }
    assert('UITextField.allowsEditingTextAttributes 读出来是布尔', typeof o.allowsEditingTextAttributes, 'boolean');
    {
      const before = o.allowsEditingTextAttributes;
      o.allowsEditingTextAttributes = before;
      assert('UITextField.allowsEditingTextAttributes 写回原值，读到的不变', o.allowsEditingTextAttributes, before);
    }
    assert('UITextField.leftView 读出来是 UIView 或 null', o.leftView === null || o.leftView instanceof UIView, true);
    {
      const before = o.leftView;
      o.leftView = before;
      assert('UITextField.leftView 写回原值不抛', true, true);
    }
    assert('UITextField.leftViewMode 读出来是 never / whileEditing / unlessEditing / always 里的一个', ['never','whileEditing','unlessEditing','always'].includes(o.leftViewMode), true);
    {
      const before = o.leftViewMode;
      o.leftViewMode = before;
      assert('UITextField.leftViewMode 写回原值，读到的不变', o.leftViewMode, before);
    }
    assert('UITextField.rightView 读出来是 UIView 或 null', o.rightView === null || o.rightView instanceof UIView, true);
    {
      const before = o.rightView;
      o.rightView = before;
      assert('UITextField.rightView 写回原值不抛', true, true);
    }
    assert('UITextField.rightViewMode 读出来是 never / whileEditing / unlessEditing / always 里的一个', ['never','whileEditing','unlessEditing','always'].includes(o.rightViewMode), true);
    {
      const before = o.rightViewMode;
      o.rightViewMode = before;
      assert('UITextField.rightViewMode 写回原值，读到的不变', o.rightViewMode, before);
    }
    assert('UITextField.inputView 读出来是 UIView 或 null', o.inputView === null || o.inputView instanceof UIView, true);
    {
      const before = o.inputView;
      o.inputView = before;
      assert('UITextField.inputView 写回原值不抛', true, true);
    }
    assert('UITextField.clearsOnInsertion 读出来是布尔', typeof o.clearsOnInsertion, 'boolean');
    {
      const before = o.clearsOnInsertion;
      o.clearsOnInsertion = before;
      assert('UITextField.clearsOnInsertion 写回原值，读到的不变', o.clearsOnInsertion, before);
    }
    assert('UITextField.smartQuotesType 读出来是 default / no / yes 里的一个', ['default','no','yes'].includes(o.smartQuotesType), true);
    {
      const before = o.smartQuotesType;
      o.smartQuotesType = before;
      assert('UITextField.smartQuotesType 写回原值，读到的不变', o.smartQuotesType, before);
    }
    assert('UITextField.smartDashesType 读出来是 default / no / yes 里的一个', ['default','no','yes'].includes(o.smartDashesType), true);
    {
      const before = o.smartDashesType;
      o.smartDashesType = before;
      assert('UITextField.smartDashesType 写回原值，读到的不变', o.smartDashesType, before);
    }
    assert('UITextField.smartInsertDeleteType 读出来是 default / no / yes 里的一个', ['default','no','yes'].includes(o.smartInsertDeleteType), true);
    {
      const before = o.smartInsertDeleteType;
      o.smartInsertDeleteType = before;
      assert('UITextField.smartInsertDeleteType 写回原值，读到的不变', o.smartInsertDeleteType, before);
    }
    assert('UITextField.inlinePredictionType 读出来是 default / no / yes 里的一个', ['default','no','yes'].includes(o.inlinePredictionType), true);
    {
      const before = o.inlinePredictionType;
      o.inlinePredictionType = before;
      assert('UITextField.inlinePredictionType 写回原值，读到的不变', o.inlinePredictionType, before);
    }
    assert('UITextField.mathExpressionCompletionType 读出来是 default / no / yes 里的一个', ['default','no','yes'].includes(o.mathExpressionCompletionType), true);
    {
      const before = o.mathExpressionCompletionType;
      o.mathExpressionCompletionType = before;
      assert('UITextField.mathExpressionCompletionType 写回原值，读到的不变', o.mathExpressionCompletionType, before);
    }
    assert('UITextField.writingToolsBehavior 读出来是 none / default / complete / limited 里的一个', ['none','default','complete','limited'].includes(o.writingToolsBehavior), true);
    {
      const before = o.writingToolsBehavior;
      o.writingToolsBehavior = before;
      assert('UITextField.writingToolsBehavior 写回原值，读到的不变', o.writingToolsBehavior, before);
    }
    assert('UITextField.allowedWritingToolsResultOptions 读出来是名字的数组', Array.isArray(o.allowedWritingToolsResultOptions), true);
    {
      const before = o.allowedWritingToolsResultOptions;
      o.allowedWritingToolsResultOptions = before;
      assert('UITextField.allowedWritingToolsResultOptions 写回原值，读到的不变', o.allowedWritingToolsResultOptions.join(','), before.join(','));
    }
    assert('UITextField.allowsNumberPadPopover 读出来是布尔', typeof o.allowsNumberPadPopover, 'boolean');
    {
      const before = o.allowsNumberPadPopover;
      o.allowsNumberPadPopover = before;
      assert('UITextField.allowsNumberPadPopover 写回原值，读到的不变', o.allowsNumberPadPopover, before);
    }
  });

  group('UITextView', () => {
    const o = new UITextView();
    assert('UITextView.dataDetectorTypes 读出来是名字的数组', Array.isArray(o.dataDetectorTypes), true);
    {
      const before = o.dataDetectorTypes;
      o.dataDetectorTypes = before;
      assert('UITextView.dataDetectorTypes 写回原值，读到的不变', o.dataDetectorTypes.join(','), before.join(','));
    }
    assert('UITextView.allowsEditingTextAttributes 读出来是布尔', typeof o.allowsEditingTextAttributes, 'boolean');
    {
      const before = o.allowsEditingTextAttributes;
      o.allowsEditingTextAttributes = before;
      assert('UITextView.allowsEditingTextAttributes 写回原值，读到的不变', o.allowsEditingTextAttributes, before);
    }
    assert('UITextView.inputView 读出来是 UIView 或 null', o.inputView === null || o.inputView instanceof UIView, true);
    {
      const before = o.inputView;
      o.inputView = before;
      assert('UITextView.inputView 写回原值不抛', true, true);
    }
    assert('UITextView.clearsOnInsertion 读出来是布尔', typeof o.clearsOnInsertion, 'boolean');
    {
      const before = o.clearsOnInsertion;
      o.clearsOnInsertion = before;
      assert('UITextView.clearsOnInsertion 写回原值，读到的不变', o.clearsOnInsertion, before);
    }
    assert('UITextView.usesStandardTextScaling 读出来是布尔', typeof o.usesStandardTextScaling, 'boolean');
    {
      const before = o.usesStandardTextScaling;
      o.usesStandardTextScaling = before;
      assert('UITextView.usesStandardTextScaling 写回原值，读到的不变', o.usesStandardTextScaling, before);
    }
    assert('UITextView.isFindInteractionEnabled 读出来是布尔', typeof o.isFindInteractionEnabled, 'boolean');
    {
      const before = o.isFindInteractionEnabled;
      o.isFindInteractionEnabled = before;
      assert('UITextView.isFindInteractionEnabled 写回原值，读到的不变', o.isFindInteractionEnabled, before);
    }
    assert('UITextView.isWritingToolsActive 读出来是布尔', typeof o.isWritingToolsActive, 'boolean');
    assert('UITextView.writingToolsBehavior 读出来是 none / default / complete / limited 里的一个', ['none','default','complete','limited'].includes(o.writingToolsBehavior), true);
    {
      const before = o.writingToolsBehavior;
      o.writingToolsBehavior = before;
      assert('UITextView.writingToolsBehavior 写回原值，读到的不变', o.writingToolsBehavior, before);
    }
    assert('UITextView.allowedWritingToolsResultOptions 读出来是名字的数组', Array.isArray(o.allowedWritingToolsResultOptions), true);
    {
      const before = o.allowedWritingToolsResultOptions;
      o.allowedWritingToolsResultOptions = before;
      assert('UITextView.allowedWritingToolsResultOptions 写回原值，读到的不变', o.allowedWritingToolsResultOptions.join(','), before.join(','));
    }
    assert('UITextView.smartQuotesType 读出来是 default / no / yes 里的一个', ['default','no','yes'].includes(o.smartQuotesType), true);
    {
      const before = o.smartQuotesType;
      o.smartQuotesType = before;
      assert('UITextView.smartQuotesType 写回原值，读到的不变', o.smartQuotesType, before);
    }
    assert('UITextView.smartDashesType 读出来是 default / no / yes 里的一个', ['default','no','yes'].includes(o.smartDashesType), true);
    {
      const before = o.smartDashesType;
      o.smartDashesType = before;
      assert('UITextView.smartDashesType 写回原值，读到的不变', o.smartDashesType, before);
    }
    assert('UITextView.smartInsertDeleteType 读出来是 default / no / yes 里的一个', ['default','no','yes'].includes(o.smartInsertDeleteType), true);
    {
      const before = o.smartInsertDeleteType;
      o.smartInsertDeleteType = before;
      assert('UITextView.smartInsertDeleteType 写回原值，读到的不变', o.smartInsertDeleteType, before);
    }
    assert('UITextView.inlinePredictionType 读出来是 default / no / yes 里的一个', ['default','no','yes'].includes(o.inlinePredictionType), true);
    {
      const before = o.inlinePredictionType;
      o.inlinePredictionType = before;
      assert('UITextView.inlinePredictionType 写回原值，读到的不变', o.inlinePredictionType, before);
    }
    assert('UITextView.mathExpressionCompletionType 读出来是 default / no / yes 里的一个', ['default','no','yes'].includes(o.mathExpressionCompletionType), true);
    {
      const before = o.mathExpressionCompletionType;
      o.mathExpressionCompletionType = before;
      assert('UITextView.mathExpressionCompletionType 写回原值，读到的不变', o.mathExpressionCompletionType, before);
    }
    assert('UITextView.allowsNumberPadPopover 读出来是布尔', typeof o.allowsNumberPadPopover, 'boolean');
    {
      const before = o.allowsNumberPadPopover;
      o.allowsNumberPadPopover = before;
      assert('UITextView.allowsNumberPadPopover 写回原值，读到的不变', o.allowsNumberPadPopover, before);
    }
  });

  // ---- 下面是手写的：待办里点名要的那几样，按实际怎么用来验 ----

  group('手写的成员没有被动到', () => {
    const scroll = new UIScrollView();
    scroll.contentSize = new CGSize(300, 600);
    assert('UIScrollView 手写的 contentSize 照常', scroll.contentSize.height, 600);
    const field = new UITextField();
    field.placeholder = '搜索';
    assert('UITextField 手写的 placeholder 照常', field.placeholder, '搜索');
    assert('补的属性在原型上，不在实例上', Object.prototype.hasOwnProperty.call(scroll, 'zoomScale'), false);
    assert('补的属性在 UIScrollView 的原型上', Object.prototype.hasOwnProperty.call(UIScrollView.prototype, 'zoomScale'), true);
  });

  group('滚动视图的缩放', () => {
    const scroll = new UIScrollView();
    assert('默认缩放是 1', scroll.zoomScale, 1);
    assert('默认最小缩放是 1', scroll.minimumZoomScale, 1);
    assert('默认最大缩放是 1', scroll.maximumZoomScale, 1);
    assert('没在缩放', scroll.isZooming, false);
    scroll.minimumZoomScale = 0.5;
    scroll.maximumZoomScale = 4;
    assert('最小缩放写得进去', scroll.minimumZoomScale, 0.5);
    assert('最大缩放写得进去', scroll.maximumZoomScale, 4);
    scroll.bouncesZoom = false;
    assert('bouncesZoom 写得进去', scroll.bouncesZoom, false);
    assert('捏合的手势识别器是手写的那个类', scroll.pinchGestureRecognizer === null ||
           scroll.pinchGestureRecognizer instanceof UIPinchGestureRecognizer, true);
    assert('滚动的手势识别器是手写的那个类', scroll.panGestureRecognizer instanceof UIPanGestureRecognizer, true);
    assert('读两次是同一个对象', scroll.panGestureRecognizer === scroll.panGestureRecognizer, true);
    assert('setZoomScale 缺 animated 不抛（它可以不带）', thrown(() => { scroll.setZoomScale(1); }), '没抛');
    assert('zoomToRect 给的不是矩形抛 TypeError',
           thrown(() => { scroll.zoomToRect(/** @type {any} */ ('x'), { animated: false }); }), 'TypeError');
  });

  group('视图的 tintColor', () => {
    const parent = new UIView();
    const child = new UIView();
    parent.addSubview(child);
    parent.tintColor = 'systemRed';
    assert('tintColor 写颜色名，原样读回', parent.tintColor, 'systemRed');
    assert('tintAdjustmentMode 是三个名字里的一个',
           ['automatic', 'normal', 'dimmed'].includes(parent.tintAdjustmentMode), true);
    parent.tintAdjustmentMode = 'dimmed';
    assert('tintAdjustmentMode 写得进去', parent.tintAdjustmentMode, 'dimmed');
    assert('tintAdjustmentMode 写了不认识的值',
           enumIgnored(() => { parent.tintAdjustmentMode = /** @type {any} */ ('bright'); },
                       () => parent.tintAdjustmentMode), ENUM_IGNORED);
    // 子类上也有：UIScrollView、UITextField 都是 UIView，这些成员是挂在 UIView 的原型上的
    const field = new UITextField();
    field.tintColor = '#00ff00';
    assert('子类上也能用 tintColor', field.tintColor, '#00ff00');
  });

  group('视图的 maskView 和输入框两边的视图：对象属性', () => {
    const view = new UIView();
    const mask = new UIView();
    assert('默认没有 maskView', view.maskView, null);
    view.maskView = mask;
    assert('maskView 写进去读回来是同一个对象', view.maskView === mask, true);
    view.maskView = null;
    assert('maskView 写 null', view.maskView, null);
    const field = new UITextField();
    const left = new UIView();
    field.leftView = left;
    assert('leftView 写进去读回来是同一个对象', field.leftView === left, true);
    field.leftViewMode = 'always';
    assert('leftViewMode 写得进去', field.leftViewMode, 'always');
    assert('leftView 写不是视图的抛 TypeError',
           thrown(() => { field.leftView = /** @type {any} */ ('x'); }), 'TypeError');
  });

  group('键盘的设置：智能引号这一组', () => {
    const field = new UITextField();
    for (const value of /** @type {const} */ (['no', 'yes', 'default'])) {
      field.smartQuotesType = value;
      assert('UITextField.smartQuotesType 写 ' + value, field.smartQuotesType, value);
      field.smartDashesType = value;
      assert('UITextField.smartDashesType 写 ' + value, field.smartDashesType, value);
      field.smartInsertDeleteType = value;
      assert('UITextField.smartInsertDeleteType 写 ' + value, field.smartInsertDeleteType, value);
    }
    const area = new UITextView();
    area.smartQuotesType = 'no';
    assert('UITextView.smartQuotesType 写 no', area.smartQuotesType, 'no');
    area.inlinePredictionType = 'no';
    assert('UITextView.inlinePredictionType 写 no', area.inlinePredictionType, 'no');
    // 原有的那九个键盘设置和后补的在同一个对象上并存
    field.keyboardType = 'emailAddress';
    assert('手写的 keyboardType 照常', field.keyboardType, 'emailAddress');
  });
}
