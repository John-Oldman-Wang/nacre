---
type: reference
native: UIView
status: partial
---

# `UIView`

`UIView` 是视图：屏幕上的一块矩形区域。它能显示底色，能包含子视图，能接收触摸。按钮、文字、图片、滚动区域都是它的子类，所以这一页的成员在所有视图上都能用。

它相当于 HTML 的 `<div>`，有四点不同：

- **没有文档流。** 视图不会自动排列，位置和大小要明确给出。新建的视图位置是 `(0, 0)`，宽高是 0，不设大小就看不到。
- **没有 CSS。** 外观用属性设置，比如 `backgroundColor`、`alpha`。圆角、边框、阴影在 `view.layer` 上。
- **没有 `click` 一类的事件。** `UIView` 自己不派发任何事件。要响应点击，用 [`UIButton`](ui-button.md) 或其他 [`UIControl`](ui-control.md)。
- **长度单位是点（pt），不是像素。** 一个点在屏幕上对应 2 × 2 或 3 × 3 个像素，见[单位](units.md)。

这一页分三部分：先给一个[能直接运行的完整例子](#完整例子)，再按[你想做的事](#常见用法)给出写法和效果，最后是[每个成员的说明](#成员说明)。

## 完整例子

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

四个基本步骤是：创建、给位置和大小、设外观、加到父视图上。后面的每种用法都是在这四步上改。

## 常见用法

以下例子都假设已经有上面的 `page`、`card` 和 `dot`。

### 改位置和大小

`frame` 读出来是一个只读的值，不能只改其中一个字段。要改就整体赋一个新的。

```js
const f = card.frame;
card.frame = new CGRect(f.x, f.y + 100, f.width, f.height);
```

**效果**：矩形向下移动 100 pt，大小不变。里面的橙色方块跟着一起移动。

赋值时也可以给普通对象，四个字段必须齐全：

```js
card.frame = { x: 60, y: 270, width: 160, height: 80 };
```

**效果**：矩形移到 `(60, 270)`，变成宽 160 pt、高 80 pt。

写 `card.frame.x = 10` 会抛 `TypeError`，原因见[结构体是只读的值](#结构体是只读的值)。

### 让视图在父视图里居中

`center` 是视图中心点在父视图里的坐标。把它设成父视图的正中。

```js
const size = page.view.bounds;
card.center = new CGPoint(size.width / 2, size.height / 2);
```

**效果**：矩形移到屏幕正中，大小不变。**未在模拟器验证。**

这种写法只在执行的那一刻生效。屏幕旋转后不会自动重新居中。要一直保持居中，用[约束](#用约束定位)。

### 避开刘海和底部横条

屏幕顶部有刘海和状态栏，底部有一条横条。不会被它们遮挡的区域叫**安全区**。`safeAreaInsets` 给出安全区四条边到视图四条边的距离。

```js
const insets = page.view.safeAreaInsets;

const bar = new UIView();
bar.frame = new CGRect(0, insets.top, page.view.bounds.width, 44);
bar.backgroundColor = 'systemTeal';
page.view.addSubview(bar);
```

**效果**：一条高 44 pt 的青色横条，左右铺满屏幕，上边缘紧贴刘海和状态栏的下方，不被遮挡。**未在模拟器验证。**

用约束时不需要读这个数值，直接对齐 `safeAreaLayoutGuide`，见[用约束定位](#用约束定位)。

### 给视图设内边距

`directionalLayoutMargins` 是视图的[内边距](#内边距)，相当于 CSS 的 `padding`。它自己不移动子视图。子视图要用约束对齐 `layoutMarginsGuide`，才会按内边距缩进。

```js
card.directionalLayoutMargins = { top: 12, leading: 20, bottom: 12, trailing: 20 };

const caption = new UILabel();
caption.text = '说明';
caption.translatesAutoresizingMaskIntoConstraints = false;
card.addSubview(caption);

const margins = card.layoutMarginsGuide;
NSLayoutConstraint.activateConstraints([
  caption.topAnchor.constraintEqualToAnchor(margins.topAnchor),
  caption.leadingAnchor.constraintEqualToAnchor(margins.leadingAnchor),
]);

console.log(String(card.directionalLayoutMargins));
```

**效果**：

- 文字「说明」出现在矩形的左上角，距矩形的上边 12 pt、左边 20 pt。**未在模拟器验证。**
- 控制台输出 `NSDirectionalEdgeInsets(12, 20, 12, 20)`。

一组视图要排成一行或一列并带内边距时，用 [`UIStackView`](ui-stack-view.md#给容器加内边距)，不需要写这些约束。

### 调整叠放顺序

同一个父视图里的子视图互相重叠时，后加入的画在上面。

```js
const a = new UIView();
a.frame = new CGRect(40, 300, 120, 120);
a.backgroundColor = 'systemRed';
page.view.addSubview(a);

const b = new UIView();
b.frame = new CGRect(100, 360, 120, 120);
b.backgroundColor = 'systemBlue';
page.view.addSubview(b);
```

**效果**：红色方块和蓝色方块部分重叠，重叠的地方显示蓝色。

把红色的调到最上面：

```js
page.view.bringSubviewToFront(a);
```

**效果**：重叠的地方变成显示红色。**未在模拟器验证。**

加入时直接指定顺序，用 `insertSubview()`：

```js
const c = new UIView();
c.frame = new CGRect(70, 330, 120, 120);
c.backgroundColor = 'systemOrange';
page.view.insertSubview(c, { belowSubview: a });
```

**效果**：橙色方块加入到红色方块的下面一层。

### 移除视图

```js
dot.removeFromSuperview();
```

**效果**：橙色方块从屏幕上消失。`dot.superview` 变成 `null`，`card.subviews` 里不再有它。

`dot` 对象还在，之后可以再 `addSubview()` 加回去。

### 隐藏视图

```js
card.isHidden = true;
```

**效果**：矩形和它里面的子视图都不显示，也不接收触摸。设回 `false` 恢复。**未在模拟器验证。**

隐藏的视图仍然在视图树里，仍然占着自己的 `frame`。只有放在 [`UIStackView`](ui-stack-view.md) 里的视图，隐藏后才会让出位置。

### 设成半透明

```js
card.alpha = 0.5;
```

**效果**：矩形变成半透明，能看到它后面的内容。里面的子视图一起变成半透明。

只想让底色半透明、子视图不受影响，把透明度写在颜色里：

```js
card.alpha = 1;
card.backgroundColor = 'rgba(88, 86, 214, 0.5)';
```

**效果**：矩形的底色半透明，里面的橙色方块仍然不透明。**未在模拟器验证。**

### 加圆角

圆角在视图的图层上设。图层是视图背后负责绘制的对象，通过 `view.layer` 拿到。

```js
card.layer.cornerRadius = 12;
```

**效果**：矩形的四个角变成半径 12 pt 的圆角。

边框和阴影也在图层上，见 [`CALayer`](ca-layer.md)。

### 裁剪超出范围的子视图

子视图超出父视图范围的部分默认照常显示。

```js
dot.frame = new CGRect(180, 100, 40, 40);   // 一半在 card 外面
card.clipsToBounds = true;
```

**效果**：橙色方块只显示位于矩形范围内的那部分，超出的部分不显示。**未在模拟器验证。**

设了圆角之后，要让子视图也按圆角裁剪，同样需要 `clipsToBounds = true`。

### 旋转和缩放

```js
dot.transform = CGAffineTransform.scale(1.2)
  .concat(CGAffineTransform.rotation(Math.PI / 6));
```

**效果**：橙色方块以自己的中心为轴，放大到 1.2 倍，并顺时针旋转 30°。

角度的单位是弧度。恢复原状：

```js
dot.transform = CGAffineTransform.identity;
```

> **注意**：设了变换之后不要再读写 `frame`，改用 `bounds` 和 `center`。原因见[变换和 `frame`](#变换和-frame)。

### 让视图不响应触摸

```js
card.isUserInteractionEnabled = false;
```

**效果**：矩形和它的子视图都不接收触摸。触摸落到它后面的视图上。外观不变。**未在模拟器验证。**

### 用约束定位

除了直接写 `frame`，还可以用约束描述位置：「左边距安全区 16 pt」「高 60 pt」。系统按约束算出 `frame`，屏幕尺寸变化时自动重算。这套机制叫 Auto Layout。

```js
const banner = new UIView();
banner.backgroundColor = 'secondarySystemBackground';
banner.translatesAutoresizingMaskIntoConstraints = false;   // 用约束的视图必须设
page.view.addSubview(banner);

const guide = page.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  banner.leadingAnchor.constraintEqualToAnchor(guide.leadingAnchor, { constant: 16 }),
  banner.trailingAnchor.constraintEqualToAnchor(guide.trailingAnchor, { constant: -16 }),
  banner.bottomAnchor.constraintEqualToAnchor(guide.bottomAnchor, { constant: -24 }),
  banner.heightAnchor.constraintEqualToConstant(60),
]);
```

**效果**：屏幕底部出现一条高 60 pt 的浅灰色横条。它的左右边缘距安全区各 16 pt，下边缘在安全区底边上方 24 pt。

约束的全部写法见 [Auto Layout](auto-layout.md)。

### 读出约束算出来的位置

约束不是立刻生效的，系统在下一次布局时才计算。想马上读到结果，先调 `layoutIfNeeded()`。

```js
page.view.layoutIfNeeded();
console.log(banner.frame.width, banner.frame.height);
```

**效果**：控制台输出横条的宽和高。高是 `60`，宽是安全区的宽度减 32。

### 量出内容需要多大

文字、按钮这类视图知道自己的内容需要多大。`sizeThatFits()` 询问「最多给你这么大，你需要多大」，立刻返回结果，不改变视图。

```js
const label = new UILabel();
label.text = 'Hello, Nacre';

const need = label.sizeThatFits(new CGSize(300, 1000));
label.frame = new CGRect(40, 500, need.width, need.height);
page.view.addSubview(label);
```

**效果**：屏幕上出现一行文字，视图的大小刚好等于文字的大小。

`label.sizeToFit()` 一步完成「量出大小并改成这个大小」，位置不变。

### 查某个位置上是哪个视图

```js
const hit = page.view.hitTest(new CGPoint(50, 130));
if (hit) {
  console.log(hit === card);
}
```

**效果**：`(50, 130)` 这个点在矩形内，并且不在橙色方块内，控制台输出 `true`。**未在模拟器验证。**

这个点上没有任何视图时返回 `null`。

### 用编号找视图

给视图设一个整数编号，之后从任意一级祖先上把它找出来。

```js
dot.tag = 42;

const found = page.view.viewWithTag(42);
if (found) {
  found.backgroundColor = 'systemRed';
}
```

**效果**：橙色方块变成红色。

找不到时返回 `null`。

### 收起键盘

```js
page.view.endEditing(true);
```

**效果**：如果这个视图里面有正在输入的输入框，输入框失去焦点，键盘收起。输入框见[输入框和键盘](ui-text-field.md)。

## 概念

### `frame`、`bounds` 和 `center`

三个属性都描述视图的位置和大小，区别在于参照的坐标系。

| 属性 | 参照谁的坐标系 | 是什么 | Web 里的对应物 |
| --- | --- | --- | --- |
| `frame` | 父视图 | 视图在父视图里占的矩形 | `offsetLeft`、`offsetTop`、`offsetWidth`、`offsetHeight` |
| `bounds` | 自己 | 视图自己的矩形。左上角通常是 `(0, 0)`，宽高和 `frame` 相同 | `clientWidth`、`clientHeight` |
| `center` | 父视图 | 视图中心点的位置 | 没有 |

坐标原点在左上角，`x` 向右增大，`y` 向下增大。

子视图的 `frame` 相对父视图的左上角，不是相对屏幕。移动父视图，子视图跟着移动，子视图的 `frame` 不变。

日常用法：摆放一个视图用 `frame`。想知道一个视图有多大（比如铺满它），读它的 `bounds`。

### 视图树和叠放顺序

视图组成一棵树。每个视图最多有一个父视图（`superview`），可以有任意多个子视图（`subviews`）。

- `subviews` 的顺序就是绘制顺序，排在后面的画在上面。没有 `z-index`，叠放顺序只由这个顺序决定。
- 把一个已经有父视图的视图加到另一个父视图上，它会自动从原来的父视图里移除。
- 树的根是窗口（[`UIWindow`](ui-window.md)）。视图加到窗口下面才会显示，这时它的 `window` 属性有值；否则是 `null`。
- 页面（[`UIViewController`](ui-view-controller.md)）自带一个根视图 `page.view`，页面的内容都加在它下面。

不用自己保留子视图的引用。视图加到树上之后，由父视图持有。

### 两种定位方式

| 方式 | 写法 | 特点 |
| --- | --- | --- |
| 直接写 `frame` | `view.frame = new CGRect(…)` | 相当于 CSS 的绝对定位。位置是固定的数值，屏幕尺寸变了要自己重算 |
| 约束（Auto Layout） | `NSLayoutConstraint.activateConstraints([…])` | 描述视图之间的关系，系统算出 `frame`，并在尺寸变化时重算 |

一个视图只用其中一种：

- 用约束的视图，先设 `translatesAutoresizingMaskIntoConstraints = false`。这个属性默认是 `true`，意思是「按 `frame` 摆放」。不改的话，系统按 `frame` 生成的约束会和你写的约束冲突，表现是约束写对了但位置不变。
- 用了约束的视图，不要再写 `frame`。下一次布局时系统会用约束的结果覆盖它。
- 页面的根视图 `page.view` 和窗口由系统摆放，不要改它们的这个属性。

约束里用到两种对象：

- **锚点**（anchor）：代表视图的一条边、中心线或宽高，比如 `view.leadingAnchor`。约束写的是两个锚点之间的关系。
- **layout guide**：一个不显示的矩形，只用来对齐。`view.safeAreaLayoutGuide` 就是代表安全区的那一个。

详见 [Auto Layout](auto-layout.md)。

### 安全区

安全区是视图里不会被刘海、状态栏、屏幕圆角和底部横条遮挡的区域。

Web 里的对应物是 CSS 的 `env(safe-area-inset-top)` 这一组值。差别是这里每个视图都有自己的一份，数值按这个视图的范围计算。

读取方式有两种：

| 方式 | 用在哪里 |
| --- | --- |
| `view.safeAreaInsets` | 用 `frame` 定位时。四个数值，单位 pt |
| `view.safeAreaLayoutGuide` | 用约束定位时。直接和它的锚点对齐 |

底色和背景图通常铺满整个屏幕，文字和按钮放在安全区内。

### 内边距

每个视图有一组内边距，表示内容应该离视图的四条边多远。Web 里的对应物是 CSS 的 `padding`。有四点不同：

- **它不会自动缩进子视图。** 用到它的只有两处：对齐 `layoutMarginsGuide` 的约束，以及开了 `isLayoutMarginsRelativeArrangement` 的 [`UIStackView`](ui-stack-view.md#给容器加内边距)。用 `frame` 定位的子视图不受影响。
- **默认值不是 0。** 新建的视图四边各 8 pt。
- **视图伸到[安全区](#安全区)外面时，系统会把安全区加到内边距上。** 写 16 pt、上方的安全区是 68 pt，读出来的上边距是 84 pt。要写多少就是多少，把 `insetsLayoutMarginsFromSafeArea` 设成 `false`。
- **页面的根视图有系统规定的最小边距。** 给 `page.view` 写的内边距小于最小值时，读出来是最小值。**未在模拟器验证。** 这个限制现在关不掉，见[还不能做的](#还不能做的)。

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

`transform` 是一个二维仿射变换，相当于 CSS 的 `transform`。变换以视图的中心为原点，只改变画出来的样子，不改变 `bounds` 和 `center`。

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

变换的构造方法见[结构体](structs.md#cgaffinetransform)。

### 结构体是只读的值

`frame`、`bounds`、`center`、`transform`、`safeAreaInsets`、`layoutMargins`、`directionalLayoutMargins` 的类型是 `CGRect`、`CGPoint` 这类结构体。结构体是值，不是对视图的引用：

- 每次读属性得到一个新的对象。
- 字段不能改。写 `view.frame.x = 10` 抛 `TypeError: x is read-only: structs are values, assign a whole new one instead`。
- 要改就给属性整体赋一个新值。赋值时可以用 `new CGRect(…)`，也可以用字段齐全的普通对象。

详见[结构体](structs.md)。

## 成员说明

### 继承关系

```
EventTarget → NSObject → UIResponder → UIView
```

`UIView` 的子类：[`UIWindow`](ui-window.md)、[`UILabel`](ui-label.md)、[`UIImageView`](ui-image.md)、[`UIControl`](ui-control.md)（[`UIButton`](ui-button.md)、[`UITextField`](ui-text-field.md)）、[`UIScrollView`](ui-scroll-view.md)、[`UIStackView`](ui-stack-view.md)。

`UIView` 自己不派发任何事件。本页的所有属性都没有变化通知，原因是布局和层级变化的通知还没有实现，见[还不能做的](#还不能做的)。

### 创建

#### `new UIView()`

创建一个视图。没有参数。

```js
const view = new UIView();
```

- 新视图的 `frame` 是 `(0, 0, 0, 0)`，没有底色，没有父视图。
- **出错**：`UIView` 不能被继承。`class Card extends UIView {}` 之后 `new Card()` 抛 `TypeError: Illegal constructor: Card extends UIView, but subclassing native classes is not supported yet`。要给视图附加自己的逻辑，用组合，见[原生类](native-classes.md#不能继承)。

### 几何

#### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `frame` | [`CGRect`](structs.md#cgrect) | 是 | 是 | `(0, 0, 0, 0)` | 视图在父视图坐标系里的位置和大小，单位 [pt](units.md) |
| `bounds` | [`CGRect`](structs.md#cgrect) | 是 | 是 | `(0, 0, 0, 0)` | 视图在自己坐标系里的矩形，单位 [pt](units.md)。宽高和 `frame` 相同 |
| `center` | `CGPoint` | 是 | 是 | `(0, 0)` | 视图中心点在父视图坐标系里的位置，单位 [pt](units.md) |
| `transform` | [`CGAffineTransform`](structs.md#cgaffinetransform) | 是 | 是 | 单位矩阵 | 二维仿射变换，以视图中心为原点。见[变换和 `frame`](#变换和-frame) |
| `safeAreaInsets` | `UIEdgeInsets` | 是 | 否 | 由系统决定 | [安全区](#安全区)的四条边到视图四条边的距离，单位 [pt](units.md)。字段是 `top`、`left`、`bottom`、`right` |
| `directionalLayoutMargins` | `NSDirectionalEdgeInsets` | 是 | 是 | `(8, 8, 8, 8)` | [内边距](#内边距)，单位 [pt](units.md)。字段是 `top`、`leading`、`bottom`、`trailing` |
| `layoutMargins` | `UIEdgeInsets` | 是 | 是 | `(8, 8, 8, 8)` | 同一份[内边距](#内边距)，单位 [pt](units.md)。字段是 `top`、`left`、`bottom`、`right` |
| `insetsLayoutMarginsFromSafeArea` | 布尔 | 是 | 是 | `true` | `true`：视图伸到[安全区](#安全区)外面的那几条边，内边距读出来是写入的值加上安全区。`false`：读出来就是写入的值 |
| `preservesSuperviewLayoutMargins` | 布尔 | 是 | 是 | `false` | `true`：父视图的内边距比自己的大时，采用父视图的。`false`：只用自己的。设成 `true` 之后的效果**未在模拟器验证** |
| `intrinsicContentSize` | `CGSize` | 是 | 否 | `(-1, -1)` | 视图按内容算出的固有大小，单位 [pt](units.md)。普通 `UIView` 没有内容，返回 `(-1, -1)`，表示没有固有大小。`UILabel` 返回文字的大小 |

- 写入 `frame`、`bounds`、`center`、`transform`、`layoutMargins`、`directionalLayoutMargins` 时可以给结构体对象，也可以给字段齐全的普通对象。
- 内边距没有变化通知。系统改动它的情况有两种：安全区变了，或者开了 `preservesSuperviewLayoutMargins` 而父视图的内边距变了。得知这两种变化需要先支持用 JS 继承原生类，见[还不能做的](#还不能做的)。
- **出错**（以 `frame` 为例，其他属性把开头的名字换成属性名）：
  - 给的不是对象：`TypeError: frame needs an object with all of: x, y, width, height`
  - 缺字段，或字段不是有限的数：`TypeError: frame is missing height, or it is not a finite number`

#### `sizeThatFits(size)`

询问视图：在不超过 `size` 的前提下，显示全部内容需要多大。不改变视图。

```js
const need = label.sizeThatFits(new CGSize(300, 1000));
```

- **`size`**：`CGSize` 或 `{ width, height }`，可用的最大空间，单位 [pt](units.md)。
- **返回**：`CGSize`，单位 [pt](units.md)。同步返回，不是 Promise。
- **出错**：`size` 缺字段时抛 `TypeError: sizeThatFits is missing width, or it is not a finite number`。

它问的是视图自己的内容。要按子视图之间的约束算大小，用 [`systemLayoutSizeFittingSize()`](auto-layout.md#算尺寸)。

#### `sizeToFit()`

把视图的大小改成刚好容纳内容的大小。没有参数，没有返回值。

#### `convertPoint(point, options)` 和 `convertRect(rect, options)`

把一个点或一个矩形从一个视图的坐标系换算到另一个视图的坐标系。

```js
const inPage = dot.convertPoint(new CGPoint(0, 0), { toView: page.view });
const inDot = dot.convertPoint(new CGPoint(56, 176), { fromView: page.view });
```

| `options` | 含义 |
| --- | --- |
| `{ toView: other }` | `point` 在调用者的坐标系里，换算到 `other` 的坐标系 |
| `{ fromView: other }` | `point` 在 `other` 的坐标系里，换算到调用者的坐标系 |

- **`point` / `rect`**：`CGPoint` 或 `{ x, y }`；`CGRect` 或 `{ x, y, width, height }`。单位 [pt](units.md)。
- **`toView` / `fromView`**：一个 `UIView`，或者 `null`。`null` 表示窗口的坐标系。
- **返回**：换算后的 `CGPoint` 或 `CGRect`。
- **出错**：`options` 里两个键都没有时抛 `TypeError: convertPoint needs { toView } or { fromView }`（`convertRect` 同理）。

#### `hitTest(point)`

找出 `point` 这个位置上最上层的、能接收触摸的视图。查找范围是调用者自己和它的所有后代。

- **`point`**：`CGPoint` 或 `{ x, y }`，在调用者的坐标系里，单位 [pt](units.md)。
- **返回**：命中的 `UIView`；没有命中返回 `null`。
- 隐藏的视图、`isUserInteractionEnabled` 为 `false` 的视图不会被命中。**未在模拟器验证。**

### 层级

#### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `superview` | `UIView` 或 `null` | 是 | 否 | `null` | 父视图。没有加到任何视图上时是 `null` |
| `subviews` | `UIView` 的只读数组 | 是 | 否 | 空数组 | 子视图，按绘制顺序排列，后面的画在上面。每次读得到一个新数组，改这个数组不影响视图 |
| `window` | [`UIWindow`](ui-window.md) 或 `null` | 是 | 否 | `null` | 视图所在的窗口。视图没有连到窗口时是 `null` |

写只读属性（比如 `view.superview = null`）抛 `TypeError`。

#### 方法

| 方法 | 作用 | 返回 |
| --- | --- | --- |
| `addSubview(view)` | 把 `view` 加为子视图，排在最后，也就是最上层 | 无 |
| `insertSubview(view, { atIndex })` | 加为子视图，放在 `subviews` 的第 `atIndex` 位。`atIndex` 是从 0 开始的序号，0 是最下层 | 无 |
| `insertSubview(view, { belowSubview })` | 加为子视图，放在 `belowSubview` 的下面一层 | 无 |
| `insertSubview(view, { aboveSubview })` | 加为子视图，放在 `aboveSubview` 的上面一层 | 无 |
| `removeFromSuperview()` | 把自己从父视图里移除。涉及它的约束一起被移除 | 无 |
| `bringSubviewToFront(view)` | 把子视图 `view` 调到最上层 | 无 |
| `sendSubviewToBack(view)` | 把子视图 `view` 调到最下层 | 无 |
| `isDescendantOfView(view)` | 自己是不是 `view` 的后代。`view` 就是自己时也返回 `true` | 布尔 |
| `viewWithTag(tag)` | 在自己和所有后代里找 `tag` 等于给定值的视图 | `UIView` 或 `null` |

```js
page.view.insertSubview(card, { atIndex: 0 });
```

- `view` 已经有父视图时，`addSubview()` 和 `insertSubview()` 会先把它从原来的父视图里移除。
- **出错**：
  - `insertSubview()` 的 `options` 里三个键都没有：`TypeError: insertSubview needs one of { atIndex } / { belowSubview } / { aboveSubview }`
  - 参数是一个还没有绑定场景的窗口（`new UIWindow()` 不传参数得到的对象）：`TypeError: addSubview:: UIWindow has no native object yet, so it cannot be passed as an argument`

> **注意**：参数是别的类型的原生对象时（比如把一个 `CALayer` 传给 `addSubview()`），调用不报错，也不做任何事。类型检查能发现这种错误，运行时不能。

### 手势识别器

手势识别器是加在视图上的对象，让普通视图也能响应点按和长按。完整说明见[手势识别器](ui-gesture-recognizer.md)。

| 成员 | 说明 |
| --- | --- |
| `addGestureRecognizer(recognizer)` | 把识别器加到视图上。没有返回值。识别器原来在别的视图上时，先从那个视图上移除 |
| `removeGestureRecognizer(recognizer)` | 把识别器从视图上拿掉。没有返回值 |
| `gestureRecognizers` | 只读。视图上全部识别器的数组，没有时是空数组。每次读得到一个新数组 |

```js
const tap = new UITapGestureRecognizer();
tap.addEventListener('ended', () => {
  console.log('点了');
});
card.addGestureRecognizer(tap);
```

**效果**：点矩形时输出 `点了`。

- **出错**：参数不是识别器：`TypeError: addGestureRecognizer needs a UIGestureRecognizer`

### 外观

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `backgroundColor` | [颜色](ui-color.md)字符串或 `null` | 是 | 是 | `null` | 底色。`null` 表示透明。写入时也接受 `UIColor` 对象 |
| `alpha` | 数 | 是 | 是 | `1` | 不透明度，0 到 1 的比例。`0` 完全透明，`1` 完全不透明。对子视图同样生效 |
| `isHidden` | 布尔 | 是 | 是 | `false` | `true`：视图和它的子视图不显示，不接收触摸。`false`：正常显示 |
| `clipsToBounds` | 布尔 | 是 | 是 | `false` | `true`：子视图超出本视图范围的部分不显示。`false`：超出的部分照常显示 |
| `isOpaque` | 布尔 | 是 | 是 | `true` | 给系统的绘制提示，不改变外观。`true`：声明视图的内容完全不透明，系统可以不画它后面的内容。`false`：系统按可能透明处理 |
| `isUserInteractionEnabled` | 布尔 | 是 | 是 | `true` | `true`：视图接收触摸。`false`：视图和它的子视图都不接收触摸 |
| `tag` | 整数 | 是 | 是 | `0` | 自己定的编号，没有单位。配合 `viewWithTag()` 查找视图 |
| `contentMode` | 字符串 | 是 | 是 | `'scaleToFill'` | 视图的内容和视图大小不一致时怎么摆放，取值见下表。主要用在 [`UIImageView`](ui-image.md) 上 |
| `layer` | [`CALayer`](ca-layer.md) | 是 | 否 | — | 视图的图层。圆角、边框、阴影在它上面设。每个视图对应一个图层，多次读取得到同一个对象 |

- `alpha` 读回来的值和写入的值可能有微小差别：写 `0.6`，读回 `0.6000000238418579`。比较时要留容差。
- `backgroundColor` 写入不合法的颜色时不抛错。控制台输出一条警告，比如 `[Nacre] backgroundColor: "#GGG" is not a valid color, ignored`，颜色保持原值。
- `contentMode` 写入下表以外的值时抛 `TypeError: contentMode has no value "cover"; expected one of: …`。

`contentMode` 的取值。「内容」指视图画出来的东西，比如 `UIImageView` 里的图片：

| 取值 | 效果 |
| --- | --- |
| `'scaleToFill'` | 把内容拉伸到和视图一样大。宽高比不同时内容变形 |
| `'scaleAspectFit'` | 保持宽高比缩放，直到内容完整地放进视图。两边可能留空 |
| `'scaleAspectFill'` | 保持宽高比缩放，直到内容盖满视图。超出的部分画在视图外面，要裁剪需设 `clipsToBounds = true` |
| `'center'` | 不缩放，内容按原始大小居中 |
| `'top'`、`'bottom'`、`'left'`、`'right'` | 不缩放，内容贴着对应的那条边，在另一个方向上居中。**未在模拟器验证** |
| `'topLeft'`、`'topRight'`、`'bottomLeft'`、`'bottomRight'` | 不缩放，内容贴着对应的那个角。**未在模拟器验证** |
| `'redraw'` | 视图大小变化时重新绘制内容，不做缩放。**未在模拟器验证** |

### 布局和重绘

系统不会在每次属性变化后立刻重新布局，而是做一个标记，在主线程这一轮任务结束时统一处理。下面三个方法控制这个过程，都没有参数，没有返回值。

| 方法 | 作用 |
| --- | --- |
| `setNeedsLayout()` | 标记这个视图需要重新布局。布局在稍后进行，不是立刻 |
| `layoutIfNeeded()` | 如果有待处理的布局，立刻完成。调用之后读 `frame` 得到的是约束算出的结果 |
| `setNeedsDisplay()` | 标记这个视图需要重新绘制 |

### 键盘

#### `endEditing(force)`

让这个视图和它的后代里正在输入的那个输入框失去焦点，键盘随之收起。

- **`force`**：布尔，可省略，省略时是 `false`。`false`：输入框可以拒绝失去焦点。`true`：强制失去焦点。
- **返回**：布尔。`true` 表示输入框已经失去焦点。

以下成员继承自 `UIResponder`，说明见[输入框和键盘](ui-text-field.md)：`becomeFirstResponder()`、`resignFirstResponder()`、`isFirstResponder`、`canBecomeFirstResponder`。

### Auto Layout

这一节只列出 `UIView` 上和约束有关的成员。用法和例子见 [Auto Layout](auto-layout.md)。

#### 开关

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `translatesAutoresizingMaskIntoConstraints` | 布尔 | 是 | 是 | `true` | `true`：系统按 `frame` 摆放这个视图。`false`：这个视图由你写的约束摆放。用约束的视图必须设成 `false` |

把视图加进 [`UIStackView`](ui-stack-view.md) 的排列时，系统自动把它设成 `false`。

#### 锚点

锚点代表视图的一条边、一条中心线或一个尺寸，用来建约束。12 个锚点都是只读属性，不能自己构造。同一个视图上多次读取得到同一个对象。

| 属性 | 类型 | 代表 |
| --- | --- | --- |
| `leadingAnchor` | `NSLayoutXAxisAnchor` | 起始边。从左往右书写的语言里是左边，从右往左的语言里是右边 |
| `trailingAnchor` | `NSLayoutXAxisAnchor` | 结束边，和 `leadingAnchor` 相对 |
| `leftAnchor` | `NSLayoutXAxisAnchor` | 左边，不随书写方向变 |
| `rightAnchor` | `NSLayoutXAxisAnchor` | 右边，不随书写方向变 |
| `centerXAnchor` | `NSLayoutXAxisAnchor` | 水平方向的中心线 |
| `topAnchor` | `NSLayoutYAxisAnchor` | 上边 |
| `bottomAnchor` | `NSLayoutYAxisAnchor` | 下边 |
| `centerYAnchor` | `NSLayoutYAxisAnchor` | 垂直方向的中心线 |
| `firstBaselineAnchor` | `NSLayoutYAxisAnchor` | 第一行文字的基线 |
| `lastBaselineAnchor` | `NSLayoutYAxisAnchor` | 最后一行文字的基线 |
| `widthAnchor` | `NSLayoutDimension` | 宽度 |
| `heightAnchor` | `NSLayoutDimension` | 高度 |

三种类型的锚点不能互相建约束，比如上边不能和左边对齐。详见[锚点](auto-layout.md#锚点边的对象化)。

#### layout guide

layout guide 是不显示的矩形，有自己的一组锚点，只用来对齐。下面四个由系统提供，都是只读属性。

| 属性 | 类型 | 代表的区域 |
| --- | --- | --- |
| `safeAreaLayoutGuide` | `UILayoutGuide` | [安全区](#安全区) |
| `layoutMarginsGuide` | `UILayoutGuide` | 视图四边各向内缩进[内边距](#内边距)之后的区域 |
| `readableContentGuide` | `UILayoutGuide` | 适合阅读长文字的宽度范围。视图很宽时它比视图窄 |
| `keyboardLayoutGuide` | `UIKeyboardLayoutGuide` | 键盘占的区域。键盘收起时它的上边在安全区的底边，键盘弹出时在键盘的顶边。用法见[键盘避让](ui-text-field.md#键盘避让一条约束) |

自己建的 layout guide 要先加到视图上才能用：

| 成员 | 类型 / 返回 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `layoutGuides` | `UILayoutGuide` 的只读数组 | 是 | 否 | 加在这个视图上的 layout guide。不包括上面四个系统提供的 |
| `addLayoutGuide(guide)` | 无 | — | — | 把 `guide` 加到这个视图上 |
| `removeLayoutGuide(guide)` | 无 | — | — | 把 `guide` 从这个视图上移除 |

详见 [`UILayoutGuide`](auto-layout.md#uilayoutguide)。

#### 约束

| 成员 | 类型 / 返回 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `constraints` | `NSLayoutConstraint` 的只读数组 | 是 | 否 | 存放在这个视图上的约束。它不等于「影响这个视图的约束」：两个视图之间的约束存放在它们最近的共同祖先上 |

#### 内容优先级

有固有大小的视图（文字、按钮）用两个优先级表示它多大程度上坚持这个大小。优先级是 1 到 1000 的无单位数，越大越坚持。两个方向（`'horizontal'` 水平、`'vertical'` 垂直）分别设置。

| 方法 | 作用 | 返回 |
| --- | --- | --- |
| `contentHuggingPriorityForAxis(axis)` | 读「不愿被拉大」的优先级 | 数。默认 `250` |
| `setContentHuggingPriority(priority, { forAxis })` | 设「不愿被拉大」的优先级 | 无 |
| `contentCompressionResistancePriorityForAxis(axis)` | 读「不愿被压小」的优先级 | 数。默认 `750` |
| `setContentCompressionResistancePriority(priority, { forAxis })` | 设「不愿被压小」的优先级 | 无 |

```js
label.setContentHuggingPriority('defaultLow', { forAxis: 'horizontal' });
label.contentHuggingPriorityForAxis('horizontal');   // 250
```

- **`priority`**：数，或者优先级的名字：`'required'`（1000）、`'defaultHigh'`（750）、`'dragThatCanResizeScene'`（510）、`'sceneSizeStayPut'`（500）、`'dragThatCannotResizeScene'`（490）、`'defaultLow'`（250）、`'fittingSizeLevel'`（50）。读出来永远是数。
- **出错**：
  - 没传 `forAxis`：`TypeError: setContentHuggingPriority needs { forAxis }`
  - 方向写错：`TypeError: forAxis has no value "diagonal"; expected one of: …`（读取的两个方法报 `axis has no value …`）
  - 优先级的名字写错：`TypeError: priority has no value "veryImportant"; expected one of: …`

详见[内容抱紧和抗压缩](auto-layout.md#内容抱紧和抗压缩)。

#### 按约束算大小

| 方法 | 作用 | 返回 |
| --- | --- | --- |
| `systemLayoutSizeFittingSize(size)` | 按这个视图和它的后代上的约束，算出视图应该多大 | `CGSize`，单位 [pt](units.md) |
| `systemLayoutSizeFittingSize(size, { withHorizontalFittingPriority, verticalFittingPriority })` | 同上，并指定水平和垂直方向上贴近 `size` 的优先级 | `CGSize`，单位 [pt](units.md) |
| `invalidateIntrinsicContentSize()` | 通知系统这个视图的固有大小变了，下次布局时重新读取 | 无 |

`size` 是 `CGSize` 或 `{ width, height }`。传 `new CGSize(0, 0)` 表示求满足约束的最小尺寸。详见[算尺寸](auto-layout.md#算尺寸)。

#### 调试

约束有冲突或不完整时，系统不在控制台输出任何信息。用下面三个成员检查。

| 成员 | 类型 / 返回 | 含义 |
| --- | --- | --- |
| `hasAmbiguousLayout` | 布尔，只读 | `true`：约束不够，这个视图的位置或大小有多种可能的结果。`false`：结果唯一 |
| `exerciseAmbiguityInLayout()` | 无 | 让视图在几种可能的结果之间切换一次，方便用眼睛看出哪里约束不够。**效果未在模拟器验证** |
| `constraintsAffectingLayoutForAxis(axis)` | `NSLayoutConstraint` 的只读数组 | 在 `'horizontal'` 或 `'vertical'` 方向上，实际影响这个视图的所有约束 |

详见[排版调试](auto-layout.md#排版调试)。

### 通用的出错情况

| 情况 | 报错 |
| --- | --- |
| 在还没有绑定场景的窗口上读写属性或调方法（`new UIWindow()` 不传参数，并且还没给 `windowScene` 赋值） | `TypeError: frame: this object is not connected to a scene yet, so no native object exists`，开头是属性名或方法名 |
| 在不是由构造函数创建的对象上调用（比如 `Object.create(UIView.prototype)`） | `TypeError: frame: Illegal invocation` |

详见[原生类](native-classes.md#三种没有原生对象话术不同)。

> **注意**：属性名拼错时不报错。`view.backgroundColour = 'red'` 只是在 JS 对象上加了一个普通属性，视图不变。类型检查能发现这种错误。

## 与 iOS 原生写法的对照

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
| `view.hidden = YES` | `view.isHidden = true` |
| `view.opaque = NO` | `view.isOpaque = false` |
| `view.userInteractionEnabled = NO` | `view.isUserInteractionEnabled = false` |
| `view.contentMode = UIViewContentModeScaleAspectFit` | `view.contentMode = 'scaleAspectFit'` |
| `[view setContentHuggingPriority:UILayoutPriorityDefaultLow forAxis:UILayoutConstraintAxisHorizontal]` | `view.setContentHuggingPriority('defaultLow', { forAxis: 'horizontal' })` |

规则有两条：

- ObjC 里声明成 `getter=isXxx` 的布尔属性，JS 用 `isXxx` 这个名字读和写，比如 `isHidden`。
- 多段的方法名，第一段是 JS 的方法名，其余各段是 `options` 对象的键。

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 视图的位置或大小变化时收到通知 | 覆写 `layoutSubviews` | 未实现。需要先支持用 JS 继承原生类 |
| 视图被加入、移除时收到通知 | `didAddSubview:`、`willMoveToWindow:` 等 | 未实现。需要先支持用 JS 继承原生类 |
| 自己绘制视图的内容 | `drawRect:` | 未实现。需要先支持用 JS 继承原生类。画线和形状可以用 [`CAShapeLayer`](ca-layer.md#cashapelayer) |
| 直接接收触摸 | `touchesBegan:withEvent:` 等 | 未实现。需要先支持用 JS 继承原生类 |
| 识别拖动、捏合、轻扫 | `UIPanGestureRecognizer` 等 | 未实现。点按和长按见[手势识别器](ui-gesture-recognizer.md) |
| 用一段代码块做属性动画 | `+[UIView animateWithDuration:animations:]` | 未实现。动画可以用 [Core Animation](ca-animation.md) |
| 三维变换 | `transform3D`、`CATransform3D` | 未实现 |
| 用一个视图的形状遮住另一个视图 | `maskView` | 未实现 |
| 内边距变化时收到通知 | 覆写 `layoutMarginsDidChange` | 未实现。需要先支持用 JS 继承原生类 |
| 去掉页面根视图的最小内边距 | `UIViewController` 的 `viewRespectsSystemMinimumLayoutMargins`、`systemMinimumLayoutMargins` | 未实现 |
| 让视图跟着父视图的大小自动伸缩（不用约束） | `autoresizingMask` | 未实现 |
| 设置视图和子视图的主题色 | `tintColor` | 只在 `UIImageView` 上有 |
| 读取深浅色模式，或让某个视图固定用深色或浅色 | `traitCollection`、`overrideUserInterfaceStyle` | 未实现 |

## 参见

- [Auto Layout](auto-layout.md)：用约束定位的全部写法
- [结构体](structs.md)：`CGRect`、`CGPoint`、`CGSize`、`UIEdgeInsets`、`CGAffineTransform`
- [`UIStackView`](ui-stack-view.md)：按内边距缩进排列项的容器
- [手势识别器](ui-gesture-recognizer.md)：让普通视图响应点按和长按
- [`CALayer`](ca-layer.md)：圆角、边框、阴影、渐变
- [颜色](ui-color.md)：`backgroundColor` 能写哪些值
- [单位](units.md)：pt 是什么
- [`UIWindow`](ui-window.md) 和 [`UIViewController`](ui-view-controller.md)：视图树的根和页面
- [`UIStackView`](ui-stack-view.md)：把一组视图排成一行或一列
- [原生类](native-classes.md)：为什么不能继承，以及几种「没有原生对象」的报错
- [实现原理：桥接](../internals/bridge.md)

← 返回 [API 文档](README.md)
