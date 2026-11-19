---
type: reference
native: UIView
status: partial
---

# `UIView`

**`UIView`** 表示屏幕上的一块矩形区域，称为视图。视图做三件事：显示内容（底色，以及子类提供的文字、图片），包含别的视图，接收触摸。按钮、文字、图片、滚动区域都是 `UIView` 的子类，这一页的成员在所有视图上都能用。

视图组成一棵树。每个视图最多有一个父视图，可以有任意多个子视图，树的根是窗口（[`UIWindow`](ui-window.md)）。视图连到窗口之后才显示在屏幕上；没有连到窗口的视图可以照常创建、设置属性、加子视图，只是屏幕上看不到。

视图的位置和大小不会自动得出，要由 App 的代码给出：直接写一个矩形（`frame`），或者写约束让系统计算。长度的单位是点（pt），一个点在屏幕上对应 2 × 2 或 3 × 3 个像素，见[单位](units.md)。

外观用属性设置，比如 `backgroundColor`、`alpha`。圆角、边框、阴影在视图的图层 `view.layer` 上，见 [`CALayer`](ca-layer.md)。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → `UIView`

`UIView` 的子类：[`UIWindow`](ui-window.md)、[`UILabel`](ui-label.md)、[`UIImageView`](ui-image.md)、[`UIControl`](ui-control.md)（[`UIButton`](ui-button.md)、[`UITextField`](ui-text-field.md)）、[`UIScrollView`](ui-scroll-view.md)、[`UIStackView`](ui-stack-view.md)。

怎么创建视图、摆放、隐藏、移除，见指南[在屏幕上摆放视图](../guides/views.md)；动画见[让视图动起来](../guides/view-animations.md)；约束见[用约束排版](../guides/auto-layout.md)。

## 构造函数

[`UIView()`](ui-view/constructor.md)

创建一个视图。新视图的 `frame` 是 `(0, 0, 0, 0)`，没有底色，没有父视图。`UIView` 不能被继承。

## 静态方法

| 方法 | 说明 |
| --- | --- |
| [`UIView.animateWithDuration()`](ui-view/animatewithduration.md) | 带动画地改视图的属性。返回 Promise，动画结束时兑现 |
| [`UIView.performWithoutAnimation()`](ui-view/performwithoutanimation.md) | 执行一段代码，里面的改动不带动画 |

## 实例属性

还继承 `UIResponder` 的 `isFirstResponder`、`canBecomeFirstResponder`，说明见[输入框和键盘](ui-text-field.md)。

位置和大小。单位都是 [pt](units.md)：

| 属性 | 说明 |
| --- | --- |
| [`frame`](ui-view/frame.md) | 在父视图坐标系里的位置和大小 |
| [`bounds`](ui-view/bounds.md) | 在自己坐标系里的矩形 |
| [`center`](ui-view/center.md) | 中心点在父视图坐标系里的位置 |
| [`transform`](ui-view/transform.md) | 二维仿射变换 |
| [`anchorPoint`](ui-view/anchorpoint.md) | 变换绕的那个点，用比例表示 |
| [`safeAreaInsets`](ui-view/safeareainsets.md) <small>只读</small> | 安全区的四条边到视图四条边的距离 |
| [`directionalLayoutMargins`](ui-view/directionallayoutmargins.md) | 内边距，左右按文字方向区分 |
| [`layoutMargins`](ui-view/layoutmargins.md) | 同一份内边距，左右固定 |
| [`insetsLayoutMarginsFromSafeArea`](ui-view/insetslayoutmarginsfromsafearea.md) | 内边距是否加上安全区 |
| [`preservesSuperviewLayoutMargins`](ui-view/preservessuperviewlayoutmargins.md) | 父视图的内边距大时是否采用父视图的 |
| [`intrinsicContentSize`](ui-view/intrinsiccontentsize.md) <small>只读</small> | 按内容算出的固有大小 |
| [`alignmentRectInsets`](ui-view/alignmentrectinsets.md) <small>只读</small> | 对齐矩形比 `frame` 往里缩了多少 |
| [`contentScaleFactor`](ui-view/contentscalefactor.md) | 1 pt 对应几个像素 |
| [`autoresizingMask`](ui-view/autoresizingmask.md) | 父视图大小变化时，按 `frame` 定位的视图怎么跟着变 |
| [`autoresizesSubviews`](ui-view/autoresizessubviews.md) | 大小变化时是否调整子视图 |

视图树：

| 属性 | 说明 |
| --- | --- |
| [`superview`](ui-view/superview.md) <small>只读</small> | 父视图 |
| [`subviews`](ui-view/subviews.md) <small>只读</small> | 子视图，按绘制顺序 |
| [`window`](ui-view/window.md) <small>只读</small> | 所在的窗口 |
| [`tag`](ui-view/tag.md) | 自己定的整数编号 |

外观：

| 属性 | 说明 |
| --- | --- |
| [`backgroundColor`](ui-view/backgroundcolor.md) | 底色 |
| [`alpha`](ui-view/alpha.md) | 不透明度，0 到 1 |
| [`isHidden`](ui-view/ishidden.md) | 是否隐藏 |
| [`clipsToBounds`](ui-view/clipstobounds.md) | 是否裁掉超出范围的子视图 |
| [`isOpaque`](ui-view/isopaque.md) | 给系统的绘制提示：内容是否完全不透明 |
| [`contentMode`](ui-view/contentmode.md) | 内容和视图大小不一致时怎么摆放 |
| [`layer`](ui-view/layer.md) <small>只读</small> | 视图的图层：圆角、边框、阴影 |
| [`maskView`](ui-view/maskview.md) | 遮罩视图 |
| [`tintColor`](ui-view/tintcolor.md) | 强调色 |
| [`tintAdjustmentMode`](ui-view/tintadjustmentmode.md) | 强调色正常显示还是变暗 |
| [`clearsContextBeforeDrawing`](ui-view/clearscontextbeforedrawing.md) | 重新绘制前是否先清掉原来的内容 |

外观特征和书写方向：

| 属性 | 说明 |
| --- | --- |
| [`traitCollection`](ui-view/traitcollection.md) <small>只读</small> | 所处环境的外观特征：深浅色、屏幕倍数、文字大小 |
| [`overrideUserInterfaceStyle`](ui-view/overrideuserinterfacestyle.md) | 强制用浅色或深色 |
| [`semanticContentAttribute`](ui-view/semanticcontentattribute.md) | 从右往左的语言里要不要左右翻转 |
| [`effectiveUserInterfaceLayoutDirection`](ui-view/effectiveuserinterfacelayoutdirection.md) <small>只读</small> | 实际使用的书写方向 |
| [`appliedContentSizeCategoryLimitsDescription`](ui-view/appliedcontentsizecategorylimitsdescription.md) <small>只读</small> | 调试用：哪些文字大小被限制了 |

触摸和焦点：

| 属性 | 说明 |
| --- | --- |
| [`isUserInteractionEnabled`](ui-view/isuserinteractionenabled.md) | 是否接收触摸 |
| [`isMultipleTouchEnabled`](ui-view/ismultipletouchenabled.md) | 是否接收多根手指 |
| [`isExclusiveTouch`](ui-view/isexclusivetouch.md) | 被触摸时是否独占触摸 |
| [`gestureRecognizers`](ui-view/gesturerecognizers.md) <small>只读</small> | 视图上的手势识别器 |
| [`canBecomeFocused`](ui-view/canbecomefocused.md) <small>只读</small> | 能不能得到焦点 |
| [`isFocused`](ui-view/isfocused.md) <small>只读</small> | 此刻是否有焦点 |
| [`focusGroupIdentifier`](ui-view/focusgroupidentifier.md) | 焦点分组的名字 |

约束（Auto Layout）。锚点用来建约束，见 [`NSLayoutAnchor`](ns-layout-anchor.md)：

| 属性 | 说明 |
| --- | --- |
| [`translatesAutoresizingMaskIntoConstraints`](ui-view/translatesautoresizingmaskintoconstraints.md) | 按 `frame` 定位还是由约束定位。用约束的视图必须设成 `false` |
| [`leadingAnchor`](ui-view/leadinganchor.md) <small>只读</small> | 起始边 |
| [`trailingAnchor`](ui-view/trailinganchor.md) <small>只读</small> | 结束边 |
| [`leftAnchor`](ui-view/leftanchor.md) <small>只读</small> | 左边 |
| [`rightAnchor`](ui-view/rightanchor.md) <small>只读</small> | 右边 |
| [`centerXAnchor`](ui-view/centerxanchor.md) <small>只读</small> | 水平中心线 |
| [`topAnchor`](ui-view/topanchor.md) <small>只读</small> | 上边 |
| [`bottomAnchor`](ui-view/bottomanchor.md) <small>只读</small> | 下边 |
| [`centerYAnchor`](ui-view/centeryanchor.md) <small>只读</small> | 垂直中心线 |
| [`firstBaselineAnchor`](ui-view/firstbaselineanchor.md) <small>只读</small> | 第一行文字的基线 |
| [`lastBaselineAnchor`](ui-view/lastbaselineanchor.md) <small>只读</small> | 最后一行文字的基线 |
| [`widthAnchor`](ui-view/widthanchor.md) <small>只读</small> | 宽度 |
| [`heightAnchor`](ui-view/heightanchor.md) <small>只读</small> | 高度 |
| [`safeAreaLayoutGuide`](ui-view/safearealayoutguide.md) <small>只读</small> | 代表安全区的 layout guide |
| [`layoutMarginsGuide`](ui-view/layoutmarginsguide.md) <small>只读</small> | 按内边距缩进之后的区域 |
| [`readableContentGuide`](ui-view/readablecontentguide.md) <small>只读</small> | 适合阅读长文字的宽度范围 |
| [`keyboardLayoutGuide`](ui-view/keyboardlayoutguide.md) <small>只读</small> | 键盘占的区域 |
| [`layoutGuides`](ui-view/layoutguides.md) <small>只读</small> | 自己加上的 layout guide |
| [`constraints`](ui-view/constraints.md) <small>只读</small> | 存放在这个视图上的约束 |
| [`hasAmbiguousLayout`](ui-view/hasambiguouslayout.md) <small>只读</small> | 约束够不够 |
| [`viewForFirstBaselineLayout`](ui-view/viewforfirstbaselinelayout.md) <small>只读</small> | 第一条基线取自哪个视图 |
| [`viewForLastBaselineLayout`](ui-view/viewforlastbaselinelayout.md) <small>只读</small> | 最后一条基线取自哪个视图 |

辅助功能和状态恢复：

| 属性 | 说明 |
| --- | --- |
| [`accessibilityIgnoresInvertColors`](ui-view/accessibilityignoresinvertcolors.md) | 智能反转颜色时是否保持原样 |
| [`showsLargeContentViewer`](ui-view/showslargecontentviewer.md) | 长按时是否显示放大的版本 |
| [`largeContentTitle`](ui-view/largecontenttitle.md) | 放大显示时的文字 |
| [`largeContentImage`](ui-view/largecontentimage.md) | 放大显示时的图片 |
| [`scalesLargeContentImage`](ui-view/scaleslargecontentimage.md) | 放大显示时是否放大图片 |
| [`largeContentImageInsets`](ui-view/largecontentimageinsets.md) | 放大显示时图片四周的边距 |
| [`restorationIdentifier`](ui-view/restorationidentifier.md) | 系统恢复界面状态时认出它的名字 |

## 实例方法

还继承 `UIResponder` 的 `becomeFirstResponder()`、`resignFirstResponder()`，说明见[输入框和键盘](ui-text-field.md)。

视图树：

| 方法 | 说明 |
| --- | --- |
| [`addSubview()`](ui-view/addsubview.md) | 加为子视图，放在最上层 |
| [`insertSubview()`](ui-view/insertsubview.md) | 加为子视图，放在指定的位置 |
| [`removeFromSuperview()`](ui-view/removefromsuperview.md) | 从父视图里移除 |
| [`bringSubviewToFront()`](ui-view/bringsubviewtofront.md) | 把子视图调到最上层 |
| [`sendSubviewToBack()`](ui-view/sendsubviewtoback.md) | 把子视图调到最下层 |
| [`exchangeSubviewAtIndex()`](ui-view/exchangesubviewatindex.md) | 交换两个子视图的位置 |
| [`isDescendantOfView()`](ui-view/isdescendantofview.md) | 是不是另一个视图的后代 |
| [`viewWithTag()`](ui-view/viewwithtag.md) | 按编号找视图 |

几何：

| 方法 | 说明 |
| --- | --- |
| [`sizeThatFits()`](ui-view/sizethatfits.md) | 显示全部内容需要多大 |
| [`sizeToFit()`](ui-view/sizetofit.md) | 把大小改成刚好容纳内容 |
| [`convertPoint()`](ui-view/convertpoint.md) | 把点换算到另一个视图的坐标系 |
| [`convertRect()`](ui-view/convertrect.md) | 把矩形换算到另一个视图的坐标系 |
| [`hitTest()`](ui-view/hittest.md) | 某个位置上最上层的、能接收触摸的视图 |
| [`alignmentRectForFrame()`](ui-view/alignmentrectforframe.md) | `frame` 换算成对齐矩形 |
| [`frameForAlignmentRect()`](ui-view/frameforalignmentrect.md) | 对齐矩形换算成 `frame` |
| [`effectiveRadiusForCorner()`](ui-view/effectiveradiusforcorner.md) | 某个角实际的圆角半径 |

手势识别器：

| 方法 | 说明 |
| --- | --- |
| [`addGestureRecognizer()`](ui-view/addgesturerecognizer.md) | 加一个手势识别器 |
| [`removeGestureRecognizer()`](ui-view/removegesturerecognizer.md) | 拿掉一个手势识别器 |

布局、重绘和更新。系统不会在每次属性变化后立刻重新布局，而是做一个标记，稍后统一处理。日常只会用到 `layoutIfNeeded()`：

| 方法 | 说明 |
| --- | --- |
| [`layoutIfNeeded()`](ui-view/layoutifneeded.md) | 有待处理的布局时立刻完成。激活约束后要立刻读 `frame` 时调它 |
| [`setNeedsLayout()`](ui-view/setneedslayout.md) | 标记需要重新布局 |
| [`setNeedsDisplay()`](ui-view/setneedsdisplay.md) | 标记需要重新绘制 |
| [`setNeedsDisplayInRect()`](ui-view/setneedsdisplayinrect.md) | 标记一块矩形需要重新绘制 |
| [`setNeedsUpdateConstraints()`](ui-view/setneedsupdateconstraints.md) | 标记约束需要更新 |
| [`updateConstraintsIfNeeded()`](ui-view/updateconstraintsifneeded.md) | 有待处理的约束更新时立刻完成 |
| [`needsUpdateConstraints()`](ui-view/needsupdateconstraints.md) | 有没有待处理的约束更新 |
| [`setNeedsUpdateProperties()`](ui-view/setneedsupdateproperties.md) | 标记需要更新属性 |
| [`updatePropertiesIfNeeded()`](ui-view/updatepropertiesifneeded.md) | 有待处理的属性更新时立刻完成 |
| [`updateTraitsIfNeeded()`](ui-view/updatetraitsifneeded.md) | 有待处理的外观特征更新时立刻完成 |

约束（Auto Layout）：

| 方法 | 说明 |
| --- | --- |
| [`addLayoutGuide()`](ui-view/addlayoutguide.md) | 加一个 layout guide |
| [`removeLayoutGuide()`](ui-view/removelayoutguide.md) | 移除一个 layout guide |
| [`contentHuggingPriorityForAxis()`](ui-view/contenthuggingpriorityforaxis.md) | 读「不愿被拉大」的优先级 |
| [`setContentHuggingPriority()`](ui-view/setcontenthuggingpriority.md) | 设「不愿被拉大」的优先级 |
| [`contentCompressionResistancePriorityForAxis()`](ui-view/contentcompressionresistancepriorityforaxis.md) | 读「不愿被压小」的优先级 |
| [`setContentCompressionResistancePriority()`](ui-view/setcontentcompressionresistancepriority.md) | 设「不愿被压小」的优先级 |
| [`invalidateIntrinsicContentSize()`](ui-view/invalidateintrinsiccontentsize.md) | 通知系统固有大小变了 |
| [`systemLayoutSizeFittingSize()`](ui-view/systemlayoutsizefittingsize.md) | 按约束算出视图应该多大 |
| [`constraintsAffectingLayoutForAxis()`](ui-view/constraintsaffectinglayoutforaxis.md) | 实际影响这个视图的约束 |
| [`exerciseAmbiguityInLayout()`](ui-view/exerciseambiguityinlayout.md) | 约束不够时在几种结果之间切换一次 |

快照和键盘：

| 方法 | 说明 |
| --- | --- |
| [`snapshotViewAfterScreenUpdates()`](ui-view/snapshotviewafterscreenupdates.md) | 拍一张快照，返回显示快照的新视图 |
| [`resizableSnapshotViewFromRect()`](ui-view/resizablesnapshotviewfromrect.md) | 拍一块可以拉伸的快照 |
| [`endEditing()`](ui-view/endediting.md) | 让正在输入的输入框失去焦点，收起键盘 |

## 事件

| 事件 | 什么时候派发 |
| --- | --- |
| [`traitchange`](ui-view/traitchange-event.md) | 外观特征（深浅色、文字大小等）变化时 |

`UIView` 自己派发的事件只有这一个。触摸不产生 `UIView` 的事件，要响应触摸，用[手势识别器](ui-gesture-recognizer.md)或 [`UIControl`](ui-control.md) 的子类。

除了 `traitchange`，本页的属性都没有变化通知：位置、大小、父视图变了，没有事件。

普通的 `UIView` 上可以监听和派发自定义名字的事件，用法和普通的 `EventTarget` 一样。有自己一套事件的子类（比如 `UIControl`）也一样：不是系统会派发的名字，就当自定义事件。

## 概念

### `frame`、`bounds` 和 `center`

三个属性都描述视图的位置和大小，区别在于参照的坐标系。

| 属性 | 参照谁的坐标系 | 是什么 |
| --- | --- | --- |
| `frame` | 父视图 | 视图在父视图里占的矩形 |
| `bounds` | 自己 | 视图自己的矩形。左上角通常是 `(0, 0)`，宽高和 `frame` 相同 |
| `center` | 父视图 | 视图中心点的位置 |

坐标原点在左上角，`x` 向右增大，`y` 向下增大。

子视图的 `frame` 相对父视图的左上角，不是相对屏幕。移动父视图，子视图跟着移动，子视图的 `frame` 不变。

该用哪一个，按要做的事选：

| 要做的事 | 用哪个 | 原因 |
| --- | --- | --- |
| 把视图摆在父视图里的某个位置 | 写它的 `frame` | `frame` 用的是父视图的坐标系 |
| 知道一个视图有多大，或者让子视图铺满它 | 读它的 `bounds` | 子视图的坐标相对它的左上角，`bounds` 正是这个坐标系里的矩形。读父视图的 `frame` 会把父视图自己的位置带进来 |
| 只移动、不改大小 | 写 `center` | 不用重复写宽高 |
| 视图设了 `transform` | 用 `bounds` 和 `center`，不用 `frame` | 见[变换和 `frame`](#变换和-frame) |

三个属性是同一份数据：写其中一个，另外两个读出来跟着变。用约束定位的视图，三个都只读不写，见[两种定位方式](#两种定位方式)。

### 视图树和叠放顺序

视图组成一棵树。每个视图最多有一个父视图（`superview`），可以有任意多个子视图（`subviews`）。

- `subviews` 的顺序就是绘制顺序，排在后面的画在上面。叠放顺序只由这个顺序决定，没有单独的层级数值。不同父视图下的两个视图谁在上面，由它们各自的祖先在共同父视图里的顺序决定。
- 一个视图同一时刻只能有一个父视图。把一个已经有父视图的视图加到另一个父视图上，它从原来的父视图里移走，不会出现在两处。**未在模拟器验证。**
- 树的根是窗口（[`UIWindow`](ui-window.md)）。视图加到窗口下面才会显示，这时它的 `window` 属性有值；否则是 `null`。
- 页面（[`UIViewController`](ui-view-controller.md)）自带一个根视图 `page.view`，页面的内容都加在它下面。

视图树不能成环。把视图加成它自己的子视图时抛 `TypeError`，视图树不变，这个视图之后照常可用：

```js
const lone = new UIView();
try {
  lone.addSubview(lone);
} catch (err) {
  console.log(String(err));
}
console.log(lone.subviews.length);
```

**效果**：控制台输出 `TypeError: addSubview: raised NSInvalidArgumentException: Can't add self as subview`，然后输出 `0`。

把视图加到它自己的后代上（比如 `dot.addSubview(card)`，而 `dot` 是 `card` 的子视图）会怎样，**未在模拟器验证**。可以先用 `isDescendantOfView()` 判断。

视图加到树上之后由父视图保管，不用保存在变量里。移除之后是否被回收，见[视图由谁保管](../guides/views.md#视图由谁保管)。

### 两种定位方式

| 方式 | 写法 | 特点 |
| --- | --- | --- |
| 直接写 `frame` | `view.frame = new CGRect(…)` | 位置和大小是固定的数值。父视图的大小变了，要由代码重新赋值 |
| 约束（Auto Layout） | `NSLayoutConstraint.activateConstraints([…])` | 描述视图之间的关系，系统算出 `frame`，并在尺寸变化时重算 |

推荐用约束，理由见指南里的[推荐的做法](../guides/views.md#推荐的做法)。

一个视图只用其中一种：

- 用约束的视图，先设 `translatesAutoresizingMaskIntoConstraints = false`。这个属性默认是 `true`，意思是「按 `frame` 摆放」。不改的话，系统按 `frame` 生成的约束会和代码写的约束冲突，表现是约束写对了但位置不变。冲突时系统不在控制台输出任何信息。
- 用了约束的视图，可以读 `frame`，不要写 `frame`。写入不报错，但下一次布局时系统用约束的结果覆盖它。要改位置就改约束的 `constant`，或者换一组约束。**「写入的 `frame` 被覆盖」未在模拟器验证。**
- 页面的根视图 `page.view` 和窗口由系统摆放，不要改它们的这个属性，也不要给它们写 `frame`。

两种方式可以在同一棵树里混用：父视图用约束，它里面的某个子视图用 `frame`。子视图的 `frame` 相对父视图的左上角，父视图被约束移动时子视图跟着移动。

约束里用到两种对象：

- **锚点**（anchor）：代表视图的一条边、中心线或宽高，比如 `view.leadingAnchor`。约束写的是两个锚点之间的关系。
- **layout guide**：一个不显示的矩形，只用来对齐。`view.safeAreaLayoutGuide` 就是代表安全区的那一个。

详见 [`NSLayoutConstraint`](auto-layout.md) 和指南[用约束排版](../guides/auto-layout.md)。

### 安全区

安全区是视图里不会被刘海、状态栏、屏幕圆角和底部横条遮挡的区域。

每个视图都有自己的一份安全区，数值按这个视图的范围计算：贴着屏幕顶端的视图上边有一段安全区，完全位于屏幕中间的视图四边都是 0 pt。

读取方式有两种：

| 方式 | 用在哪里 |
| --- | --- |
| `view.safeAreaInsets` | 用 `frame` 定位时。四个数值，单位 pt |
| `view.safeAreaLayoutGuide` | 用约束定位时。直接和它的锚点对齐 |

推荐用 `safeAreaLayoutGuide`。`safeAreaInsets` 在视图显示到屏幕上之前读到的是 0 pt，读早了数值不对；对齐 `safeAreaLayoutGuide` 的约束没有这个问题。安全区变化时没有事件通知，约束会自动跟着重算，读数值的写法要自己重新读。

底色和背景图通常铺满整个屏幕，文字和按钮放在安全区内。

### 内边距

每个视图有一组内边距，表示内容应该离视图的四条边多远。关于它有四件事要知道：

- **它不会自动缩进子视图。** 用到它的只有两处：对齐 `layoutMarginsGuide` 的约束，以及开了 `isLayoutMarginsRelativeArrangement` 的 [`UIStackView`](ui-stack-view.md)。用 `frame` 定位的子视图不受影响。
- **默认值不是 0。** 新建的视图四边各 8 pt。
- **视图伸到[安全区](#安全区)外面时，系统会把安全区加到内边距上。** 写 16 pt、上方的安全区是 68 pt，读出来的上边距是 84 pt。要写多少就是多少，把 `insetsLayoutMarginsFromSafeArea` 设成 `false`。
- **页面的根视图有系统规定的最小边距。** 给 `page.view` 写的内边距小于最小值时，读出来是最小值。**未在模拟器验证。**

内边距有两个属性，是同一份数据的两种读法，写其中一个，另一个跟着变：

| 属性 | 类型 | 四个字段 | 左右怎么算 |
| --- | --- | --- | --- |
| `directionalLayoutMargins` | `NSDirectionalEdgeInsets` | `top`、`leading`、`bottom`、`trailing` | `leading` 是文字开始的一侧，`trailing` 是文字结束的一侧。中文和英文里 `leading` 在左，阿拉伯语这类从右往左写的语言里在右 |
| `layoutMargins` | `UIEdgeInsets` | `top`、`left`、`bottom`、`right` | 固定的左和右 |

优先用 `directionalLayoutMargins`，界面在从右往左的语言里会自动左右对调。

```js
const box = new UIView();
box.directionalLayoutMargins = new NSDirectionalEdgeInsets(1, 2, 3, 4);
String(box.layoutMargins);              // 'UIEdgeInsets(1, 2, 3, 4)'，语言是从左往右时

box.layoutMargins = { top: 5, left: 6, bottom: 7, right: 8 };
String(box.directionalLayoutMargins);   // 'NSDirectionalEdgeInsets(5, 6, 7, 8)'
```

### 变换和 `frame`

`transform` 是一个二维仿射变换：平移、缩放、旋转以及它们的组合。变换以视图的中心为原点，只改变画出来的样子，不改变 `bounds` 和 `center`。

`transform` 不是单位矩阵时，`frame` 读出来的是变换后图形的外接矩形，不再是视图原本的矩形：

```js
const box = new UIView();
box.frame = new CGRect(24, 304, 40, 40);
box.transform = CGAffineTransform.scale(1.2)
  .concat(CGAffineTransform.rotation(Math.PI / 6));

box.bounds.width;    // 40，不变
box.center.x;        // 44，不变
box.frame.width;     // 65.57，等于 40 × (|a| + |c|)，a 和 c 是变换矩阵的字段
```

所以变换期间要改位置用 `center`，要改大小用 `bounds`，不读写 `frame`。把 `transform` 设回 `CGAffineTransform.identity` 之后，`frame` 恢复成 40 × 40。

变换的构造方法见 [`CGAffineTransform`](cg-affine-transform.md)。

### 结构体是只读的值

`frame`、`bounds`、`center`、`transform`、`safeAreaInsets`、`layoutMargins`、`directionalLayoutMargins` 的类型是 `CGRect`、`CGPoint` 这类结构体。结构体是值，不是对视图的引用：

- 每次读属性得到一个新的对象。
- 字段不能改。写 `view.frame.x = 10` 抛 `TypeError: x is read-only: structs are values, assign a whole new one instead`。
- 要改就给属性整体赋一个新值。赋值时可以用 `new CGRect(…)`，也可以用字段齐全的普通对象。

详见[结构体](structs.md)。

### 出错时会怎样

写错的地方不同，结果不同。

| 写错的地方 | 结果 |
| --- | --- |
| 数值属性给了别的类型（`view.alpha = '0.5'`） | 按 `Number()` 转换，`'0.5'` 得到 `0.5`，`null` 得到 `0`。转不出有限的数时抛 `TypeError`，原值不变 |
| 布尔属性给了别的类型（`view.isHidden = 'false'`） | 按 `Boolean()` 转换。非空字符串都是 `true`，所以 `'false'` 得到 `true` |
| 该传视图的地方传了别的值（`view.addSubview(5)`） | 抛 `TypeError`，视图树不变。不做转换 |
| 颜色写错（`view.backgroundColor = '#GGG'`） | 不抛错。控制台输出一条警告，颜色保持原值 |
| 枚举属性写错（`view.contentMode = 'cover'`） | 不抛错。控制台输出一条警告，警告里列出全部可用的值，属性保持原值 |
| 方法参数里的枚举写错（`view.setContentHuggingPriority('defaultHigh', { forAxis: 'diagonal' })`） | 抛 `TypeError`，报错里列出全部可用的值 |
| 写只读属性（`view.superview = null`） | 抛 `TypeError` |
| 属性名拼错（`view.backgroundColour = 'red'`） | **不报错**，视图不变。类型检查能发现 |
| 把视图加成它自己的子视图 | 抛 `TypeError`，视图树不变 |


| 情况 | 报错 |
| --- | --- |
| 在还没有绑定场景的窗口上读写属性或调方法（`new UIWindow()` 不传参数，并且还没给 `windowScene` 赋值） | `TypeError: frame: this object is not connected to a scene yet, so no native object exists`，开头是属性名或方法名 |
| 在不是由构造函数创建的对象上调用（比如 `Object.create(UIView.prototype)`） | `TypeError: frame: Illegal invocation` |
| 该传原生对象的参数传了别的值 | `TypeError: addSubview needs a UIView`，开头是方法名，结尾是要求的类。参数可以是 `null` 的，结尾多一个 `or null` |
| 数值参数或属性转不出有限的数 | `TypeError: alpha must be a finite number, got "abc"`，开头是属性名或参数名 |
| 方法参数里的枚举写了不认识的值 | `TypeError: forAxis has no value "diagonal"; expected one of: …` |

出错时被写的属性保持原值，视图树不变。这些错误都可以用 `try` / `catch` 捕获。

枚举属性（`contentMode`、`overrideUserInterfaceStyle`）写了不认识的值不属于出错：不抛异常，属性保持原值，控制台输出一条警告 `[Nacre] contentMode has no value "cover"; expected one of: …, ignored`。

各成员自己的报错原文在它的成员页上。几种「没有原生对象」的报错详见[原生类](native-classes.md)。

> **注意**：属性名拼错时不报错。`view.backgroundColour = 'red'` 只是在 JS 对象上加了一个普通属性，视图不变。类型检查能发现这种错误：它报错并提示 `Did you mean 'backgroundColor'?`。


## 示例

### 矩形里放一个小方块

下面的代码从空白 App 开始，在屏幕上放一个靛蓝色的矩形，矩形里面再放一个橙色的小方块。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 创建视图
  const card = new UIView();

  // 2. 设置位置和大小：左上角在 (40, 120)，宽 200，高 120
  card.frame = new CGRect(40, 120, 200, 120);

  // 3. 设置底色
  card.backgroundColor = 'systemIndigo';

  // 4. 放到页面上。page.view 是页面自带的根视图
  page.view.addSubview(card);

  // 5. 在 card 里面再放一个子视图。它的坐标相对 card 的左上角
  const dot = new UIView();
  dot.frame = new CGRect(16, 16, 40, 40);
  dot.backgroundColor = 'systemOrange';
  card.addSubview(dot);

  // 6. 把 dot 的左上角换算成页面坐标
  const p = dot.convertPoint(new CGPoint(0, 0), { toView: page.view });
  console.log(p.x, p.y);
});
```

**效果**

- 屏幕上出现一个靛蓝色矩形，宽 200 pt、高 120 pt，左边缘距屏幕左边 40 pt，上边缘距屏幕顶端 120 pt。
- 矩形的左上角里面有一个 40 × 40 pt 的橙色方块，距矩形的左边和上边各 16 pt。
- 控制台输出 `56 176`，即 40 + 16 和 120 + 16。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

四个基本步骤是：创建、给位置和大小、设外观、加到父视图上。回调结束后 `card` 和 `dot` 这两个变量不再存在，两个视图仍然显示：它们在视图树上，由父视图保管。更多写法见指南[在屏幕上摆放视图](../guides/views.md)。

## 对应的 iOS API

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `[[UIView alloc] init]` | `new UIView()` |
| `[[UIView alloc] initWithFrame:rect]` | `new UIView()` 之后赋 `frame` |
| `view.frame = CGRectMake(40, 120, 200, 120)` | `view.frame = new CGRect(40, 120, 200, 120)` |
| `view.center = CGPointMake(100, 100)` | `view.center = new CGPoint(100, 100)` |
| `view.transform = CGAffineTransformMakeRotation(a)` | `view.transform = CGAffineTransform.rotation(a)` |
| `view.backgroundColor = UIColor.systemIndigoColor` | `view.backgroundColor = 'systemIndigo'` |
| `[view addSubview:box]` | `view.addSubview(box)` |
| `[view insertSubview:box atIndex:0]` | `view.insertSubview(box, { atIndex: 0 })` |
| `[view insertSubview:box belowSubview:other]` | `view.insertSubview(box, { belowSubview: other })` |
| `[view convertPoint:p toView:other]` | `view.convertPoint(p, { toView: other })` |
| `[view convertRect:r fromView:other]` | `view.convertRect(r, { fromView: other })` |
| `view.directionalLayoutMargins = NSDirectionalEdgeInsetsMake(8, 16, 8, 16)` | `view.directionalLayoutMargins = new NSDirectionalEdgeInsets(8, 16, 8, 16)` |
| `view.layoutMargins = UIEdgeInsetsMake(8, 16, 8, 16)` | `view.layoutMargins = new UIEdgeInsets(8, 16, 8, 16)` |
| `view.insetsLayoutMarginsFromSafeArea = NO` | `view.insetsLayoutMarginsFromSafeArea = false` |
| `[view sizeThatFits:CGSizeMake(300, 999)]` | `view.sizeThatFits(new CGSize(300, 999))` |
| `[view hitTest:p withEvent:nil]` | `view.hitTest(p)` |
| `[view endEditing:YES]` | `view.endEditing(true)` |
| `[view addGestureRecognizer:tap]` | `view.addGestureRecognizer(tap)` |
| `[UIView animateWithDuration:0.3 animations:^{ view.alpha = 0; }]` | `UIView.animateWithDuration(0.3, { animations() { view.alpha = 0; } })` |
| `[UIView animateWithDuration:0.3 animations:^{ … } completion:^(BOOL finished) { … }]` | `const finished = await UIView.animateWithDuration(0.3, { animations() { … } })` |
| `[UIView animateWithDuration:0.3 delay:0.1 options:UIViewAnimationOptionCurveEaseOut animations:^{ … } completion:nil]` | `UIView.animateWithDuration(0.3, { delay: 0.1, options: ['curveEaseOut'], animations() { … } })` |
| `[UIView animateWithDuration:0.5 delay:0 usingSpringWithDamping:0.6 initialSpringVelocity:0 options:0 animations:^{ … } completion:nil]` | `UIView.animateWithDuration(0.5, { usingSpringWithDamping: 0.6, initialSpringVelocity: 0, animations() { … } })` |
| `[UIView performWithoutAnimation:^{ … }]` | `UIView.performWithoutAnimation(() => { … })` |
| `view.hidden = YES` | `view.isHidden = true` |
| `view.opaque = NO` | `view.isOpaque = false` |
| `view.userInteractionEnabled = NO` | `view.isUserInteractionEnabled = false` |
| `view.contentMode = UIViewContentModeScaleAspectFit` | `view.contentMode = 'scaleAspectFit'` |
| `[view setContentHuggingPriority:UILayoutPriorityDefaultLow forAxis:UILayoutConstraintAxisHorizontal]` | `view.setContentHuggingPriority('defaultLow', { forAxis: 'horizontal' })` |

规则有三条：

- ObjC 里声明成 `getter=isXxx` 的布尔属性，JS 用 `isXxx` 这个名字读和写，比如 `isHidden`。
- 多段的方法名，第一段是 JS 的方法名，其余各段是 `options` 对象的键。
- ObjC 的四个 `animateWithDuration:…` 在 JS 里是同一个方法。`completion:` 这个参数换成了返回的 Promise。

## 参见

- [在屏幕上摆放视图](../guides/views.md)、[让视图动起来](../guides/view-animations.md)、[用约束排版](../guides/auto-layout.md)
- [`NSLayoutConstraint`](auto-layout.md)：约束
- [结构体](structs.md)：[`CGRect`](cg-rect.md)、[`CGPoint`](cg-point.md)、[`CGSize`](cg-size.md)、[`UIEdgeInsets`](ui-edge-insets.md)、[`CGAffineTransform`](cg-affine-transform.md)
- [手势识别器](ui-gesture-recognizer.md)：让普通视图响应点按、长按、拖动、捏合、旋转、轻扫
- [Core Animation](ca-animation.md)：直接在图层上做动画，能做关键帧、沿路径运动、动画组
- [`CALayer`](ca-layer.md)：圆角、边框、阴影、渐变
- [颜色](ui-color.md)：`backgroundColor` 能写哪些值
- [单位](units.md)：pt 是什么
- [`UIWindow`](ui-window.md) 和 [`UIViewController`](ui-view-controller.md)：视图树的根和页面
- [`UIStackView`](ui-stack-view.md)：把一组视图排成一行或一列，可以按内边距缩进
- [外观特征](ui-trait-collection.md)：`traitCollection`、`overrideUserInterfaceStyle` 和 `traitchange` 事件
- [`UIControl`](ui-control.md) 和 [`UIButton`](ui-button.md)：自带点按事件的视图
- [`UIWindowScene`](ui-window-scene.md)：场景被销毁后界面怎样被回收
- [原生类](native-classes.md)：为什么不能继承，以及几种「没有原生对象」的报错
