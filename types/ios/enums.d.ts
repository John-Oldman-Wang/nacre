// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// iOS 的枚举。一律用字符串，名字是 ObjC 常量去掉类型前缀、首字母小写。
// 写错了抛 TypeError，错误信息里列着可选值。

// ---------------------------------------------------------------------------
// 枚举
// ---------------------------------------------------------------------------
//
// 写错了会抛 TypeError，错误信息里列着可选值。名字到数值的映射在原生层，
// 因为数值不稳定——NSTextAlignment 的值随 ABI 变（iOS 上 Center 是 1，
// macOS 上是 2），在 JS 里按下标映射换个平台就全错。

type NSTextAlignment = 'left' | 'center' | 'right' | 'justified' | 'natural';

type NSLineBreakMode =
  | 'byWordWrapping'
  | 'byCharWrapping'
  | 'byClipping'
  | 'byTruncatingHead'
  | 'byTruncatingTail'
  | 'byTruncatingMiddle';

type UIViewContentMode =
  | 'scaleToFill'
  | 'scaleAspectFit'
  | 'scaleAspectFill'
  | 'redraw'
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight';

type UIBaselineAdjustment = 'alignBaselines' | 'alignCenters' | 'none';

/** 图片的方向标记。相机常常横着存、靠这个转正，所以 size 已经反映了方向。 */
type UIImageOrientation =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'upMirrored'
  | 'downMirrored'
  | 'leftMirrored'
  | 'rightMirrored';

/** alwaysTemplate：忽略原图颜色，整张按 tintColor 上色。SF Symbols 默认如此。 */
type UIImageRenderingMode = 'automatic' | 'alwaysOriginal' | 'alwaysTemplate';

/** 九宫格中间那块怎么填。 */
type UIImageResizingMode = 'tile' | 'stretch';

/** 圆角的曲线。continuous 是 Apple 自己在用的超椭圆圆角。 */
type CALayerCornerCurve = 'circular' | 'continuous';

/**
 * 哪几个角。位掩码，所以用字符串数组。
 * UIKit 的 y 轴朝下，minY 是上边——minXMinY 就是左上角。
 */
type CACornerMask = 'minXMinY' | 'maxXMinY' | 'minXMaxY' | 'maxXMaxY';

type NSLayoutRelation = 'lessThanOrEqual' | 'equal' | 'greaterThanOrEqual';

type UILayoutConstraintAxis = 'horizontal' | 'vertical';

type NSLayoutAttribute =
  | 'left' | 'right' | 'top' | 'bottom'
  | 'leading' | 'trailing'
  | 'width' | 'height'
  | 'centerX' | 'centerY'
  | 'lastBaseline' | 'firstBaseline'
  | 'leftMargin' | 'rightMargin' | 'topMargin' | 'bottomMargin'
  | 'leadingMargin' | 'trailingMargin'
  | 'centerXWithinMargins' | 'centerYWithinMargins'
  | 'notAnAttribute';

/** 七个具名值。中间的值（749 之类）没有名字，所以写的时候也接受数字。 */
/** 滚动指示条的外观。`'default'` 跟随浅色/深色自动切换。 */
type UIScrollViewIndicatorStyle = 'default' | 'black' | 'white';

/** `contentInset` 要不要把安全区算进去。 */
type UIScrollViewContentInsetAdjustmentBehavior =
  | 'automatic'
  | 'scrollableAxes'
  | 'never'
  | 'always';

/** 减速快慢：一个数字，或两个具名值。`'normal'` 是 0.998、`'fast'` 是 0.99。 */
type UIScrollViewDecelerationRate = number | 'normal' | 'fast';

/** 滚动事件。全小写，和 scene / window 的事件一致。 */
type UIScrollViewEventType =
  | 'scroll'
  | 'dragbegin'
  | 'dragend'
  | 'deceleratebegin'
  | 'decelerateend'
  | 'scrollanimationend'
  | 'scrolltotop'
  | 'adjustedcontentinsetchange';

/** UIStackView 沿轴的分配方式。 */
type UIStackViewDistribution =
  | 'fill'
  | 'fillEqually'
  | 'fillProportionally'
  | 'equalSpacing'
  | 'equalCentering';

/**
 * UIStackView 垂直于轴的对齐。
 *
 * `'top'` 和 `'leading'` 是**同一个值**，`'bottom'` 和 `'trailing'` 也是——
 * UIKit 自己就是这么定义的（`UIStackViewAlignmentTop = ...Leading`）。两个
 * 名字都写得进去，但**读出来永远是 `'leading'` / `'trailing'`**。
 */
type UIStackViewAlignment =
  | 'fill'
  | 'leading'
  | 'top'
  | 'firstBaseline'
  | 'center'
  | 'trailing'
  | 'bottom'
  | 'lastBaseline';

/** 间距：一个数字，或 `'system'` 表示系统标准间距。 */
type UIStackViewSpacing = number | 'system';

/** 自定义间距比 spacing 多一个 `'default'`，表示撤回、回到 spacing。 */
type UIStackViewCustomSpacing = UIStackViewSpacing | 'default';

type UILayoutPriorityName =
  | 'required'                   // 1000
  | 'defaultHigh'                // 750
  | 'dragThatCanResizeScene'     // 510
  | 'sceneSizeStayPut'           // 500
  | 'dragThatCannotResizeScene'  // 490
  | 'defaultLow'                 // 250
  | 'fittingSizeLevel';          // 50

/** 写入接受名字或数字；读出来永远是数字。 */
type UILayoutPriorityLike = UILayoutPriorityName | number;

/** ObjC 里是 CGFloat 常量不是枚举，JS 侧一视同仁用字符串。 */
type UIFontWeight =
  | 'ultraLight'
  | 'thin'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'heavy'
  | 'black';

/** ObjC 里是 NSString 常量。按字号从大到小排。 */
type UIFontTextStyle =
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'subheadline'
  | 'body'
  | 'callout'
  | 'footnote'
  | 'caption1'
  | 'caption2';

type UISceneActivationState =
  | 'unattached'
  | 'foregroundActive'
  | 'foregroundInactive'
  | 'background'
  | 'unknown';
