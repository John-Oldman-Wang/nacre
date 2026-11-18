<!-- 初稿是 bindgen 生成的（docs/internals/bindgen.md）。之后它是普通的手写文件：直接改，bindgen 不会再碰它。 -->

# 补上的成员：UIView、UIScrollView、UITextField、UITextView

← [API 文档](README.md)

这一页现在只是一张清单：名字、类型、对应的 selector。成员的名字是按[原生类](native-classes.md)里那几条写法从 iOS 的头文件套出来的，所以能照着对回 Apple 的文档，用法也照 Apple 的文档。

> **注意**：这一页还没有按[文档写法](../writing-guide.md)写：没有例子，没有效果，默认值只量过一部分。验过的是每个属性读得出来、类型对、写回读到的值不出错；方法大多没有在模拟器上调过。要用哪个成员，先在模拟器上试。

## UIView

这里列的是后补的成员。它原有的成员看它自己的那一页。

| 属性 | 类型 | |
| --- | --- | --- |
| `canBecomeFocused` | `boolean` | 只读 |
| `isFocused` | `boolean` | 只读 |
| `focusGroupIdentifier` | `string \| null` | 可读可写 |
| `semanticContentAttribute` | `UISemanticContentAttribute` | 可读可写 |
| `effectiveUserInterfaceLayoutDirection` | `UIUserInterfaceLayoutDirection` | 只读 |
| `contentScaleFactor` | `number` | 可读可写 |
| `anchorPoint` | `CGPoint` | 可读可写 |
| `isMultipleTouchEnabled` | `boolean` | 可读可写 |
| `isExclusiveTouch` | `boolean` | 可读可写 |
| `autoresizesSubviews` | `boolean` | 可读可写 |
| `autoresizingMask` | `UIViewAutoresizing[]` | 可读可写 |
| `clearsContextBeforeDrawing` | `boolean` | 可读可写 |
| `maskView` | `UIView \| null` | 可读可写 |
| `tintColor` | `string \| null` | 可读可写 |
| `tintAdjustmentMode` | `UIViewTintAdjustmentMode` | 可读可写 |
| `alignmentRectInsets` | `UIEdgeInsets` | 只读 |
| `viewForFirstBaselineLayout` | `UIView \| null` | 只读 |
| `viewForLastBaselineLayout` | `UIView \| null` | 只读 |
| `restorationIdentifier` | `string \| null` | 可读可写 |
| `appliedContentSizeCategoryLimitsDescription` | `string \| null` | 只读 |
| `accessibilityIgnoresInvertColors` | `boolean` | 可读可写 |
| `showsLargeContentViewer` | `boolean` | 可读可写 |
| `largeContentTitle` | `string \| null` | 可读可写 |
| `largeContentImage` | `UIImage \| null` | 可读可写 |
| `scalesLargeContentImage` | `boolean` | 可读可写 |
| `largeContentImageInsets` | `UIEdgeInsets` | 可读可写 |

| 方法 | 返回 | 对应的 selector |
| --- | --- | --- |
| `exchangeSubviewAtIndex(index1, { withSubviewAtIndex })` | 没有返回值 | `exchangeSubviewAtIndex:withSubviewAtIndex:` |
| `setNeedsUpdateProperties()` | 没有返回值 | `setNeedsUpdateProperties` |
| `updatePropertiesIfNeeded()` | 没有返回值 | `updatePropertiesIfNeeded` |
| `setNeedsDisplayInRect(rect)` | 没有返回值 | `setNeedsDisplayInRect:` |
| `updateConstraintsIfNeeded()` | 没有返回值 | `updateConstraintsIfNeeded` |
| `needsUpdateConstraints()` | 返回 `boolean` | `needsUpdateConstraints` |
| `setNeedsUpdateConstraints()` | 没有返回值 | `setNeedsUpdateConstraints` |
| `alignmentRectForFrame(frame)` | 返回 `CGRect` | `alignmentRectForFrame:` |
| `frameForAlignmentRect(alignmentRect)` | 返回 `CGRect` | `frameForAlignmentRect:` |
| `snapshotViewAfterScreenUpdates(afterUpdates)` | 返回 `UIView \| null` | `snapshotViewAfterScreenUpdates:` |
| `resizableSnapshotViewFromRect(rect, { afterScreenUpdates, withCapInsets })` | 返回 `UIView \| null` | `resizableSnapshotViewFromRect:afterScreenUpdates:withCapInsets:` |
| `updateTraitsIfNeeded()` | 没有返回值 | `updateTraitsIfNeeded` |
| `effectiveRadiusForCorner(corner)` | 返回 `number` | `effectiveRadiusForCorner:` |

## UIScrollView

这里列的是后补的成员。它原有的成员看它自己的那一页。

| 属性 | 类型 | |
| --- | --- | --- |
| `contentAlignmentPoint` | `CGPoint` | 可读可写 |
| `bouncesHorizontally` | `boolean` | 可读可写 |
| `bouncesVertically` | `boolean` | 可读可写 |
| `transfersHorizontalScrollingToParent` | `boolean` | 可读可写 |
| `transfersVerticalScrollingToParent` | `boolean` | 可读可写 |
| `scrollIndicatorInsets` | `UIEdgeInsets` | 可读可写 |
| `indexDisplayMode` | `UIScrollViewIndexDisplayMode` | 可读可写 |
| `minimumZoomScale` | `number` | 可读可写 |
| `maximumZoomScale` | `number` | 可读可写 |
| `zoomScale` | `number` | 可读可写 |
| `bouncesZoom` | `boolean` | 可读可写 |
| `isZooming` | `boolean` | 只读 |
| `isZoomBouncing` | `boolean` | 只读 |
| `isZoomAnimating` | `boolean` | 只读 |
| `panGestureRecognizer` | `UIPanGestureRecognizer \| null` | 只读 |
| `pinchGestureRecognizer` | `UIPinchGestureRecognizer \| null` | 只读 |
| `directionalPressGestureRecognizer` | `UIGestureRecognizer \| null` | 只读 |
| `allowsKeyboardScrolling` | `boolean` | 可读可写 |

| 方法 | 返回 | 对应的 selector |
| --- | --- | --- |
| `setZoomScale(scale, { animated? })` | 没有返回值 | `setZoomScale:animated:` |
| `zoomToRect(rect, { animated? })` | 没有返回值 | `zoomToRect:animated:` |
| `stopScrollingAndZooming()` | 没有返回值 | `stopScrollingAndZooming` |

## UITextField

这里列的是后补的成员。它原有的成员看它自己的那一页。

| 属性 | 类型 | |
| --- | --- | --- |
| `background` | `UIImage \| null` | 可读可写 |
| `disabledBackground` | `UIImage \| null` | 可读可写 |
| `allowsEditingTextAttributes` | `boolean` | 可读可写 |
| `leftView` | `UIView \| null` | 可读可写 |
| `leftViewMode` | `UITextFieldViewMode` | 可读可写 |
| `rightView` | `UIView \| null` | 可读可写 |
| `rightViewMode` | `UITextFieldViewMode` | 可读可写 |
| `inputView` | `UIView \| null` | 可读可写 |
| `clearsOnInsertion` | `boolean` | 可读可写 |
| `smartQuotesType` | `UITextSmartQuotesType` | 可读可写 |
| `smartDashesType` | `UITextSmartDashesType` | 可读可写 |
| `smartInsertDeleteType` | `UITextSmartInsertDeleteType` | 可读可写 |
| `inlinePredictionType` | `UITextInlinePredictionType` | 可读可写 |
| `mathExpressionCompletionType` | `UITextMathExpressionCompletionType` | 可读可写 |
| `writingToolsBehavior` | `UIWritingToolsBehavior` | 可读可写 |
| `allowedWritingToolsResultOptions` | `UIWritingToolsResultOptions[]` | 可读可写 |
| `allowsNumberPadPopover` | `boolean` | 可读可写 |

| 方法 | 返回 | 对应的 selector |
| --- | --- | --- |
| `borderRectForBounds(bounds)` | 返回 `CGRect` | `borderRectForBounds:` |
| `textRectForBounds(bounds)` | 返回 `CGRect` | `textRectForBounds:` |
| `placeholderRectForBounds(bounds)` | 返回 `CGRect` | `placeholderRectForBounds:` |
| `editingRectForBounds(bounds)` | 返回 `CGRect` | `editingRectForBounds:` |
| `clearButtonRectForBounds(bounds)` | 返回 `CGRect` | `clearButtonRectForBounds:` |
| `leftViewRectForBounds(bounds)` | 返回 `CGRect` | `leftViewRectForBounds:` |
| `rightViewRectForBounds(bounds)` | 返回 `CGRect` | `rightViewRectForBounds:` |

## UITextView

这里列的是后补的成员。它原有的成员看它自己的那一页。

| 属性 | 类型 | |
| --- | --- | --- |
| `dataDetectorTypes` | `UIDataDetectorTypes[]` | 可读可写 |
| `allowsEditingTextAttributes` | `boolean` | 可读可写 |
| `inputView` | `UIView \| null` | 可读可写 |
| `clearsOnInsertion` | `boolean` | 可读可写 |
| `usesStandardTextScaling` | `boolean` | 可读可写 |
| `isFindInteractionEnabled` | `boolean` | 可读可写 |
| `isWritingToolsActive` | `boolean` | 只读 |
| `writingToolsBehavior` | `UIWritingToolsBehavior` | 可读可写 |
| `allowedWritingToolsResultOptions` | `UIWritingToolsResultOptions[]` | 可读可写 |
| `smartQuotesType` | `UITextSmartQuotesType` | 可读可写 |
| `smartDashesType` | `UITextSmartDashesType` | 可读可写 |
| `smartInsertDeleteType` | `UITextSmartInsertDeleteType` | 可读可写 |
| `inlinePredictionType` | `UITextInlinePredictionType` | 可读可写 |
| `mathExpressionCompletionType` | `UITextMathExpressionCompletionType` | 可读可写 |
| `allowsNumberPadPopover` | `boolean` | 可读可写 |
