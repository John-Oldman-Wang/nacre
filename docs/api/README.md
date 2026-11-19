# Nacre API 文档

这里是 Nacre 提供给 JS 的全部 API 的参考，面向用 Nacre 写 App 的 JS 开发者。每一页讲一个类或一组能力：它表示什么、怎么写、写完得到什么效果、哪里会出错。

第一次用 Nacre，先读[运行时怎么工作](how-it-works.md)和 [`application`](application.md)，再按需要查其他页面。要从零建一个自己的 App，见[入门指南](../guides/README.md)。

## 有哪些 API

API 分两类：

- **运行时自己定义的**：`application`、`console`、`fetch`、定时器、本地存储、`WebView` 等。名字和写法由 Nacre 决定。
- **iOS 的原生类**：`UIView`、`UILabel`、`CALayer` 等，直接用 iOS 里的原名，属性和方法的名字也和 Apple 的文档对应。每个类页和成员页末尾都写了对应的 ObjC 写法，照着 Apple 的文档就能查到 JS 怎么写。

**能用的只有下面「参考」里列出的这些。** 没列出的 iOS 类（比如 `NSString`、`UITableView`）在 JS 里不存在，读它的名字会抛 `ReferenceError`，也没有通用的办法调用到它们。

表里的大部分 API 每个项目都有。定位、拍照、面容 ID 等几项要单独安装对应的包才有，它们在「能力包（要单独安装）」那一组里。哪些要装、装了之后还要做什么，见[核心和能力包](capabilities.md)。App 自己的原生代码和第三方原生 SDK 的能力不在这里：它们要先包成原生模块，再从 [`application.nativeModules`](native-modules.md) 调，做法见[写自己的原生模块](../guides/native-modules.md)。

一个类已经列出、但缺某项能力时，看那一页末尾的「还不能做的」。整体还缺什么、计划怎么补，见[项目说明的功能清单](../project.md#7-还要做的)。

## 怎么读这些文档

- 每个类有一个**类页**：它是什么、继承自谁，以及全部属性、方法、事件的清单，每项一句话。点进去是这个成员自己的页面：值、参数、返回值、会抛什么、例子。
- 怎么用这些类做成一件事，看[指南](../guides/README.md)。
- 每段代码后面的「效果」或「结果」写的是运行后看到什么。标着「**未在模拟器验证**」的是还没有实际运行确认过的；没标的都验证过，或者直接来自代码。
- 长度和坐标的单位都是点（pt），见[单位](units.md)。
- 文档只讲怎么用。实现方式、设计上的取舍和实测数据在[实现原理](../internals/README.md)。

文档的写法规范见[文档写法](../writing-guide.md)。

## 参考

按用途分组，和左边侧边栏的顺序一致。每个类页列出这个类的全部成员，每个成员有自己的页面。

### 开始

| 页面 | 说明 |
| --- | --- |
| [运行时怎么工作](how-it-works.md) | Nacre 是 iOS 上的 JavaScript 运行时。 |
| [核心和能力包](capabilities.md) | Nacre 的 API 分成两部分：**核心**和**能力包**。 |
| [原生类](native-classes.md) | **原生类**表示 iOS 系统提供的类：视图（`UIView`）、文字标签（`UILabel`）、页面（`UIViewController`）、图层（`CALayer`）等。 |
| [单位](units.md) | Nacre 的 API 里，数值的单位和 iOS 一致：长度是点（pt），角度是弧度，动画的时间是秒。 |
| [结构体](structs.md) | **结构体**表示由几个数值组成的一个值：一个点、一个尺寸、一个矩形、一组边距、一个变换矩阵。 |
| [枚举](enums.md) | **枚举**表示只能从一组固定取值里选一个的值，比如文字的对齐方式只能是靠左、居中、靠右、两端对齐、跟随语言方向这五种之一。 |

### App 和事件

| 页面 | 说明 |
| --- | --- |
| [`Application`](application.md) | **`Application`** 表示正在运行的这个 App。 |
| [`EventTarget`](event-target.md) | **`EventTarget`** 表示能派发事件、能被监听事件的对象。 |
| [`Event`](event.md) | **`Event`** 表示一次事件：发生了什么（事件名）、派发给了谁、能不能取消。 |
| [`ErrorEvent`](error-event.md) | **`ErrorEvent`** 表示一次没被捕获的异常。 |
| [`PromiseRejectionEvent`](promise-rejection-event.md) | **`PromiseRejectionEvent`** 表示一次没有被处理的 Promise 拒绝。 |
| [`OpenURLEvent`](open-url-event.md) | **`OpenURLEvent`** 表示一次「本 App 被一条链接打开」。 |
| [`application.nativeModules`](native-modules.md) | **`application.nativeModules`** 表示登记进这个 App 的全部原生模块。 |
| [`NativeModule`](native-module.md) | **`NativeModule`** 表示一个登记进 App 的原生模块：一段用 ObjC 或 Swift 写的代码，按一个名字提供一组方法和一组事件。 |

### 窗口和页面

| 页面 | 说明 |
| --- | --- |
| [`UIWindowScene`](ui-window-scene.md) | **`UIWindowScene`** 表示 App 界面的一个实例，称为场景。 |
| [`UISceneSession`](ui-scene-session.md) | **`UISceneSession`** 表示场景的会话：场景的持久身份。 |
| [`UIWindow`](ui-window.md) | **`UIWindow`** 表示窗口：一个场景里承载界面的最外层视图。 |
| [`UIViewController`](ui-view-controller.md) | **`UIViewController`** 表示一屏内容的管理者，下文称为页面。 |
| [`UINavigationController`](ui-navigation-controller.md) | **`UINavigationController`** 表示一个页面栈，称为导航控制器。 |
| [`UINavigationItem`](ui-navigation-item.md) | **`UINavigationItem`** 表示一个页面在导航条上的配置：正中的标题、副标题、下一页返回按钮上的字、左右两侧各有哪些按钮。 |
| [`UIBarItem`](ui-bar-item.md) | **`UIBarItem`** 表示导航条或标签栏上一个项的公共部分：文字、图标、能不能点、编号。 |
| [`UIBarButtonItem`](ui-bar-button-item.md) | **`UIBarButtonItem`** 表示导航条上的一个按钮。 |
| [`UITabBarController`](ui-tab-bar-controller.md) | **`UITabBarController`** 表示一个带标签栏的界面，称为标签控制器。 |
| [`UITabBar`](ui-tab-bar.md) | **`UITabBar`** 表示标签控制器屏幕底部的那一排标签。 |
| [`UITabBarItem`](ui-tab-bar-item.md) | **`UITabBarItem`** 表示底部标签栏上的一个标签：图标、图标下面的文字、右上角的角标。 |
| [`UIAlertController`](ui-alert-controller.md) | **`UIAlertController`** 表示一个系统弹窗：一段标题、一段说明文字，加上若干个按钮。 |
| [`UIAlertAction`](ui-alert-action.md) | **`UIAlertAction`** 表示系统弹窗上的一个按钮。 |
| [`UIActivityViewController`](ui-activity-view-controller.md) | **`UIActivityViewController`** 表示系统的分享面板。 |

### 视图和布局

| 页面 | 说明 |
| --- | --- |
| [`UIView`](ui-view.md) | **`UIView`** 表示屏幕上的一块矩形区域，称为视图。 |
| [`NSLayoutConstraint`](auto-layout.md) | **`NSLayoutConstraint`** 表示一条约束：两个视图上的两个位置或尺寸之间的关系，例如「卡片的左边在安全区左边的右侧 16 pt」「两个色块等宽」。 |
| [`NSLayoutAnchor`](ns-layout-anchor.md) | **`NSLayoutAnchor`** 表示视图上一个可以被约束引用的位置或尺寸，叫锚点：一条边、一条中心线、文字的基线、宽或高。 |
| [`NSLayoutXAxisAnchor`](ns-layout-x-axis-anchor.md) | **`NSLayoutXAxisAnchor`** 表示水平方向的位置锚点：视图或 layout guide 上的 `leadingAnchor`、`trailingAnchor`、`leftAnchor`、`rightAnchor`、`centerXAnchor`。 |
| [`NSLayoutYAxisAnchor`](ns-layout-y-axis-anchor.md) | **`NSLayoutYAxisAnchor`** 表示垂直方向的位置锚点：视图或 layout guide 上的 `topAnchor`、`bottomAnchor`、`centerYAnchor`、`firstBaselineAnchor`、`lastBaselineAnchor`。 |
| [`NSLayoutDimension`](ns-layout-dimension.md) | **`NSLayoutDimension`** 表示尺寸锚点：视图或 layout guide 的 `widthAnchor` 和 `heightAnchor`，以及 `anchorWithOffsetToAnchor()` 返回的两个锚点之间的距离。 |
| [`UILayoutGuide`](ui-layout-guide.md) | **`UILayoutGuide`** 表示一个只参与布局、不显示的矩形，叫 layout guide。 |
| [`UIKeyboardLayoutGuide`](ui-keyboard-layout-guide.md) | **`UIKeyboardLayoutGuide`** 表示键盘所占区域的 layout guide。 |
| [`UIStackView`](ui-stack-view.md) | **`UIStackView`** 表示一个排列容器。 |
| [`UIScrollView`](ui-scroll-view.md) | **`UIScrollView`** 表示一个可以滚动的视图，称为滚动视图。 |
| [`UIVisualEffectView`](ui-visual-effect-view.md) | **`UIVisualEffectView`** 表示一块带效果的区域。 |
| [`UIVisualEffect`](ui-visual-effect.md) | **`UIVisualEffect`** 表示一种视觉效果，是四种效果的共同父类：`UIBlurEffect`（模糊）、`UIVibrancyEffect`（鲜明）、`UIGlassEffect`（玻璃）、`UIGlassContainerEffect`（玻璃容器）。 |
| [`UIBlurEffect`](ui-blur-effect.md) | **`UIBlurEffect`** 表示一种模糊效果：把效果视图后面的画面变模糊，并盖上一层半透明的颜色。 |
| [`UIVibrancyEffect`](ui-vibrancy-effect.md) | **`UIVibrancyEffect`** 表示一种鲜明效果：让放在模糊上面的文字和图标带上底下画面的颜色，而不是平平的一层灰。 |
| [`UIGlassEffect`](ui-glass-effect.md) | **`UIGlassEffect`** 表示一种玻璃效果，是 iOS 26 的新材质。 |
| [`UIGlassContainerEffect`](ui-glass-container-effect.md) | **`UIGlassContainerEffect`** 表示一个玻璃容器效果（iOS 26）：把几块玻璃合成一组来画，靠得够近的会融在一起。 |
| [`UIActivityIndicatorView`](ui-activity-indicator-view.md) | **`UIActivityIndicatorView`** 表示一个转圈：一圈不停旋转的短线，告诉用户有一件事正在进行、还没有结果。 |
| [`UIProgressView`](ui-progress-view.md) | **`UIProgressView`** 表示一条进度条：一条横线，从左边起有一段是填满的，填满的长度表示一件事完成了多少。 |
| [`UIToolbar`](ui-toolbar.md) | **`UIToolbar`** 表示一条工具条：一个横条，里面从左到右排着若干个按钮。 |

### 结构体

| 页面 | 说明 |
| --- | --- |
| [`CGPoint`](cg-point.md) | **`CGPoint`** 表示平面上的一个点：横坐标 `x` 和纵坐标 `y`，单位 pt。 |
| [`CGSize`](cg-size.md) | **`CGSize`** 表示一个尺寸：宽 `width` 和高 `height`，单位 pt。 |
| [`CGRect`](cg-rect.md) | **`CGRect`** 表示一个矩形：左上角的位置 `x`、`y` 加上宽 `width` 和高 `height`，单位都是 pt。 |
| [`UIEdgeInsets`](ui-edge-insets.md) | **`UIEdgeInsets`** 表示四条边各自向内缩进多少：`top`、`left`、`bottom`、`right`，单位 pt。 |
| [`NSDirectionalEdgeInsets`](ns-directional-edge-insets.md) | **`NSDirectionalEdgeInsets`** 表示四条边各自向内缩进多少，左右按文字方向区分：`top`、`leading`、`bottom`、`trailing`，单位 pt。 |
| [`CGAffineTransform`](cg-affine-transform.md) | **`CGAffineTransform`** 表示一个二维仿射变换：缩放、旋转、平移，以及它们的组合。 |
| [`CAFrameRateRange`](ca-frame-rate-range.md) | **`CAFrameRateRange`** 表示一个帧率区间：`minimum`（最低）、`maximum`（最高）、`preferred`（最希望的），单位都是帧每秒。 |
| [`NSRange`](ns-range.md) | **`NSRange`** 表示一段文字的范围：从 `location` 开始的 `length` 个 UTF-16 码元。 |

### 列表

| 页面 | 说明 |
| --- | --- |
| [`UICollectionView`](ui-collection-view.md) | **`UICollectionView`** 表示一个能滚动的列表。 |
| [`UICollectionViewDiffableDataSource`](ui-collection-view-diffable-data-source.md) | **`UICollectionViewDiffableDataSource`** 表示一个列表的数据源：它决定 `UICollectionView` 显示哪些项、每一项长什么样。 |
| [`NSDiffableDataSourceSnapshot`](ns-diffable-data-source-snapshot.md) | **`NSDiffableDataSourceSnapshot`** 表示一份列表数据的清单：有哪些分区、每个分区里有哪些项、什么顺序。 |
| [`NSIndexPath`](ns-index-path.md) | **`NSIndexPath`** 表示一项在列表里的位置：第 `section` 个分区里的第 `item` 项，都从 0 数。 |
| [`UICollectionViewLayout`](ui-collection-view-layout.md) | **`UICollectionViewLayout`** 表示决定 `UICollectionView` 里单元格怎么排的对象。 |
| [`UICollectionViewCompositionalLayout`](ui-collection-view-compositional-layout.md) | **`UICollectionViewCompositionalLayout`** 表示组合布局：一种由分区、组、项拼成的布局对象。 |
| [`UICollectionLayoutListConfiguration`](ui-collection-layout-list-configuration.md) | **`UICollectionLayoutListConfiguration`** 表示列表布局的配置：列表的外观、行之间画不画分隔线、底色、分区的头从哪来。 |
| [`UICollectionReusableView`](ui-collection-reusable-view.md) | **`UICollectionReusableView`** 表示 `UICollectionView` 里能复用的视图。 |
| [`UICollectionViewCell`](ui-collection-view-cell.md) | **`UICollectionViewCell`** 表示单元格：`UICollectionView` 里一项在屏幕上的视图。 |
| [`UICollectionViewListCell`](ui-collection-view-list-cell.md) | **`UICollectionViewListCell`** 表示列表布局里用的单元格。 |
| [`UIListContentConfiguration`](ui-list-content-configuration.md) | **`UIListContentConfiguration`** 表示列表里一行的内容：主文字、副文字、左边的图片。 |

### 文字、图片、颜色

| 页面 | 说明 |
| --- | --- |
| [`UILabel`](ui-label.md) | **`UILabel`** 表示屏幕上一段只读的文字，称为标签。 |
| [`UIFont`](ui-font.md) | **`UIFont`** 表示一个字体。 |
| [`UIImage`](ui-image.md) | **`UIImage`** 表示一张图片。 |
| [`UIImageView`](ui-image-view.md) | **`UIImageView`** 表示显示图片的视图，称为图片视图。 |
| [`UIColor`](ui-color.md) | **`UIColor`** 表示一个颜色。 |
| [`UITraitCollection`](ui-trait-collection.md) | **`UITraitCollection`** 表示界面当前所处环境的一组值：现在是深色还是浅色，屏幕上 1 pt 对应几个像素，用户把系统的文字大小设到了哪一档，等等。 |
| [`NSAttributedString`](ns-attributed-string.md) | **`NSAttributedString`** 表示一段带样式的文字，称为富文本：一个字符串，加上每一段上的一组属性。 |
| [`NSMutableAttributedString`](ns-mutable-attributed-string.md) | **`NSMutableAttributedString`** 表示一段可以改的富文本：可以给某一段加属性、去掉属性，拼接、插入、替换、删除文字。 |
| [`NSParagraphStyle`](ns-paragraph-style.md) | **`NSParagraphStyle`** 表示一组段落样式：对齐、行距、段距、缩进、换行方式。 |
| [`NSMutableParagraphStyle`](ns-mutable-paragraph-style.md) | **`NSMutableParagraphStyle`** 表示一组可以改的段落样式。 |
| [`NSShadow`](ns-shadow.md) | **`NSShadow`** 表示文字的阴影：偏移、模糊半径和颜色。 |
| [`NSTextAttachment`](ns-text-attachment.md) | **`NSTextAttachment`** 表示富文本里的一个附件：在一个字符的位置上显示一张图片。 |

### 控件和输入

| 页面 | 说明 |
| --- | --- |
| [`UIControl`](ui-control.md) | **`UIControl`** 表示一个控件：一种能接收触摸的视图，它把一次触摸的过程转换成一组「控件事件」派发出来。 |
| [`UIButton`](ui-button.md) | **`UIButton`** 表示一个按钮：屏幕上一块可以点击的区域，上面显示文字、图标，或者两者都有。 |
| [`UISwitch`](ui-switch.md) | **`UISwitch`** 表示一个开关：一条短轨道上有一个圆钮，圆钮在左边是关，在右边是开。 |
| [`UISlider`](ui-slider.md) | **`UISlider`** 表示一个滑块：一条横着的轨道上有一个圆钮，用户拖动圆钮在一个范围里选一个数。 |
| [`UIStepper`](ui-stepper.md) | **`UIStepper`** 表示一个步进器：并排的一个减号按钮和一个加号按钮，用户点一下，数值减少或增加一档。 |
| [`UISegmentedControl`](ui-segmented-control.md) | **`UISegmentedControl`** 表示一个分段选择：横着排开的几段，每段是一个标题或者一张图，同一时刻最多只有一段是选中的。 |
| [`UIPageControl`](ui-page-control.md) | **`UIPageControl`** 表示一个页码指示：一排小圆点，每个点代表一页，当前页的那个点更亮。 |
| [`UIDatePicker`](ui-date-picker.md) | **`UIDatePicker`** 表示一个日期选择器：系统提供的、让用户选一个日期、一个时间或者一段时长的控件。 |
| [`UIColorWell`](system-controls.md) | **`UIColorWell`** 表示一个取色控件：一个显示当前颜色的小圆钮。 |
| [`UITextField`](ui-text-field.md) | **`UITextField`** 表示一个单行输入框。 |
| [`UITextView`](ui-text-view.md) | **`UITextView`** 表示一块可以输入多行文字的区域。 |
| [`NSTextContainer`](ns-text-container.md) | **`NSTextContainer`** 表示 `UITextView` 里文字排版的区域：每行左右空多少、最多排几行、一行排不下时怎么处理。 |
| [`UISearchBar`](ui-search-bar.md) | **`UISearchBar`** 表示一个搜索框：一个带放大镜图标的单行输入框，右端有清空按钮。 |

### 手势

| 页面 | 说明 |
| --- | --- |
| [`UIGestureRecognizer`](ui-gesture-recognizer.md) | **`UIGestureRecognizer`** 表示一个手势识别器：一个加在视图上的对象，它观察这个视图上的触摸，认出某种手势时派发事件。 |
| [`UITapGestureRecognizer`](ui-tap-gesture-recognizer.md) | **`UITapGestureRecognizer`** 表示一个点按识别器：手指按下后很快抬起时认出手势。 |
| [`UILongPressGestureRecognizer`](ui-long-press-gesture-recognizer.md) | **`UILongPressGestureRecognizer`** 表示一个长按识别器：手指按住不动一段时间时认出手势，默认是 0.5 秒。 |
| [`UIPanGestureRecognizer`](ui-pan-gesture-recognizer.md) | **`UIPanGestureRecognizer`** 表示一个拖动识别器：手指按下并移动时认出手势。 |
| [`UIPinchGestureRecognizer`](ui-pinch-gesture-recognizer.md) | **`UIPinchGestureRecognizer`** 表示一个捏合识别器：两根手指张开或捏拢时认出手势。 |
| [`UIRotationGestureRecognizer`](ui-rotation-gesture-recognizer.md) | **`UIRotationGestureRecognizer`** 表示一个旋转识别器：两根手指绕着彼此转动时认出手势。 |
| [`UISwipeGestureRecognizer`](ui-swipe-gesture-recognizer.md) | **`UISwipeGestureRecognizer`** 表示一个轻扫识别器：手指朝指定的方向快速划过时认出手势。 |
| [`UIScreenEdgePanGestureRecognizer`](ui-screen-edge-pan-gesture-recognizer.md) | **`UIScreenEdgePanGestureRecognizer`** 表示一个屏幕边缘拖动识别器：只识别从屏幕边缘开始、向内的拖动。 |

### 图层和动画

| 页面 | 说明 |
| --- | --- |
| [`CALayer`](ca-layer.md) | **`CALayer`** 表示图层：屏幕上的一块矩形区域，以及画在这块区域里的内容。 |
| [`CAGradientLayer`](ca-gradient-layer.md) | **`CAGradientLayer`** 表示渐变图层：在自己的矩形范围里画一段颜色渐变。 |
| [`CAShapeLayer`](ca-shape-layer.md) | **`CAShapeLayer`** 表示形状图层：把一条路径（`UIBezierPath`）画出来。 |
| [`UIBezierPath`](ui-bezier-path.md) | **`UIBezierPath`** 表示一条路径：由直线段、曲线段和圆弧连成的几何形状。 |
| [`CAAnimation`](ca-animation.md) | **`CAAnimation`** 表示一段作用在图层上的动画：在一段时间里，让图层的某个属性（不透明度、位置、圆角、颜色、路径等）从一个值连续变到另一个值。 |
| [`CAPropertyAnimation`](ca-property-animation.md) | **`CAPropertyAnimation`** 表示改图层某一个属性的动画。 |
| [`CABasicAnimation`](ca-basic-animation.md) | **`CABasicAnimation`** 表示让图层的一个属性从一个值变到另一个值的动画。 |
| [`CAKeyframeAnimation`](ca-keyframe-animation.md) | **`CAKeyframeAnimation`** 表示让图层的一个属性依次经过几个值的动画，或者让图层沿一条路径移动的动画。 |
| [`CASpringAnimation`](ca-spring-animation.md) | **`CASpringAnimation`** 表示用弹簧的方式让一个属性到达终点的动画：属性越过终点，回弹几次后停住。 |
| [`CAAnimationGroup`](ca-animation-group.md) | **`CAAnimationGroup`** 表示一组动画。 |
| [`CAMediaTimingFunction`](ca-media-timing-function.md) | **`CAMediaTimingFunction`** 表示一条时间曲线。 |
| [`CATransaction`](ca-transaction.md) | **`CATransaction`** 表示事务：一组一起交给系统的图层修改。 |
| [`CADisplayLink`](ca-display-link.md) | **`CADisplayLink`** 表示一个和屏幕刷新同步的定时器。 |
| [`NSRunLoop`](ns-run-loop.md) | **`NSRunLoop`** 表示一个线程的事件循环。 |

### 网络

| 页面 | 说明 |
| --- | --- |
| [`fetch()`](fetch.md) | **`fetch()`** 函数发出一个 HTTP 请求，返回一个 `Promise`。 |
| [`Request`](request.md) | **`Request`** 表示一次 HTTP 请求：地址、方法、请求头、请求体和用来取消它的信号，保存在一个对象里。 |
| [`Response`](response.md) | **`Response`** 表示一次 HTTP 请求得到的响应：状态码、响应头和响应内容。 |
| [`Headers`](headers.md) | **`Headers`** 表示一组 HTTP 请求头或响应头。 |
| [`Blob`](blob.md) | **`Blob`** 表示一块不可修改的二进制数据。 |
| [`ReadableStream`](readable-stream.md) | **`ReadableStream`** 表示一份可以一块一块读出来的数据。 |
| [`ReadableStreamDefaultReader`](readable-stream-default-reader.md) | **`ReadableStreamDefaultReader`** 表示一个流的读取器：拿着流的锁，用 `read()` 一块一块地读。 |
| [`AbortController`](abort-controller.md) | **`AbortController`** 表示一个取消指令的发出方。 |
| [`AbortSignal`](abort-signal.md) | **`AbortSignal`** 表示一个取消信号：有没有取消、为什么取消。 |
| [`URL`](url.md) | **`URL`** 表示一个解析好的地址。 |
| [`URLSearchParams`](url-search-params.md) | **`URLSearchParams`** 表示地址里 `?` 后面的那一串查询参数。 |
| [`WebSocket`](websocket.md) | **`WebSocket`** 表示 App 和服务器之间的一条长连接。 |

### 网页

| 页面 | 说明 |
| --- | --- |
| [`WebView`](web-view.md) | **`WebView`** 表示一个显示网页的视图。 |
| [`WebContents`](web-contents.md) | **`WebContents`** 表示 `WebView` 里的那张网页。 |
| [`NavigationHistory`](navigation-history.md) | **`NavigationHistory`** 表示一张网页的后退和前进：能不能后退、前进，以及后退、前进一页。 |
| [`WebContentsIPC`](web-contents-ipc.md) | **`WebContentsIPC`** 表示一张网页的请求-应答通道在 App 这一头。 |
| [`ipcRenderer`](ipc-renderer.md) | **`ipcRenderer`** 表示消息通道在网页那一头：网页给 App 发消息、向 App 要结果、收 App 发来的消息，都用它。 |
| [`contextBridge`](context-bridge.md) | **`contextBridge`** 表示预加载脚本往网页上挂东西的入口：把预加载脚本写的一组方法挂到网页的 `window` 上，网页的脚本就能调用它们。 |
| [`Session`](session.md) | **`Session`** 表示一个存储分区：`WebView` 里的网页留下的 cookie、`localStorage`、IndexedDB、缓存等数据都存在某一个分区里。 |
| [`Cookies`](cookies.md) | **`Cookies`** 表示一个存储分区里的全部 cookie。 |
| [`Cookie`](cookie.md) | **`Cookie`** 表示一条 cookie 在某一刻的记录。 |

### 运行时的全局

| 页面 | 说明 |
| --- | --- |
| [定时器](timers.md) | **定时器**是一组全局函数，用来在一段时间之后执行回调，或者每隔一段时间重复执行回调。 |
| [`performance`](performance.md) | **`Performance`** 表示一个只用来量时间长短的时钟。 |
| [`Intl.NumberFormat`](intl.md) | **`Intl.NumberFormat`** 表示一个按某个地区的习惯把数字写成文字的格式化对象，可以写普通的数、金额、百分比。 |
| [`Intl.DateTimeFormat`](intl-date.md) | **`Intl.DateTimeFormat`** 表示一个按某个地区的习惯把时刻写成文字的格式化对象。 |
| [`NSLocale`](ns-locale.md) | **`NSLocale`** 表示一个地区：一种语言，加上国家或地区，以及跟着它们走的格式。 |
| [`crypto`](crypto.md) | **`Crypto`** 表示系统的随机数来源。 |
| [`TextEncoder`](text-encoder.md) | **`TextEncoder`** 表示一个把字符串编码成 UTF-8 字节的编码器。 |
| [`TextDecoder`](text-decoder.md) | **`TextDecoder`** 表示一个把 UTF-8 字节解码成字符串的解码器。 |
| [atob、btoa、structuredClone](web-globals.md) | **文字、字节和深拷贝**这一组全局 API 负责字符串和字节之间的转换，以及值的深拷贝。 |

### 存储

| 页面 | 说明 |
| --- | --- |
| [`application.storage`](storage.md) | **`application.storage`** 表示 App 的键值存储。 |
| [`application.fileSystem`](filesystem.md) | **`application.fileSystem`** 表示 App 自己的文件存储。 |

### 系统能力

| 页面 | 说明 |
| --- | --- |
| [`UIDevice`](ui-device.md) | **`UIDevice`** 表示运行 App 的这台设备。 |
| [`UIPasteboard`](ui-pasteboard.md) | **`UIPasteboard`** 表示系统剪贴板。 |
| [`UIFeedbackGenerator`](ui-feedback-generator.md) | **`UIFeedbackGenerator`** 表示一个触感反馈的生成器。 |
| [`UIImpactFeedbackGenerator`](ui-impact-feedback-generator.md) | **`UIImpactFeedbackGenerator`** 表示撞击类的触感反馈生成器：两个东西碰到一起时的那一下震动，比如按钮按下、卡片落到位、拖动的东西碰到边界。 |
| [`UISelectionFeedbackGenerator`](ui-selection-feedback-generator.md) | **`UISelectionFeedbackGenerator`** 表示选择类的触感反馈生成器：选择从一项换到另一项时很轻的一下震动，比如滚轮转过一格、滑块经过一个刻度、列表的选中项换了。 |
| [`UINotificationFeedbackGenerator`](ui-notification-feedback-generator.md) | **`UINotificationFeedbackGenerator`** 表示通知类的触感反馈生成器：一件事成功了、需要注意、失败了时的震动。 |

### 能力包（要单独安装）

| 页面 | 说明 |
| --- | --- |
| [`application.keychain`](keychain.md) | **`application.keychain`** 表示 App 在钥匙串里的条目。 |
| [`LAContext`](la-context.md) | **`LAContext`** 表示一次「确认现在拿着手机的人是机主」的认证。 |
| [`CLLocationManager`](cl-location-manager.md) | **`CLLocationManager`** 表示 App 向系统要位置的一个入口。 |
| [`CLLocation`](cl-location.md) | **`CLLocation`** 表示系统量到的一个位置：经纬度、海拔、各个量的误差、速度、移动方向，以及这个位置是什么时候量的。 |
| [`CLLocationCoordinate2D`](cl-location-coordinate-2d.md) | **`CLLocationCoordinate2D`** 表示地球上一个点的经纬度，单位是度。 |
| [`CLLocationError`](cl-location-error.md) | **`CLLocationError`** 是定位出错时得到的 `Error` 对象。 |
| [`UNUserNotificationCenter`](un-user-notification-center.md) | **`UNUserNotificationCenter`** 表示这个 App 和系统的通知功能之间的入口，整个 App 只有一个。 |
| [`UNNotificationRequest`](un-notification-request.md) | **`UNNotificationRequest`** 表示一条要发的通知：标识、内容、什么时候送达。 |
| [`UNNotificationContent`](un-notification-content.md) | **`UNNotificationContent`** 表示一条通知只读的内容：从请求的 `content` 读出来的，包括已经送达的通知和远程推送的通知里的。 |
| [`UNMutableNotificationContent`](un-mutable-notification-content.md) | **`UNMutableNotificationContent`** 表示自己写的一条通知的内容：标题、副标题、正文、角标、声音、分组的标识、跟着通知走的数据。 |
| [`UNNotificationSound`](un-notification-sound.md) | **`UNNotificationSound`** 表示通知到的时候播放的声音。 |
| [`UNNotificationTrigger`](un-notification-trigger.md) | **`UNNotificationTrigger`** 表示一条通知什么时候送达。 |
| [`UNTimeIntervalNotificationTrigger`](un-time-interval-notification-trigger.md) | **`UNTimeIntervalNotificationTrigger`** 表示「过多少秒之后送达」的触发方式。 |
| [`UNCalendarNotificationTrigger`](un-calendar-notification-trigger.md) | **`UNCalendarNotificationTrigger`** 表示「到了和这些日期分量对得上的时刻送达」的触发方式。 |
| [`UNPushNotificationTrigger`](un-push-notification-trigger.md) | **`UNPushNotificationTrigger`** 表示这条通知是远程推送送来的：由服务器经苹果的推送服务送到手机上。 |
| [`UNNotification`](un-notification.md) | **`UNNotification`** 表示一条已经送达的通知。 |
| [`UNNotificationResponse`](un-notification-response.md) | **`UNNotificationResponse`** 表示用户对一条通知做的动作，比如点了它。 |
| [`UNNotificationSettings`](un-notification-settings.md) | **`UNNotificationSettings`** 表示这个 App 的通知设置在某一刻的样子：用户同不同意发通知，声音、角标、锁屏、通知中心等各项开没开。 |
| [`UIImagePickerController`](ui-image-picker-controller.md) | **`UIImagePickerController`** 表示系统的拍照界面。 |
| [`PHPickerViewController`](photos.md) | **`PHPickerViewController`** 表示系统的选图界面。 |
| [`PHPickerConfiguration`](ph-picker-configuration.md) | **`PHPickerConfiguration`** 表示选图界面的配置：最多选几项、显示哪些类型、选中的方式、界面的样子。 |
| [`PHPickerFilter`](ph-picker-filter.md) | **`PHPickerFilter`** 表示选图界面里显示哪些类型，比如只显示图片、只显示视频、图片里去掉截屏。 |
| [`PHPickerResult`](ph-picker-result.md) | **`PHPickerResult`** 表示用户在选图界面里选中的一项。 |
| [`NSItemProvider`](ns-item-provider.md) | **`NSItemProvider`** 表示一项内容的提供者。 |
| [`PHPhotoLibrary`](ph-photo-library.md) | **`PHPhotoLibrary`** 表示系统的相册。 |
| [`CNContactPickerViewController`](contacts.md) | **`CNContactPickerViewController`** 表示系统的选联系人界面。 |
| [`CNContact`](cn-contact.md) | **`CNContact`** 表示通讯录里的一个联系人：姓名、公司、电话、邮箱。 |
| [`CNLabeledValue`](cn-labeled-value.md) | **`CNLabeledValue`** 表示联系人的一个电话或一个邮箱，连同它的标签。 |
| [`CNPhoneNumber`](cn-phone-number.md) | **`CNPhoneNumber`** 表示一个电话号码。 |
| [`CNContactProperty`](cn-contact-property.md) | **`CNContactProperty`** 表示用户在联系人详情里选中的那一项：哪个联系人的哪个字段的哪个值。 |
| [`CNContactFormatter`](cn-contact-formatter.md) | **`CNContactFormatter`** 把联系人的姓名拼成一行。 |
| [`ATTrackingManager`](app-tracking-transparency.md) | **`ATTrackingManager`** 表示用户对「是否允许这个 App 跟踪自己」的答复，并负责向用户提出这个申请。 |
| [`ASIdentifierManager`](as-identifier-manager.md) | **`ASIdentifierManager`** 给出这台设备的广告标识。 |

## 当前 JS 全局环境

`globalThis` 上有 65 个自有属性，且**全部不可枚举**（ECMAScript 的规定）。所以 `Object.keys(globalThis)` 返回空数组不代表环境是空的，要用 `Object.getOwnPropertyNames` 才看得到。

**有**：完整的 ES 标准库，而且版本相当新——`Iterator`（迭代器辅助方法）、`DisposableStack` / `AsyncDisposableStack` / `SuppressedError`（显式资源管理）、`Float16Array`、`Atomics`、`SharedArrayBuffer`、`WeakRef`、`FinalizationRegistry` 都在。`Promise` 和微任务队列正常工作。`eval` 和 `new Function` 在 jitless 下走解释器，照常可用。

运行时装入的**非标准全局**：`console`、`EventTarget` / `Event`（及 `ErrorEvent`、`PromiseRejectionEvent`）、`application`，以及上面那张表里的原生类和结构体类。原生类往后会改成按需懒加载，不再一次性装入。

**没有**（都要靠后续的能力暴露来补）：

| 缺什么 | 原因 |
| --- | --- |
| `crypto.subtle`、`DOMException`、`FormData`、`ReadableStream` | 不是 ECMAScript 的一部分，由宿主提供；V8 只实现语言本身。这几个还没做（`TextEncoder` / `TextDecoder`、`atob` / `btoa`、`structuredClone` 已经补上，见[文字、字节和深拷贝](web-globals.md)） |
| `process`、`require`、`module`、`Buffer` | Node 的宿主 API |
| `Intl` 里 `NumberFormat` 和 `DateTimeFormat` 之外的成员，以及字符串的 `localeCompare` / `toLocaleUpperCase` | 预编译包关掉了 i18n 支持，ICU 被排除。数字和日期已经用系统的格式化接口补上（见 [`Intl`](intl.md)），其余还没做：`'ä'.localeCompare('z')` 按编码值比较 |
| `WebAssembly` | lite mode / jitless 下不能编译 wasm |

---

← 返回[项目说明](../project.md)
