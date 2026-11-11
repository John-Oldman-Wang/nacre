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

/**
 * 渐变的走向。`axial` 是一条直线上的渐变，`radial` 从中心向外，
 * `conic` 绕中心转一圈。`startPoint` / `endPoint` 在三种里的含义不一样。
 */
type CAGradientLayerType = 'axial' | 'radial' | 'conic';

/**
 * 填充规则。`nonZero`（默认）按绕向加减，不为零就填；`evenOdd` 数穿过
 * 次数，奇数才填。只在路径自交或者嵌套时不一样。
 */
type CAShapeLayerFillRule = 'nonZero' | 'evenOdd';

/**
 * 线头。`butt`（默认）齐根切断，`round` 加半圆，`square` 加半个方块——
 * 后两种会让线比路径长出半个线宽。
 */
type CAShapeLayerLineCap = 'butt' | 'round' | 'square';

/** 拐角。`miter`（默认）尖角，太尖时按 `miterLimit` 削平；`round` 圆角；`bevel` 直接削平。 */
type CAShapeLayerLineJoin = 'miter' | 'round' | 'bevel';

/**
 * 圆角矩形要圆哪几个角。位掩码，所以用字符串数组。
 *
 * **没有 `allCorners`**：它在 ObjC 里的值是 `~0`，和「四个位或起来」不是
 * 同一个数，往返不回来。四个角全圆就四个名字都写。
 */
type UIRectCorner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

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
/** 模态页怎么呈现。默认 `'automatic'`，在 iPhone 上落到 `'pageSheet'`。 */
type UIModalPresentationStyle =
  | 'automatic' | 'fullScreen' | 'pageSheet' | 'formSheet'
  | 'currentContext' | 'overFullScreen' | 'overCurrentContext'
  | 'popover' | 'custom' | 'none';

/** 模态页进出的动画。 */
type UIModalTransitionStyle =
  | 'coverVertical' | 'flipHorizontal' | 'crossDissolve' | 'partialCurl';

/** 模态页被关掉时的三条通知。 */
type UIPresentationEventType = 'willdismiss' | 'diddismiss' | 'dismissattempted';

/** 系统预置的导航条按钮。 */
type UIBarButtonSystemItem =
  | 'done' | 'cancel' | 'edit' | 'save' | 'add'
  | 'flexibleSpace' | 'fixedSpace' | 'compose' | 'reply' | 'action'
  | 'organize' | 'bookmarks' | 'search' | 'refresh' | 'stop'
  | 'camera' | 'trash' | 'play' | 'pause' | 'rewind' | 'fastForward'
  | 'undo' | 'redo' | 'pageCurl' | 'close' | 'writingTools';

/**
 * 导航条按钮的样式。
 *
 * `'done'` 和 `'prominent'` 是**同一个值**（iOS 26 的头文件里
 * `UIBarButtonItemStyleDone = UIBarButtonItemStyleProminent`），两个名字都
 * 写得进去，但**读出来永远是 `'prominent'`**。和 `UIStackViewAlignment`
 * 的 `top`/`leading` 同一回事。
 */
type UIBarButtonItemStyle = 'plain' | 'prominent' | 'done';

/** 导航条按钮上能监听的事件。沿用 UIButton 那个名字。 */
type UIBarButtonItemEventType = 'primaryActionTriggered';

/** 导航控制器上能监听的事件。 */
type UINavigationControllerEventType = 'willshow' | 'didshow';

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
