// 初稿是 bindgen 生成的（docs/internals/bindgen.md）。之后它是普通的手写文件：直接改，bindgen 不会再碰它。
//
// UIView（补成员）、UIScrollView（补成员）、UITextField（补成员）、UITextView（补成员）。
// 这是内置脚本的一个 part：整个文件是一个函数表达式，运行时按文件名顺序执行，用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    INSETS_FIELDS,
    POINT_FIELDS,
    RECT_FIELDS,
    colorArg,
    colorString,
    has,
    nativeCall,
    nativeCallObject,
    nativeGet,
    nativeGetOwned,
    nativeSet,
    nativeSetOwned,
    requireNative,
    structArg,
    toBoolean,
    toInsets,
    toInteger,
    toNumber,
    toPoint,
    toRect,
    toTextOrNull,
  } = ctx;

  const define = (proto, name, value) => Object.defineProperty(proto, name, { configurable: true, enumerable: false, writable: true, value });

  // ---- UIView：手写的类，这里只补它没有的成员 ----
  Object.defineProperty(UIView.prototype, 'canBecomeFocused', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'canBecomeFocused'); return nativeGet(this, 'canBecomeFocused'); },
  });
  Object.defineProperty(UIView.prototype, 'isFocused', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'isFocused'); return nativeGet(this, 'isFocused'); },
  });
  Object.defineProperty(UIView.prototype, 'focusGroupIdentifier', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'focusGroupIdentifier'); return nativeGet(this, 'focusGroupIdentifier'); },
    set(value) { requireNative(this, 'focusGroupIdentifier'); nativeSet(this, 'focusGroupIdentifier', toTextOrNull(value)); },
  });
  Object.defineProperty(UIView.prototype, 'semanticContentAttribute', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'semanticContentAttribute'); return nativeGet(this, 'semanticContentAttribute'); },
    set(value) { requireNative(this, 'semanticContentAttribute'); nativeSet(this, 'semanticContentAttribute', value); },
  });
  Object.defineProperty(UIView.prototype, 'effectiveUserInterfaceLayoutDirection', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'effectiveUserInterfaceLayoutDirection'); return nativeGet(this, 'effectiveUserInterfaceLayoutDirection'); },
  });
  Object.defineProperty(UIView.prototype, 'contentScaleFactor', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'contentScaleFactor'); return nativeGet(this, 'contentScaleFactor'); },
    set(value) { requireNative(this, 'contentScaleFactor'); nativeSet(this, 'contentScaleFactor', toNumber(value, 'contentScaleFactor')); },
  });
  Object.defineProperty(UIView.prototype, 'anchorPoint', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'anchorPoint'); return toPoint(nativeGet(this, 'anchorPoint')); },
    set(value) { requireNative(this, 'anchorPoint'); nativeSet(this, 'anchorPoint', structArg(value, POINT_FIELDS, 'anchorPoint')); },
  });
  Object.defineProperty(UIView.prototype, 'isMultipleTouchEnabled', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'isMultipleTouchEnabled'); return nativeGet(this, 'isMultipleTouchEnabled'); },
    set(value) { requireNative(this, 'isMultipleTouchEnabled'); nativeSet(this, 'isMultipleTouchEnabled', toBoolean(value)); },
  });
  Object.defineProperty(UIView.prototype, 'isExclusiveTouch', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'isExclusiveTouch'); return nativeGet(this, 'isExclusiveTouch'); },
    set(value) { requireNative(this, 'isExclusiveTouch'); nativeSet(this, 'isExclusiveTouch', toBoolean(value)); },
  });
  Object.defineProperty(UIView.prototype, 'autoresizesSubviews', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'autoresizesSubviews'); return nativeGet(this, 'autoresizesSubviews'); },
    set(value) { requireNative(this, 'autoresizesSubviews'); nativeSet(this, 'autoresizesSubviews', toBoolean(value)); },
  });
  Object.defineProperty(UIView.prototype, 'autoresizingMask', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'autoresizingMask'); return nativeGet(this, 'autoresizingMask'); },
    set(value) { requireNative(this, 'autoresizingMask'); nativeSet(this, 'autoresizingMask', value); },
  });
  Object.defineProperty(UIView.prototype, 'clearsContextBeforeDrawing', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'clearsContextBeforeDrawing'); return nativeGet(this, 'clearsContextBeforeDrawing'); },
    set(value) { requireNative(this, 'clearsContextBeforeDrawing'); nativeSet(this, 'clearsContextBeforeDrawing', toBoolean(value)); },
  });
  Object.defineProperty(UIView.prototype, 'maskView', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'maskView'); return nativeGetOwned(this, 'maskView'); },
    set(value) { requireNative(this, 'maskView'); nativeSetOwned(this, 'maskView', value); },
  });
  Object.defineProperty(UIView.prototype, 'tintColor', {
    configurable: true,
    enumerable: false,
    get() {
      requireNative(this, 'tintColor');
      return colorString(nativeGetOwned(this, 'tintColor'));
    },
    set(value) {
      requireNative(this, 'tintColor');
      const color = colorArg(value, 'tintColor');
      if (color === undefined) return;
      nativeSetOwned(this, 'tintColor', color);
    },
  });
  Object.defineProperty(UIView.prototype, 'tintAdjustmentMode', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'tintAdjustmentMode'); return nativeGet(this, 'tintAdjustmentMode'); },
    set(value) { requireNative(this, 'tintAdjustmentMode'); nativeSet(this, 'tintAdjustmentMode', value); },
  });
  Object.defineProperty(UIView.prototype, 'alignmentRectInsets', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'alignmentRectInsets'); return toInsets(nativeGet(this, 'alignmentRectInsets')); },
  });
  Object.defineProperty(UIView.prototype, 'viewForFirstBaselineLayout', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'viewForFirstBaselineLayout'); return nativeGetOwned(this, 'viewForFirstBaselineLayout'); },
  });
  Object.defineProperty(UIView.prototype, 'viewForLastBaselineLayout', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'viewForLastBaselineLayout'); return nativeGetOwned(this, 'viewForLastBaselineLayout'); },
  });
  Object.defineProperty(UIView.prototype, 'restorationIdentifier', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'restorationIdentifier'); return nativeGet(this, 'restorationIdentifier'); },
    set(value) { requireNative(this, 'restorationIdentifier'); nativeSet(this, 'restorationIdentifier', toTextOrNull(value)); },
  });
  Object.defineProperty(UIView.prototype, 'appliedContentSizeCategoryLimitsDescription', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'appliedContentSizeCategoryLimitsDescription'); return nativeGet(this, 'appliedContentSizeCategoryLimitsDescription'); },
  });
  Object.defineProperty(UIView.prototype, 'accessibilityIgnoresInvertColors', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'accessibilityIgnoresInvertColors'); return nativeGet(this, 'accessibilityIgnoresInvertColors'); },
    set(value) { requireNative(this, 'accessibilityIgnoresInvertColors'); nativeSet(this, 'accessibilityIgnoresInvertColors', toBoolean(value)); },
  });
  Object.defineProperty(UIView.prototype, 'showsLargeContentViewer', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'showsLargeContentViewer'); return nativeGet(this, 'showsLargeContentViewer'); },
    set(value) { requireNative(this, 'showsLargeContentViewer'); nativeSet(this, 'showsLargeContentViewer', toBoolean(value)); },
  });
  Object.defineProperty(UIView.prototype, 'largeContentTitle', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'largeContentTitle'); return nativeGet(this, 'largeContentTitle'); },
    set(value) { requireNative(this, 'largeContentTitle'); nativeSet(this, 'largeContentTitle', toTextOrNull(value)); },
  });
  Object.defineProperty(UIView.prototype, 'largeContentImage', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'largeContentImage'); return nativeGetOwned(this, 'largeContentImage'); },
    set(value) { requireNative(this, 'largeContentImage'); nativeSetOwned(this, 'largeContentImage', value); },
  });
  Object.defineProperty(UIView.prototype, 'scalesLargeContentImage', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'scalesLargeContentImage'); return nativeGet(this, 'scalesLargeContentImage'); },
    set(value) { requireNative(this, 'scalesLargeContentImage'); nativeSet(this, 'scalesLargeContentImage', toBoolean(value)); },
  });
  Object.defineProperty(UIView.prototype, 'largeContentImageInsets', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'largeContentImageInsets'); return toInsets(nativeGet(this, 'largeContentImageInsets')); },
    set(value) { requireNative(this, 'largeContentImageInsets'); nativeSet(this, 'largeContentImageInsets', structArg(value, INSETS_FIELDS, 'largeContentImageInsets')); },
  });
  define(UIView.prototype, 'exchangeSubviewAtIndex', function exchangeSubviewAtIndex(index1, options) {
    const o = options == null ? {} : options;
    if (!has(o, 'withSubviewAtIndex')) throw new TypeError('exchangeSubviewAtIndex needs { withSubviewAtIndex }');
    nativeCall(this, 'exchangeSubviewAtIndex:withSubviewAtIndex:', [toInteger(index1, 'exchangeSubviewAtIndex'), toInteger(o.withSubviewAtIndex, 'withSubviewAtIndex')]);
  });
  define(UIView.prototype, 'setNeedsUpdateProperties', function setNeedsUpdateProperties() {
    nativeCall(this, 'setNeedsUpdateProperties', []);
  });
  define(UIView.prototype, 'updatePropertiesIfNeeded', function updatePropertiesIfNeeded() {
    nativeCall(this, 'updatePropertiesIfNeeded', []);
  });
  define(UIView.prototype, 'setNeedsDisplayInRect', function setNeedsDisplayInRect(rect) {
    nativeCall(this, 'setNeedsDisplayInRect:', [structArg(rect, RECT_FIELDS, 'setNeedsDisplayInRect')]);
  });
  define(UIView.prototype, 'updateConstraintsIfNeeded', function updateConstraintsIfNeeded() {
    nativeCall(this, 'updateConstraintsIfNeeded', []);
  });
  define(UIView.prototype, 'needsUpdateConstraints', function needsUpdateConstraints() {
    return nativeCall(this, 'needsUpdateConstraints', []);
  });
  define(UIView.prototype, 'setNeedsUpdateConstraints', function setNeedsUpdateConstraints() {
    nativeCall(this, 'setNeedsUpdateConstraints', []);
  });
  define(UIView.prototype, 'alignmentRectForFrame', function alignmentRectForFrame(frame) {
    return toRect(nativeCall(this, 'alignmentRectForFrame:', [structArg(frame, RECT_FIELDS, 'alignmentRectForFrame')]));
  });
  define(UIView.prototype, 'frameForAlignmentRect', function frameForAlignmentRect(alignmentRect) {
    return toRect(nativeCall(this, 'frameForAlignmentRect:', [structArg(alignmentRect, RECT_FIELDS, 'frameForAlignmentRect')]));
  });
  define(UIView.prototype, 'snapshotViewAfterScreenUpdates', function snapshotViewAfterScreenUpdates(afterUpdates) {
    return nativeCallObject(this, 'snapshotViewAfterScreenUpdates:', [toBoolean(afterUpdates)]);
  });
  define(UIView.prototype, 'resizableSnapshotViewFromRect', function resizableSnapshotViewFromRect(rect, options) {
    const o = options == null ? {} : options;
    if (!has(o, 'afterScreenUpdates')) throw new TypeError('resizableSnapshotViewFromRect needs { afterScreenUpdates }');
    if (!has(o, 'withCapInsets')) throw new TypeError('resizableSnapshotViewFromRect needs { withCapInsets }');
    return nativeCallObject(this, 'resizableSnapshotViewFromRect:afterScreenUpdates:withCapInsets:', [structArg(rect, RECT_FIELDS, 'resizableSnapshotViewFromRect'), toBoolean(o.afterScreenUpdates), structArg(o.withCapInsets, INSETS_FIELDS, 'withCapInsets')]);
  });
  define(UIView.prototype, 'updateTraitsIfNeeded', function updateTraitsIfNeeded() {
    nativeCall(this, 'updateTraitsIfNeeded', []);
  });
  define(UIView.prototype, 'effectiveRadiusForCorner', function effectiveRadiusForCorner(corner) {
    return nativeCall(this, 'effectiveRadiusForCorner:', [corner]);
  });

  // ---- UIScrollView：手写的类，这里只补它没有的成员 ----
  Object.defineProperty(UIScrollView.prototype, 'contentAlignmentPoint', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'contentAlignmentPoint'); return toPoint(nativeGet(this, 'contentAlignmentPoint')); },
    set(value) { requireNative(this, 'contentAlignmentPoint'); nativeSet(this, 'contentAlignmentPoint', structArg(value, POINT_FIELDS, 'contentAlignmentPoint')); },
  });
  Object.defineProperty(UIScrollView.prototype, 'bouncesHorizontally', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'bouncesHorizontally'); return nativeGet(this, 'bouncesHorizontally'); },
    set(value) { requireNative(this, 'bouncesHorizontally'); nativeSet(this, 'bouncesHorizontally', toBoolean(value)); },
  });
  Object.defineProperty(UIScrollView.prototype, 'bouncesVertically', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'bouncesVertically'); return nativeGet(this, 'bouncesVertically'); },
    set(value) { requireNative(this, 'bouncesVertically'); nativeSet(this, 'bouncesVertically', toBoolean(value)); },
  });
  Object.defineProperty(UIScrollView.prototype, 'transfersHorizontalScrollingToParent', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'transfersHorizontalScrollingToParent'); return nativeGet(this, 'transfersHorizontalScrollingToParent'); },
    set(value) { requireNative(this, 'transfersHorizontalScrollingToParent'); nativeSet(this, 'transfersHorizontalScrollingToParent', toBoolean(value)); },
  });
  Object.defineProperty(UIScrollView.prototype, 'transfersVerticalScrollingToParent', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'transfersVerticalScrollingToParent'); return nativeGet(this, 'transfersVerticalScrollingToParent'); },
    set(value) { requireNative(this, 'transfersVerticalScrollingToParent'); nativeSet(this, 'transfersVerticalScrollingToParent', toBoolean(value)); },
  });
  Object.defineProperty(UIScrollView.prototype, 'scrollIndicatorInsets', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'scrollIndicatorInsets'); return toInsets(nativeGet(this, 'scrollIndicatorInsets')); },
    set(value) { requireNative(this, 'scrollIndicatorInsets'); nativeSet(this, 'scrollIndicatorInsets', structArg(value, INSETS_FIELDS, 'scrollIndicatorInsets')); },
  });
  Object.defineProperty(UIScrollView.prototype, 'indexDisplayMode', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'indexDisplayMode'); return nativeGet(this, 'indexDisplayMode'); },
    set(value) { requireNative(this, 'indexDisplayMode'); nativeSet(this, 'indexDisplayMode', value); },
  });
  Object.defineProperty(UIScrollView.prototype, 'minimumZoomScale', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'minimumZoomScale'); return nativeGet(this, 'minimumZoomScale'); },
    set(value) { requireNative(this, 'minimumZoomScale'); nativeSet(this, 'minimumZoomScale', toNumber(value, 'minimumZoomScale')); },
  });
  Object.defineProperty(UIScrollView.prototype, 'maximumZoomScale', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'maximumZoomScale'); return nativeGet(this, 'maximumZoomScale'); },
    set(value) { requireNative(this, 'maximumZoomScale'); nativeSet(this, 'maximumZoomScale', toNumber(value, 'maximumZoomScale')); },
  });
  Object.defineProperty(UIScrollView.prototype, 'zoomScale', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'zoomScale'); return nativeGet(this, 'zoomScale'); },
    set(value) { requireNative(this, 'zoomScale'); nativeSet(this, 'zoomScale', toNumber(value, 'zoomScale')); },
  });
  Object.defineProperty(UIScrollView.prototype, 'bouncesZoom', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'bouncesZoom'); return nativeGet(this, 'bouncesZoom'); },
    set(value) { requireNative(this, 'bouncesZoom'); nativeSet(this, 'bouncesZoom', toBoolean(value)); },
  });
  Object.defineProperty(UIScrollView.prototype, 'isZooming', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'isZooming'); return nativeGet(this, 'isZooming'); },
  });
  Object.defineProperty(UIScrollView.prototype, 'isZoomBouncing', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'isZoomBouncing'); return nativeGet(this, 'isZoomBouncing'); },
  });
  Object.defineProperty(UIScrollView.prototype, 'isZoomAnimating', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'isZoomAnimating'); return nativeGet(this, 'isZoomAnimating'); },
  });
  Object.defineProperty(UIScrollView.prototype, 'panGestureRecognizer', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'panGestureRecognizer'); return nativeGetOwned(this, 'panGestureRecognizer'); },
  });
  Object.defineProperty(UIScrollView.prototype, 'pinchGestureRecognizer', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'pinchGestureRecognizer'); return nativeGetOwned(this, 'pinchGestureRecognizer'); },
  });
  Object.defineProperty(UIScrollView.prototype, 'directionalPressGestureRecognizer', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'directionalPressGestureRecognizer'); return nativeGetOwned(this, 'directionalPressGestureRecognizer'); },
  });
  Object.defineProperty(UIScrollView.prototype, 'allowsKeyboardScrolling', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'allowsKeyboardScrolling'); return nativeGet(this, 'allowsKeyboardScrolling'); },
    set(value) { requireNative(this, 'allowsKeyboardScrolling'); nativeSet(this, 'allowsKeyboardScrolling', toBoolean(value)); },
  });
  define(UIScrollView.prototype, 'setZoomScale', function setZoomScale(scale, options) {
    const o = options == null ? {} : options;
    nativeCall(this, 'setZoomScale:animated:', [toNumber(scale, 'setZoomScale'), toBoolean(o.animated)]);
  });
  define(UIScrollView.prototype, 'zoomToRect', function zoomToRect(rect, options) {
    const o = options == null ? {} : options;
    nativeCall(this, 'zoomToRect:animated:', [structArg(rect, RECT_FIELDS, 'zoomToRect'), toBoolean(o.animated)]);
  });
  define(UIScrollView.prototype, 'stopScrollingAndZooming', function stopScrollingAndZooming() {
    nativeCall(this, 'stopScrollingAndZooming', []);
  });

  // ---- UITextField：手写的类，这里只补它没有的成员 ----
  Object.defineProperty(UITextField.prototype, 'background', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'background'); return nativeGetOwned(this, 'background'); },
    set(value) { requireNative(this, 'background'); nativeSetOwned(this, 'background', value); },
  });
  Object.defineProperty(UITextField.prototype, 'disabledBackground', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'disabledBackground'); return nativeGetOwned(this, 'disabledBackground'); },
    set(value) { requireNative(this, 'disabledBackground'); nativeSetOwned(this, 'disabledBackground', value); },
  });
  Object.defineProperty(UITextField.prototype, 'allowsEditingTextAttributes', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'allowsEditingTextAttributes'); return nativeGet(this, 'allowsEditingTextAttributes'); },
    set(value) { requireNative(this, 'allowsEditingTextAttributes'); nativeSet(this, 'allowsEditingTextAttributes', toBoolean(value)); },
  });
  Object.defineProperty(UITextField.prototype, 'leftView', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'leftView'); return nativeGetOwned(this, 'leftView'); },
    set(value) { requireNative(this, 'leftView'); nativeSetOwned(this, 'leftView', value); },
  });
  Object.defineProperty(UITextField.prototype, 'leftViewMode', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'leftViewMode'); return nativeGet(this, 'leftViewMode'); },
    set(value) { requireNative(this, 'leftViewMode'); nativeSet(this, 'leftViewMode', value); },
  });
  Object.defineProperty(UITextField.prototype, 'rightView', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'rightView'); return nativeGetOwned(this, 'rightView'); },
    set(value) { requireNative(this, 'rightView'); nativeSetOwned(this, 'rightView', value); },
  });
  Object.defineProperty(UITextField.prototype, 'rightViewMode', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'rightViewMode'); return nativeGet(this, 'rightViewMode'); },
    set(value) { requireNative(this, 'rightViewMode'); nativeSet(this, 'rightViewMode', value); },
  });
  Object.defineProperty(UITextField.prototype, 'inputView', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'inputView'); return nativeGetOwned(this, 'inputView'); },
    set(value) { requireNative(this, 'inputView'); nativeSetOwned(this, 'inputView', value); },
  });
  Object.defineProperty(UITextField.prototype, 'clearsOnInsertion', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'clearsOnInsertion'); return nativeGet(this, 'clearsOnInsertion'); },
    set(value) { requireNative(this, 'clearsOnInsertion'); nativeSet(this, 'clearsOnInsertion', toBoolean(value)); },
  });
  Object.defineProperty(UITextField.prototype, 'smartQuotesType', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'smartQuotesType'); return nativeGet(this, 'smartQuotesType'); },
    set(value) { requireNative(this, 'smartQuotesType'); nativeSet(this, 'smartQuotesType', value); },
  });
  Object.defineProperty(UITextField.prototype, 'smartDashesType', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'smartDashesType'); return nativeGet(this, 'smartDashesType'); },
    set(value) { requireNative(this, 'smartDashesType'); nativeSet(this, 'smartDashesType', value); },
  });
  Object.defineProperty(UITextField.prototype, 'smartInsertDeleteType', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'smartInsertDeleteType'); return nativeGet(this, 'smartInsertDeleteType'); },
    set(value) { requireNative(this, 'smartInsertDeleteType'); nativeSet(this, 'smartInsertDeleteType', value); },
  });
  Object.defineProperty(UITextField.prototype, 'inlinePredictionType', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'inlinePredictionType'); return nativeGet(this, 'inlinePredictionType'); },
    set(value) { requireNative(this, 'inlinePredictionType'); nativeSet(this, 'inlinePredictionType', value); },
  });
  Object.defineProperty(UITextField.prototype, 'mathExpressionCompletionType', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'mathExpressionCompletionType'); return nativeGet(this, 'mathExpressionCompletionType'); },
    set(value) { requireNative(this, 'mathExpressionCompletionType'); nativeSet(this, 'mathExpressionCompletionType', value); },
  });
  Object.defineProperty(UITextField.prototype, 'writingToolsBehavior', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'writingToolsBehavior'); return nativeGet(this, 'writingToolsBehavior'); },
    set(value) { requireNative(this, 'writingToolsBehavior'); nativeSet(this, 'writingToolsBehavior', value); },
  });
  Object.defineProperty(UITextField.prototype, 'allowedWritingToolsResultOptions', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'allowedWritingToolsResultOptions'); return nativeGet(this, 'allowedWritingToolsResultOptions'); },
    set(value) { requireNative(this, 'allowedWritingToolsResultOptions'); nativeSet(this, 'allowedWritingToolsResultOptions', value); },
  });
  Object.defineProperty(UITextField.prototype, 'allowsNumberPadPopover', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'allowsNumberPadPopover'); return nativeGet(this, 'allowsNumberPadPopover'); },
    set(value) { requireNative(this, 'allowsNumberPadPopover'); nativeSet(this, 'allowsNumberPadPopover', toBoolean(value)); },
  });
  define(UITextField.prototype, 'borderRectForBounds', function borderRectForBounds(bounds) {
    return toRect(nativeCall(this, 'borderRectForBounds:', [structArg(bounds, RECT_FIELDS, 'borderRectForBounds')]));
  });
  define(UITextField.prototype, 'textRectForBounds', function textRectForBounds(bounds) {
    return toRect(nativeCall(this, 'textRectForBounds:', [structArg(bounds, RECT_FIELDS, 'textRectForBounds')]));
  });
  define(UITextField.prototype, 'placeholderRectForBounds', function placeholderRectForBounds(bounds) {
    return toRect(nativeCall(this, 'placeholderRectForBounds:', [structArg(bounds, RECT_FIELDS, 'placeholderRectForBounds')]));
  });
  define(UITextField.prototype, 'editingRectForBounds', function editingRectForBounds(bounds) {
    return toRect(nativeCall(this, 'editingRectForBounds:', [structArg(bounds, RECT_FIELDS, 'editingRectForBounds')]));
  });
  define(UITextField.prototype, 'clearButtonRectForBounds', function clearButtonRectForBounds(bounds) {
    return toRect(nativeCall(this, 'clearButtonRectForBounds:', [structArg(bounds, RECT_FIELDS, 'clearButtonRectForBounds')]));
  });
  define(UITextField.prototype, 'leftViewRectForBounds', function leftViewRectForBounds(bounds) {
    return toRect(nativeCall(this, 'leftViewRectForBounds:', [structArg(bounds, RECT_FIELDS, 'leftViewRectForBounds')]));
  });
  define(UITextField.prototype, 'rightViewRectForBounds', function rightViewRectForBounds(bounds) {
    return toRect(nativeCall(this, 'rightViewRectForBounds:', [structArg(bounds, RECT_FIELDS, 'rightViewRectForBounds')]));
  });

  // ---- UITextView：手写的类，这里只补它没有的成员 ----
  Object.defineProperty(UITextView.prototype, 'dataDetectorTypes', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'dataDetectorTypes'); return nativeGet(this, 'dataDetectorTypes'); },
    set(value) { requireNative(this, 'dataDetectorTypes'); nativeSet(this, 'dataDetectorTypes', value); },
  });
  Object.defineProperty(UITextView.prototype, 'allowsEditingTextAttributes', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'allowsEditingTextAttributes'); return nativeGet(this, 'allowsEditingTextAttributes'); },
    set(value) { requireNative(this, 'allowsEditingTextAttributes'); nativeSet(this, 'allowsEditingTextAttributes', toBoolean(value)); },
  });
  Object.defineProperty(UITextView.prototype, 'inputView', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'inputView'); return nativeGetOwned(this, 'inputView'); },
    set(value) { requireNative(this, 'inputView'); nativeSetOwned(this, 'inputView', value); },
  });
  Object.defineProperty(UITextView.prototype, 'clearsOnInsertion', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'clearsOnInsertion'); return nativeGet(this, 'clearsOnInsertion'); },
    set(value) { requireNative(this, 'clearsOnInsertion'); nativeSet(this, 'clearsOnInsertion', toBoolean(value)); },
  });
  Object.defineProperty(UITextView.prototype, 'usesStandardTextScaling', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'usesStandardTextScaling'); return nativeGet(this, 'usesStandardTextScaling'); },
    set(value) { requireNative(this, 'usesStandardTextScaling'); nativeSet(this, 'usesStandardTextScaling', toBoolean(value)); },
  });
  Object.defineProperty(UITextView.prototype, 'isFindInteractionEnabled', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'isFindInteractionEnabled'); return nativeGet(this, 'isFindInteractionEnabled'); },
    set(value) { requireNative(this, 'isFindInteractionEnabled'); nativeSet(this, 'isFindInteractionEnabled', toBoolean(value)); },
  });
  Object.defineProperty(UITextView.prototype, 'isWritingToolsActive', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'isWritingToolsActive'); return nativeGet(this, 'isWritingToolsActive'); },
  });
  Object.defineProperty(UITextView.prototype, 'writingToolsBehavior', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'writingToolsBehavior'); return nativeGet(this, 'writingToolsBehavior'); },
    set(value) { requireNative(this, 'writingToolsBehavior'); nativeSet(this, 'writingToolsBehavior', value); },
  });
  Object.defineProperty(UITextView.prototype, 'allowedWritingToolsResultOptions', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'allowedWritingToolsResultOptions'); return nativeGet(this, 'allowedWritingToolsResultOptions'); },
    set(value) { requireNative(this, 'allowedWritingToolsResultOptions'); nativeSet(this, 'allowedWritingToolsResultOptions', value); },
  });
  Object.defineProperty(UITextView.prototype, 'smartQuotesType', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'smartQuotesType'); return nativeGet(this, 'smartQuotesType'); },
    set(value) { requireNative(this, 'smartQuotesType'); nativeSet(this, 'smartQuotesType', value); },
  });
  Object.defineProperty(UITextView.prototype, 'smartDashesType', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'smartDashesType'); return nativeGet(this, 'smartDashesType'); },
    set(value) { requireNative(this, 'smartDashesType'); nativeSet(this, 'smartDashesType', value); },
  });
  Object.defineProperty(UITextView.prototype, 'smartInsertDeleteType', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'smartInsertDeleteType'); return nativeGet(this, 'smartInsertDeleteType'); },
    set(value) { requireNative(this, 'smartInsertDeleteType'); nativeSet(this, 'smartInsertDeleteType', value); },
  });
  Object.defineProperty(UITextView.prototype, 'inlinePredictionType', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'inlinePredictionType'); return nativeGet(this, 'inlinePredictionType'); },
    set(value) { requireNative(this, 'inlinePredictionType'); nativeSet(this, 'inlinePredictionType', value); },
  });
  Object.defineProperty(UITextView.prototype, 'mathExpressionCompletionType', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'mathExpressionCompletionType'); return nativeGet(this, 'mathExpressionCompletionType'); },
    set(value) { requireNative(this, 'mathExpressionCompletionType'); nativeSet(this, 'mathExpressionCompletionType', value); },
  });
  Object.defineProperty(UITextView.prototype, 'allowsNumberPadPopover', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'allowsNumberPadPopover'); return nativeGet(this, 'allowsNumberPadPopover'); },
    set(value) { requireNative(this, 'allowsNumberPadPopover'); nativeSet(this, 'allowsNumberPadPopover', toBoolean(value)); },
  });
})
