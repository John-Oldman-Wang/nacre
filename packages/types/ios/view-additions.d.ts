// 初稿是 bindgen 生成的（docs/internals/bindgen.md）。之后它是普通的手写文件：直接改，bindgen 不会再碰它。
//
// 成员的名字是照已定的写法从头文件套出来的，没写注释的成员用法看 Apple 的文档。

type UISemanticContentAttribute = 'unspecified' | 'playback' | 'spatial' | 'forceLeftToRight' | 'forceRightToLeft';

type UIUserInterfaceLayoutDirection = 'leftToRight' | 'rightToLeft';

type UIViewTintAdjustmentMode = 'automatic' | 'normal' | 'dimmed';

type UIScrollViewIndexDisplayMode = 'automatic' | 'alwaysHidden';

type UITextSmartQuotesType = 'default' | 'no' | 'yes';

type UITextSmartDashesType = 'default' | 'no' | 'yes';

type UITextSmartInsertDeleteType = 'default' | 'no' | 'yes';

type UITextInlinePredictionType = 'default' | 'no' | 'yes';

type UITextMathExpressionCompletionType = 'default' | 'no' | 'yes';

type UIWritingToolsBehavior = 'none' | 'default' | 'complete' | 'limited';

type UIViewAutoresizing = 'flexibleLeftMargin' | 'flexibleWidth' | 'flexibleRightMargin' | 'flexibleTopMargin' | 'flexibleHeight' | 'flexibleBottomMargin';

type UIWritingToolsResultOptions = 'plainText' | 'richText' | 'list' | 'table' | 'presentationIntent';

type UIDataDetectorTypes = 'phoneNumber' | 'link' | 'address' | 'calendarEvent' | 'shipmentTrackingNumber' | 'flightNumber' | 'lookupSuggestion' | 'money' | 'physicalValue';

interface UIView {
  readonly canBecomeFocused: boolean;
  readonly isFocused: boolean;
  focusGroupIdentifier: string | null;
  semanticContentAttribute: UISemanticContentAttribute;
  readonly effectiveUserInterfaceLayoutDirection: UIUserInterfaceLayoutDirection;
  contentScaleFactor: number;
  get anchorPoint(): CGPoint;
  set anchorPoint(value: CGPointLike);
  isMultipleTouchEnabled: boolean;
  isExclusiveTouch: boolean;
  autoresizesSubviews: boolean;
  autoresizingMask: UIViewAutoresizing[];
  clearsContextBeforeDrawing: boolean;
  maskView: UIView | null;
  get tintColor(): string | null;
  set tintColor(value: ColorValue | null);
  tintAdjustmentMode: UIViewTintAdjustmentMode;
  readonly alignmentRectInsets: UIEdgeInsets;
  readonly viewForFirstBaselineLayout: UIView | null;
  readonly viewForLastBaselineLayout: UIView | null;
  restorationIdentifier: string | null;
  readonly appliedContentSizeCategoryLimitsDescription: string | null;
  accessibilityIgnoresInvertColors: boolean;
  showsLargeContentViewer: boolean;
  largeContentTitle: string | null;
  largeContentImage: UIImage | null;
  scalesLargeContentImage: boolean;
  get largeContentImageInsets(): UIEdgeInsets;
  set largeContentImageInsets(value: UIEdgeInsetsLike);

  exchangeSubviewAtIndex(index1: number, options: { withSubviewAtIndex: number }): void;
  setNeedsUpdateProperties(): void;
  updatePropertiesIfNeeded(): void;
  setNeedsDisplayInRect(rect: CGRectLike): void;
  updateConstraintsIfNeeded(): void;
  needsUpdateConstraints(): boolean;
  setNeedsUpdateConstraints(): void;
  alignmentRectForFrame(frame: CGRectLike): CGRect;
  frameForAlignmentRect(alignmentRect: CGRectLike): CGRect;
  snapshotViewAfterScreenUpdates(afterUpdates: boolean): UIView | null;
  resizableSnapshotViewFromRect(rect: CGRectLike, options: { afterScreenUpdates: boolean; withCapInsets: UIEdgeInsetsLike }): UIView | null;
  updateTraitsIfNeeded(): void;
  effectiveRadiusForCorner(corner: UIRectCorner[]): number;
}

interface UIScrollView {
  get contentAlignmentPoint(): CGPoint;
  set contentAlignmentPoint(value: CGPointLike);
  bouncesHorizontally: boolean;
  bouncesVertically: boolean;
  transfersHorizontalScrollingToParent: boolean;
  transfersVerticalScrollingToParent: boolean;
  get scrollIndicatorInsets(): UIEdgeInsets;
  set scrollIndicatorInsets(value: UIEdgeInsetsLike);
  indexDisplayMode: UIScrollViewIndexDisplayMode;
  minimumZoomScale: number;
  maximumZoomScale: number;
  zoomScale: number;
  bouncesZoom: boolean;
  readonly isZooming: boolean;
  readonly isZoomBouncing: boolean;
  readonly isZoomAnimating: boolean;
  readonly panGestureRecognizer: UIPanGestureRecognizer | null;
  readonly pinchGestureRecognizer: UIPinchGestureRecognizer | null;
  readonly directionalPressGestureRecognizer: UIGestureRecognizer | null;
  allowsKeyboardScrolling: boolean;

  setZoomScale(scale: number, options?: { animated?: boolean }): void;
  zoomToRect(rect: CGRectLike, options?: { animated?: boolean }): void;
  stopScrollingAndZooming(): void;
}

interface UITextField {
  background: UIImage | null;
  disabledBackground: UIImage | null;
  allowsEditingTextAttributes: boolean;
  leftView: UIView | null;
  leftViewMode: UITextFieldViewMode;
  rightView: UIView | null;
  rightViewMode: UITextFieldViewMode;
  inputView: UIView | null;
  clearsOnInsertion: boolean;
  smartQuotesType: UITextSmartQuotesType;
  smartDashesType: UITextSmartDashesType;
  smartInsertDeleteType: UITextSmartInsertDeleteType;
  inlinePredictionType: UITextInlinePredictionType;
  mathExpressionCompletionType: UITextMathExpressionCompletionType;
  writingToolsBehavior: UIWritingToolsBehavior;
  allowedWritingToolsResultOptions: UIWritingToolsResultOptions[];
  allowsNumberPadPopover: boolean;

  borderRectForBounds(bounds: CGRectLike): CGRect;
  textRectForBounds(bounds: CGRectLike): CGRect;
  placeholderRectForBounds(bounds: CGRectLike): CGRect;
  editingRectForBounds(bounds: CGRectLike): CGRect;
  clearButtonRectForBounds(bounds: CGRectLike): CGRect;
  leftViewRectForBounds(bounds: CGRectLike): CGRect;
  rightViewRectForBounds(bounds: CGRectLike): CGRect;
}

interface UITextView {
  dataDetectorTypes: UIDataDetectorTypes[];
  allowsEditingTextAttributes: boolean;
  inputView: UIView | null;
  clearsOnInsertion: boolean;
  usesStandardTextScaling: boolean;
  isFindInteractionEnabled: boolean;
  readonly isWritingToolsActive: boolean;
  writingToolsBehavior: UIWritingToolsBehavior;
  allowedWritingToolsResultOptions: UIWritingToolsResultOptions[];
  smartQuotesType: UITextSmartQuotesType;
  smartDashesType: UITextSmartDashesType;
  smartInsertDeleteType: UITextSmartInsertDeleteType;
  inlinePredictionType: UITextInlinePredictionType;
  mathExpressionCompletionType: UITextMathExpressionCompletionType;
  allowsNumberPadPopover: boolean;
}
