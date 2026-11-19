# 在屏幕上摆放视图

这一篇讲怎么用 [`UIView`](../api/ui-view.md) 在屏幕上放出东西：创建视图、给位置和大小、设外观、加到视图树上，以及调整叠放顺序、隐藏、移除、圆角、裁剪、变换、响应点按。每个属性和方法的细节在 [`UIView`](../api/ui-view.md) 的参考页。动画见[让视图动起来](view-animations.md)，约束的全部写法见[用约束排版](auto-layout.md)。

## 推荐的做法

位置和大小有两种写法：直接给 `frame` 赋一个矩形，或者写约束（Auto Layout）。

**推荐用约束。** `frame` 是执行那一行代码时写入的固定数值，之后不会自己变。屏幕宽度因机型而不同，安全区的大小因机型和页面所处的位置而不同，按一种屏幕宽度写出的固定坐标在另一种屏幕上会错位。实测：按 420 pt 宽的屏幕写出的一组固定坐标，放到 390 pt 宽的 iPhone 14 上，最右一列被切掉。约束描述的是视图之间的关系（「左边距安全区 16 pt」），系统按当前的屏幕算出结果，父视图的大小或安全区变化时重新计算。

`frame` 适用于两种情况：

- 父视图的大小是固定的，子视图在里面的位置也是固定的。比如一个 44 × 44 pt 的图标容器里的小圆点。
- 位置是代码在某一刻算出来的，之后由代码自己更新。比如由定时器或[每帧回调](../api/ca-animation.md)驱动移动的视图。

代价是父视图的大小变化时，要由代码重新给 `frame` 赋值。

一个视图只用一种写法，规则见[两种定位方式](../api/ui-view.md#两种定位方式)。

## 第一个例子

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

这个例子用 `frame` 定位，因为两个矩形的位置和大小都是固定的数值。位置要跟着屏幕大小变化的视图用约束，见[用约束定位](#用约束定位)。

回调结束后 `card` 和 `dot` 这两个变量不再存在，两个视图仍然显示：它们在视图树上，由父视图保管。

## 新建的视图为什么看不见

`new UIView()` 得到的视图有三个默认状态，任何一个不改，屏幕上都看不到它：

| 默认状态 | 结果 | 怎么改 |
| --- | --- | --- |
| `frame` 是 `(0, 0, 0, 0)` | 宽高是 0 pt，没有面积 | 给 `frame` 赋值，或者用约束定出位置和大小 |
| `backgroundColor` 是 `null` | 视图是透明的。它有大小，也能包含子视图，但自己不画任何东西 | 给 `backgroundColor` 赋一个颜色。只用来放子视图的容器可以保持透明 |
| 没有父视图 | 不在任何窗口里，不显示 | 用 `addSubview()` 加到一个已经在窗口里的视图上，通常是页面的根视图 `page.view` |

用约束定位的视图还有第四种情况：没有把 `translatesAutoresizingMaskIntoConstraints` 设成 `false`。这时约束写对了，视图的位置和大小也不变，见[两种定位方式](../api/ui-view.md#两种定位方式)。

约束写错或者写得不够时，系统不在控制台输出任何信息。用 [`hasAmbiguousLayout`](../api/ui-view/hasambiguouslayout.md)、[`exerciseAmbiguityInLayout()`](../api/ui-view/exerciseambiguityinlayout.md)、[`constraintsAffectingLayoutForAxis()`](../api/ui-view/constraintsaffectinglayoutforaxis.md) 检查。

## 视图由谁保管

**加到视图树上的视图不需要保存在变量里。** 父视图保管它的子视图：只要视图还在窗口的视图树里，它就不会被回收，挂在它上面的事件监听和自定义属性都保留。之后要用它，从 `superview`、`subviews` 或 `viewWithTag()` 读到的是同一个对象。

从父视图移除之后，视图是否还存在取决于 App 的代码有没有保存它：

| 情况 | 结果 |
| --- | --- |
| 有变量保存着它 | 视图还在，属性都保留。可以再用 `addSubview()` 加回去。**加回去这一步未在模拟器验证** |
| 没有任何变量保存它 | 视图连同它的子视图、事件监听一起被回收。不需要先调 `removeEventListener()` |

所以推荐的做法是：要丢弃一块界面时，调 `removeFromSuperview()`，并且不再保存它；需要时按数据重新建。只有重建代价大的视图才保存在变量里反复使用，代价是它一直占着内存。

把视图保存在 `sceneconnect` 回调外面的变量里时，场景被销毁后这个视图不会被回收，见 [`UIWindowScene`](scenes-and-windows.md#推荐的做法)。

以下各节沿用第一个例子里的 `page`、`card` 和 `dot`。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const card = new UIView();
page.view.addSubview(card);
const dot = new UIView();
card.addSubview(dot);
```

## 改位置和大小

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

写 `card.frame.x = 10` 会抛 `TypeError`，原因见[结构体是只读的值](../api/ui-view.md#结构体是只读的值)。

`card` 是用约束定位的视图时，不要改它的 `frame`，改约束。见[两种定位方式](../api/ui-view.md#两种定位方式)。

## 让视图在父视图里居中

`center` 是视图中心点在父视图里的坐标。把它设成父视图的正中。

```js
const size = page.view.bounds;
card.center = new CGPoint(size.width / 2, size.height / 2);
```

**效果**：矩形移到屏幕正中，大小不变。**未在模拟器验证。**

这种写法只在执行的那一刻生效。父视图的大小之后变了，矩形不会自动重新居中。要一直保持居中，用[约束](#用约束定位)：把 `centerXAnchor` 和 `centerYAnchor` 对齐父视图的同名锚点。

## 避开刘海和底部横条

屏幕顶部有刘海和状态栏，底部有一条横条。不会被它们遮挡的区域叫**安全区**。`safeAreaInsets` 给出安全区四条边到视图四条边的距离。

```js
const insets = page.view.safeAreaInsets;

const bar = new UIView();
bar.frame = new CGRect(0, insets.top, page.view.bounds.width, 44);
bar.backgroundColor = 'systemTeal';
page.view.addSubview(bar);
```

**效果**：一条高 44 pt 的青色横条，左右铺满屏幕，上边缘紧贴刘海和状态栏的下方，不被遮挡。**未在模拟器验证。**

视图还没有显示到屏幕上时，`safeAreaInsets` 读到的四边都是 0 pt（实测：还没进窗口的页面根视图）。所以这段代码要在视图已经显示之后执行，数值才是对的。

推荐用约束：对齐 `safeAreaLayoutGuide` 的内容在布局时自动到位，不需要读这个数值，也不受读取时机影响。见[用约束定位](#用约束定位)。

## 给视图设内边距

`directionalLayoutMargins` 是视图的[内边距](../api/ui-view.md#内边距)：内容应该离视图的四条边多远。它自己不移动子视图。子视图要用约束对齐 `layoutMarginsGuide`，才会按内边距缩进。

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

一组视图要排成一行或一列并带内边距时，用 [`UIStackView`](../api/ui-stack-view.md)，不需要写这些约束。

## 调整叠放顺序

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

## 移除视图

```js
dot.removeFromSuperview();
```

**效果**：橙色方块从屏幕上消失。`dot.superview` 变成 `null`，`card.subviews` 里不再有它。

移除之后这个视图是否还存在，取决于有没有变量保存它：

- 这里的 `dot` 变量还在，所以视图还在，之后可以再 `addSubview()` 加回去。**加回去未在模拟器验证。**
- 没有任何变量保存它时，视图被回收，它上面的事件监听一起消失。不需要先逐个移除监听。

对没有父视图的视图调 `removeFromSuperview()` 是否报错，**未在模拟器验证**。

要把一个视图从一个父视图移到另一个父视图，不需要先移除，直接对新的父视图调 `addSubview()`，见[视图树和叠放顺序](../api/ui-view.md#视图树和叠放顺序)。

## 隐藏视图

```js
card.isHidden = true;
```

**效果**：矩形和它里面的子视图都不显示，也不接收触摸。设回 `false` 恢复。**未在模拟器验证。**

隐藏的视图仍然在视图树里，仍然占着自己的 `frame`。只有放在 [`UIStackView`](../api/ui-stack-view.md) 里的视图，隐藏后才会让出位置。

隐藏和移除的选择：之后还要显示的视图用 `isHidden`，它的属性、子视图和事件监听都保留；不再需要的视图用 `removeFromSuperview()`，没有变量保存它时内存被回收。

## 设成半透明

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

按 iOS 的规则，`alpha` 低于 0.01 的视图不接收触摸，触摸落到它后面的视图上。所以不能用 `alpha = 0` 做一个「看不见但能点」的区域；要这样做，保持 `alpha` 为 1，把 `backgroundColor` 设成 `null`。**这两条未在模拟器验证。**

## 加圆角

圆角在视图的图层上设。图层是视图背后负责绘制的对象，通过 `view.layer` 拿到。

```js
card.layer.cornerRadius = 12;
```

**效果**：矩形的四个角变成半径 12 pt 的圆角。

边框和阴影也在图层上，见 [`CALayer`](../api/ca-layer.md)。

## 裁剪超出范围的子视图

子视图超出父视图范围的部分默认照常显示，不会被裁掉。超出父视图范围的那部分是否接收触摸，**未在模拟器验证**。

```js
dot.frame = new CGRect(180, 100, 40, 40);   // 一半在 card 外面
card.clipsToBounds = true;
```

**效果**：橙色方块只显示位于矩形范围内的那部分，超出的部分不显示。**未在模拟器验证。**

设了圆角之后，要让子视图也按圆角裁剪，同样需要 `clipsToBounds = true`。

## 旋转和缩放

```js
dot.transform = CGAffineTransform.scale(1.2)
  .concat(CGAffineTransform.rotation(Math.PI / 6));
```

**效果**：橙色方块以自己的中心为轴，放大到 1.2 倍，并顺时针旋转 30°。

角度的单位是弧度。恢复原状：

```js
dot.transform = CGAffineTransform.identity;
```

> **注意**：设了变换之后不要再读写 `frame`，改用 `bounds` 和 `center`。原因见[变换和 `frame`](../api/ui-view.md#变换和-frame)。

## 让视图不响应触摸

```js
card.isUserInteractionEnabled = false;
```

**效果**：矩形和它的子视图都不接收触摸。触摸落到它后面的视图上。外观不变。**未在模拟器验证。**

## 让普通视图响应点按

`UIView` 自己不派发点按事件。要让一个普通视图响应点按或长按，给它加一个手势识别器：

```js
const tap = new UITapGestureRecognizer();
tap.addEventListener('ended', () => {
  console.log('点了');
});
card.addGestureRecognizer(tap);
```

**效果**：点矩形时控制台输出 `点了`。

识别器加到视图上之后由视图保管，不需要保存 `tap` 变量。完整说明见[手势识别器](../api/ui-gesture-recognizer.md)。

要的是一个按钮时，直接用 [`UIButton`](../api/ui-button.md)：它自带按下时的外观变化和禁用状态。

## 用约束定位

约束描述视图的位置和大小与别的东西之间的关系：「左边距安全区 16 pt」「高 60 pt」。系统按约束算出 `frame`，父视图的大小或安全区变化时自动重算。这套机制叫 Auto Layout。

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

四条约束分别定出左、右、下三条边和高度。一个视图的约束要足够定出它的位置和大小：水平方向两个量，垂直方向两个量。约束不够时系统不报错，视图的位置或大小是不确定的；用 [`hasAmbiguousLayout`](../api/ui-view/hasambiguouslayout.md) 检查。

约束的全部写法见指南[用约束排版](auto-layout.md)。

## 读出约束算出来的位置

约束不是立刻生效的，系统在下一次布局时才计算。激活约束之后立刻读 `frame`，读到的还是布局之前的值。想马上读到结果，先调 `layoutIfNeeded()`。`banner` 是上一节用约束定位的横条，前面几行把它重建出来：

```js
const banner = new UIView();
banner.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(banner);
const guide = page.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  banner.leadingAnchor.constraintEqualToAnchor(guide.leadingAnchor, { constant: 16 }),
  banner.trailingAnchor.constraintEqualToAnchor(guide.trailingAnchor, { constant: -16 }),
  banner.bottomAnchor.constraintEqualToAnchor(guide.bottomAnchor, { constant: -24 }),
  banner.heightAnchor.constraintEqualToConstant(60),
]);

page.view.layoutIfNeeded();
console.log(banner.frame.width, banner.frame.height);
```

**效果**：控制台输出横条的宽和高。高是 `60`，宽是安全区的宽度减 32。

## 量出内容需要多大

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

## 查某个位置上是哪个视图

```js
const hit = page.view.hitTest(new CGPoint(50, 130));
if (hit) {
  console.log(hit === card);
}
```

**效果**：`(50, 130)` 这个点在矩形内，并且不在橙色方块内，控制台输出 `true`。**未在模拟器验证。**

这个点上没有任何视图时返回 `null`。

## 用编号找视图

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

## 收起键盘

```js
page.view.endEditing(true);
```

**效果**：如果这个视图里面有正在输入的输入框，输入框失去焦点，键盘收起。输入框见[输入框和键盘](../api/ui-text-field.md)。

## 参见

- [`UIView`](../api/ui-view.md)：全部成员
- [让视图动起来](view-animations.md)
- [用约束排版](auto-layout.md)
- [把视图排成一行或一列](stack-views.md)
- [`CALayer`](../api/ca-layer.md)：圆角、边框、阴影
- [手势识别器](../api/ui-gesture-recognizer.md)
