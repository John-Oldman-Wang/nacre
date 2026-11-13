---
type: reference
native: CALayer
status: partial
---

# `CALayer`、`CAGradientLayer` 和 `CAShapeLayer`

**`CALayer`** 表示图层：屏幕上的一块矩形区域，以及画在这块区域里的内容。底色、圆角、边框、阴影都是图层的属性。图层可以有子图层，子图层画在父图层的上面，位置按父图层的坐标系计算。

图层有两个子类：

- **`CAGradientLayer`** 在自己的矩形里画一段颜色渐变。
- **`CAShapeLayer`** 把一条路径（[`UIBezierPath`](ui-bezier-path.md)）画出来，可以描边，也可以填充。折线图、饼图、进度环都用它画。

图层只负责显示。它不接收触摸，不参与 Auto Layout（iOS 按约束自动计算视图位置和大小的机制，见 [Auto Layout](auto-layout.md)）。

## 图层从哪里来

图层有两个来源。

**每个视图都有一个图层。** [`UIView`](ui-view.md) 自己不画内容，屏幕上看到的视图是它的图层画出来的。这个图层用 `view.layer` 读到，由系统随视图一起创建，视图存在它就存在。同一个视图每次读 `layer` 得到的是同一个对象。

**也可以用 `new` 创建图层**，再用 `addSublayer()` 加到某个视图的图层下面。渐变和形状都要这样做，因为视图没有对应的属性。新建的图层大小是 0 × 0 pt，没有父图层，要设了 `frame` 并加到一个已经在屏幕上的图层下面才看得见。

图层加到父图层下面之后，由父图层保管。代码里不需要另外保存它，它会一直显示到被 `removeFromSuperlayer()` 移除，或者父图层所在的视图被移除。

## 用视图的属性还是图层的属性

底色、透明度、隐藏、裁剪、位置和大小，视图和图层上各有一个属性，改的是同一件事：

| 要改的 | 视图的属性 | 图层的属性 |
| --- | --- | --- |
| 底色 | `view.backgroundColor` | `layer.backgroundColor` |
| 透明度 | `view.alpha` | `layer.opacity` |
| 隐藏 | `view.isHidden` | `layer.isHidden` |
| 裁掉超出范围的内容 | `view.clipsToBounds` | `layer.masksToBounds` |
| 位置和大小 | `view.frame`，或者约束 | `layer.frame` |

**对视图自己的图层，这五项用视图的属性。** 理由有两条：

- 视图的位置和大小由 Auto Layout 管。直接改 `view.layer.frame`，下一次布局时会被约束算出的结果覆盖。**这一条未在模拟器验证。**
- `view.backgroundColor` 写入 `'label'` 这类随深浅色模式变化的颜色时，系统切换模式后底色自动跟着变。`layer.backgroundColor` 不会，见[图层上的颜色](#图层上的颜色)。

视图没有对应属性的那些，直接写 `view.layer`：圆角（`cornerRadius`、`cornerCurve`、`maskedCorners`）、边框（`borderWidth`、`borderColor`）、阴影（`shadowColor` 等四个）。

用 `new` 创建的图层没有对应的视图，全部用图层自己的属性。

## 子图层的大小不随视图变化

用 `new` 创建的图层，位置和大小只有一个来源：代码写进去的 `frame`。约束只作用于视图，图层没有约束，也没有「跟随父图层大小」的设置。

```js
const card = new UIView();
card.frame = new CGRect(20, 100, 300, 160);

const gradient = new CAGradientLayer();
gradient.frame = card.bounds;        // 这一刻是 300 × 160 pt
card.layer.addSublayer(gradient);

card.frame = new CGRect(20, 100, 340, 200);
console.log(gradient.frame.width);   // 300
```

**结果**：卡片变成 340 × 200 pt，渐变图层仍是 300 × 160 pt，卡片右边和下边各露出一条没有渐变的区域。**未在模拟器验证**；依据是 iOS 的图层在 iPhone 上没有自动调整大小的机制，记录见[实现原理](../internals/ca-layer.md)。

还要注意读 `bounds` 的时机。用约束定位的视图，在系统做完第一次布局之前 `bounds` 是 0 × 0 pt，这时把它赋给图层的 `frame`，图层就是 0 × 0 pt，什么都看不见。

推荐的做法按情况分三种：

1. **视图能表达的内容，用子视图，不用子图层。** 纯色块、带圆角和边框的块，用一个 `UIView` 加约束来做。视图的大小随约束变化，它的图层跟着视图走，不需要任何额外代码。
2. **渐变和形状，放进一个大小固定的视图。** 给这个视图的宽和高加固定数值的约束，位置仍用约束定。子图层的 `frame` 按这个固定大小写。视图的位置可以随布局变，大小不变，子图层就一直对得上。写法见[把渐变放进用约束定位的视图](#把渐变放进用约束定位的视图)。
3. **代码自己改了布局之后，重新设一次 `frame`。** 先调 `layoutIfNeeded()` 让约束立即算出结果，再读 `bounds`。写法见[视图变大后让子图层跟上](#视图变大后让子图层跟上)。

系统引起的大小变化没有事件通知，例如屏幕旋转。大小会随这类变化改变的视图，目前没有办法让它的子图层自动跟上，见[还不能做的](#还不能做的)。

## 图层上的颜色

图层上接受颜色的属性有六个：`backgroundColor`、`borderColor`、`shadowColor`，`CAShapeLayer` 的 `fillColor`、`strokeColor`，`CAGradientLayer` 的 `colors`。写法和视图上的颜色相同：写入[颜色字符串](ui-color.md)，读出来也是字符串。

**写错了不会抛异常。** 控制台输出一条警告，属性保持原来的值：

```
[Nacre] borderColor: "sytemBlue" is not a valid color, ignored; expected a color name, one of: …
```

`colors` 数组里只要有一个写错，整个数组都不写入，原来的渐变不变。

**图层上的颜色不随深浅色模式变化。** `'label'`、`'systemBackground'`、`'light-dark(#fff, #000)'` 这类颜色在浅色模式和深色模式下是两个不同的值。写进图层时，运行时当场把它换算成其中一个具体的颜色，图层只保存这个结果。之后系统切换模式，图层的颜色不变。

- **换算时按哪种模式**：按这个图层所属视图当时的模式。视图自己的图层看这个视图；用 `new` 创建的图层沿父图层往上找，用找到的第一个视图。还没加到任何视图下面的图层，按系统当时的模式。
- **读出来是什么**：固定颜色读回来是表示同一个颜色的字符串，验收里写入 `'#FF2D55'` 读到的是 `'#FF2D55'`；不保证大小写和写法与写入时完全相同。随模式变化的颜色读回来是换算后的 `'#rrggbb'`，例如浅色模式下写 `'label'`，读到 `'#000000'`。

要让图层的颜色跟上模式切换，监听所属视图的 `traitchange` 事件（见[外观特征](ui-trait-collection.md)），在回调里把颜色再写一遍。写法见[切换深浅色后更新图层的颜色](#切换深浅色后更新图层的颜色)。只要底色时，优先用 `view.backgroundColor`，不需要监听。

## 改属性时的过渡动画

用 `new` 创建的图层在屏幕上显示过之后，改它的属性不会立刻跳到新值。系统自动用一段动画从旧值过渡到新值，时长是 iOS 的默认值 0.25 秒（时长**未在模拟器验证**）。这种自动产生的动画叫隐式动画。

```js
const ring = new CAShapeLayer();
// ……设好路径并加到屏幕上，等它显示出来之后：
ring.strokeEnd = 0.5;   // 画面用一段动画过渡到 0.5，不是立刻跳过去
```

三种情况下没有隐式动画，改属性立刻生效：

- 图层还没有加到父图层下面。
- 图层刚加进去，还没有显示过。在 `sceneconnect` 的回调里一次建好界面时，所有图层都属于这种情况。
- 视图自己的图层（`view.layer`）。**这一条未在模拟器验证。**

要让某一次修改立刻生效，把它放进关闭了隐式动画的事务里，见[隐式动画和 `CATransaction`](ca-animation.md#隐式动画和-catransaction)。要自己控制动画的时长和曲线，见[动画](ca-animation.md)。

## 完整例子

下面的代码从空白 App 开始，做一张固定大小的卡片：圆角，渐变底色，上面画一条白色的折线。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 一张固定大小的卡片。圆角写在视图自己的图层上
  const card = new UIView();
  card.frame = new CGRect(20, 100, 300, 160);
  card.layer.cornerRadius = 16;
  card.clipsToBounds = true;          // 让子图层也按圆角裁掉
  page.view.addSubview(card);

  // 2. 渐变图层：从左上角的紫色到右下角的粉红色
  const gradient = new CAGradientLayer();
  gradient.colors = ['#5856D6', '#FF2D55'];
  gradient.startPoint = new CGPoint(0, 0);
  gradient.endPoint = new CGPoint(1, 1);
  gradient.frame = card.bounds;       // 子图层的大小要自己设
  card.layer.addSublayer(gradient);

  // 3. 一条折线。路径只描述形状
  const path = new UIBezierPath();
  path.moveToPoint(new CGPoint(24, 120));
  path.addLineToPoint(new CGPoint(96, 60));
  path.addLineToPoint(new CGPoint(168, 96));
  path.addLineToPoint(new CGPoint(276, 36));

  // 4. 形状图层把路径画出来
  const line = new CAShapeLayer();
  line.path = path;
  line.fillColor = null;              // 默认会用黑色填充，只要线条时必须去掉
  line.strokeColor = 'white';
  line.lineWidth = 3;
  line.lineCap = 'round';
  line.lineJoin = 'round';
  line.frame = card.bounds;
  card.layer.addSublayer(line);       // 后加的图层画在上面
});
```

**效果**

- 屏幕上方出现一张 300 × 160 pt 的卡片，四个角是半径 16 pt 的圆角。
- 卡片的底色从左上角的紫色渐变到右下角的粉红色。
- 渐变上面有一条 3 pt 粗的白色折线，共三段，线的两端和拐角是圆的。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

## 常见用法

以下例子都假设已经有上面的 `page` 和 `card`。`card` 是一个 300 × 160 pt 的视图。

### 加圆角

```js
card.layer.cornerRadius = 16;
```

**效果**：卡片的底色和边框的四个角变成半径 16 pt 的圆角。

圆角只作用于图层自己的底色和边框。子视图和子图层仍然是直角，会画到圆角外面。要让它们也被裁掉，再加一行：

```js
card.clipsToBounds = true;
```

**效果**：子视图和子图层超出圆角的部分不再显示。**未在模拟器验证。**

### 只圆上面两个角

```js
card.layer.cornerRadius = 16;
card.layer.maskedCorners = ['minXMinY', 'maxXMinY'];
```

**效果**：左上角和右上角是圆角，下面两个角是直角。

`maskedCorners` 列出要变成圆角的那几个角。名字里的 `minX` 是左边，`maxX` 是右边，`minY` 是上边，`maxY` 是下边，因为 y 轴朝下。

### 加边框

```js
card.layer.borderWidth = 2;
card.layer.borderColor = '#5856D6';
```

**效果**：卡片四周出现一圈 2 pt 宽的紫色边框。边框沿着圆角走。

边框画在图层的范围之内，不会让卡片变大。它画在底色、子视图和子图层的上面，所以会盖住边缘 2 pt 的内容。**边框和内容的上下关系未在模拟器验证。**

只设 `borderWidth` 不设颜色，得到的是黑色边框：`borderColor` 的默认值是不透明的黑色。

### 加阴影

```js
card.backgroundColor = 'systemBackground';
card.layer.shadowColor = 'black';
card.layer.shadowOpacity = 0.25;
card.layer.shadowRadius = 8;
card.layer.shadowOffset = new CGSize(0, 4);
```

**效果**：卡片下方出现一片柔和的黑色阴影，向下偏 4 pt，边缘模糊的范围是 8 pt，最深处的不透明度是 25%。**阴影的样子未在模拟器验证。**

- **`shadowOpacity` 默认是 0，阴影默认不显示。** 只设颜色、半径、偏移，屏幕上没有任何变化。
- `shadowOffset` 的 `height` 是正数时阴影向下偏。默认值是 `(0, -3)`，向上偏 3 pt。
- 阴影按图层里画出来的内容的轮廓生成。视图没有底色也没有内容时，没有阴影。

### 同时要圆角裁剪和阴影

阴影画在图层的范围之外。`clipsToBounds = true` 会把范围之外的内容全部裁掉，阴影也在其中。所以裁剪和阴影不能放在同一个视图上，要用两层视图：外层负责阴影，内层负责圆角和裁剪。

```js
const outer = new UIView();
outer.frame = new CGRect(20, 300, 300, 160);
outer.layer.shadowColor = 'black';
outer.layer.shadowOpacity = 0.25;
outer.layer.shadowRadius = 8;
outer.layer.shadowOffset = new CGSize(0, 4);
page.view.addSubview(outer);

const inner = new UIView();
inner.frame = outer.bounds;
inner.backgroundColor = 'systemBackground';
inner.layer.cornerRadius = 16;
inner.clipsToBounds = true;
outer.addSubview(inner);
```

**效果**：一张圆角卡片，四周有阴影。放进 `inner` 的子视图和子图层按圆角裁掉。**未在模拟器验证。**

### 加渐变底色

```js
const gradient = new CAGradientLayer();
gradient.colors = ['#5856D6', '#FF2D55'];
gradient.frame = card.bounds;
card.layer.insertSublayer(gradient, { atIndex: 0 });
```

**效果**：卡片的底色从顶部的紫色均匀过渡到底部的粉红色。渐变在卡片所有子视图的下面。

- 不设 `startPoint` 和 `endPoint` 时，方向是从上到下。
- 用 `insertSublayer(…, { atIndex: 0 })` 把渐变放到最下面。用 `addSublayer()` 会放到最上面，盖住卡片里已有的子视图。
- `colors` 至少要有两个颜色。只有一个或者为空时不画渐变。**未在模拟器验证。**

### 改渐变的方向和颜色的位置

`startPoint` 和 `endPoint` 用单位坐标：`(0, 0)` 是图层的左上角，`(1, 1)` 是右下角，和图层的实际大小无关。

```js
const gradient = new CAGradientLayer();
gradient.colors = ['#5856D6', '#FF2D55', '#FF9500'];
gradient.startPoint = new CGPoint(0, 0.5);   // 左边的中点
gradient.endPoint = new CGPoint(1, 0.5);     // 右边的中点
gradient.locations = [0, 0.3, 1];
gradient.frame = card.bounds;
card.layer.addSublayer(gradient);
```

**效果**：渐变从左到右。最左边是紫色，到宽度的 30% 处变成粉红色，再到最右边变成橙色。**未在模拟器验证。**

`locations` 给出每个颜色所在的位置，取值 0 到 1，0 是起点，1 是终点。不设时颜色均匀分布。

### 画一条折线

```js
const path = new UIBezierPath();
path.moveToPoint(new CGPoint(24, 120));
path.addLineToPoint(new CGPoint(96, 60));
path.addLineToPoint(new CGPoint(168, 96));

const line = new CAShapeLayer();
line.path = path;
line.fillColor = null;
line.strokeColor = 'systemBlue';
line.lineWidth = 3;
line.frame = card.bounds;
card.layer.addSublayer(line);
```

**效果**：卡片上出现一条 3 pt 粗的蓝色折线，共两段。

- **`fillColor` 默认是不透明的黑色。** 不设成 `null`，折线围出的区域会被填成黑色。
- **`strokeColor` 默认是 `null`。** 只设 `lineWidth` 不设颜色，看不到线。
- 路径里的坐标按形状图层自己的坐标系算，原点是图层的左上角。把图层的 `frame` 设成和卡片一样大，路径里的坐标就等于卡片里的坐标。
- 线以路径为中心，向两侧各占一半线宽。3 pt 粗的线，两侧各画出 1.5 pt。

路径的画法见 [`UIBezierPath`](ui-bezier-path.md)。

### 画一个填充的形状

```js
const center = new CGPoint(150, 80);
const pie = new UIBezierPath();
pie.moveToPoint(center);
pie.addArcWithCenter(center, {
  radius: 50, startAngle: -Math.PI / 2, endAngle: Math.PI / 3, clockwise: true,
});
pie.closePath();

const wedge = new CAShapeLayer();
wedge.path = pie;
wedge.fillColor = 'systemOrange';
wedge.frame = card.bounds;
card.layer.addSublayer(wedge);
```

**效果**：卡片中间出现一个橙色的扇形。圆心在 (150, 80)，半径 50 pt，从正上方开始沿顺时针方向扫过 150°。

### 只画路径的一段：进度环

`strokeStart` 和 `strokeEnd` 决定描边从路径的哪里开始、到哪里结束。取值 0 到 1，0 是路径的起点，1 是终点。

```js
const circle = UIBezierPath.bezierPathWithArcCenter(new CGPoint(150, 80), {
  radius: 40, startAngle: -Math.PI / 2, endAngle: Math.PI * 1.5, clockwise: true,
});

const ring = new CAShapeLayer();
ring.path = circle;
ring.fillColor = null;
ring.strokeColor = 'systemGreen';
ring.lineWidth = 8;
ring.lineCap = 'round';
ring.strokeEnd = 0.6;
ring.frame = card.bounds;
card.layer.addSublayer(ring);
```

**效果**：一个半径 40 pt、8 pt 粗的绿色圆环，从正上方开始沿顺时针方向画了 60%，两端是圆头。**未在模拟器验证。**

之后要更新进度，直接改 `strokeEnd`。图层已经显示过时，这次修改会带一段过渡动画，见[改属性时的过渡动画](#改属性时的过渡动画)。

### 画虚线

```js
const line = new CAShapeLayer();
line.path = UIBezierPath.bezierPathWithRect(new CGRect(20, 20, 260, 120));
line.fillColor = null;
line.strokeColor = 'systemGray';
line.lineWidth = 1;
line.lineDashPattern = [6, 3];
line.frame = card.bounds;
card.layer.addSublayer(line);
```

**效果**：一个 260 × 120 pt 的灰色虚线框。每段线长 6 pt，间隔 3 pt。**未在模拟器验证。**

`lineDashPattern` 里的数字依次是「画多长、空多长」，单位是 pt，到数组末尾后从头循环。设回 `null` 变回实线。

### 调整子图层的上下顺序

```js
const a = new CALayer();
const b = new CALayer();
const c = new CALayer();

card.layer.addSublayer(a);                    // [a]
card.layer.addSublayer(b);                    // [a, b]，b 在 a 上面
card.layer.insertSublayer(c, { atIndex: 0 }); // [c, a, b]，c 在最下面
card.layer.insertSublayer(c, { above: b });   // [a, b, c]，c 移到 b 上面
card.layer.insertSublayer(c, { below: a });   // [c, a, b]，c 移到 a 下面
c.removeFromSuperlayer();                     // [a, b]
```

**结果**：每行注释里是这一行执行之后 `card.layer.sublayers` 的内容。数组里靠后的图层画在上面。

对一个已经在 `sublayers` 里的图层再调 `insertSublayer()`，是把它移到新位置，不会多出一份。

不想改数组顺序时，可以改 `zPosition`：数值大的画在上面，数值相同的按数组顺序。**`zPosition` 的显示效果未在模拟器验证。**

### 把渐变放进用约束定位的视图

渐变所在的视图用约束定位置，宽高用固定数值。子图层按这个固定大小写 `frame`，不读 `bounds`，所以不依赖布局是否已经完成。

```js
const banner = new UIView();
banner.translatesAutoresizingMaskIntoConstraints = false;
banner.clipsToBounds = true;
banner.layer.cornerRadius = 12;
page.view.addSubview(banner);

const width = 280;
const height = 120;
NSLayoutConstraint.activateConstraints([
  banner.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
  banner.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  banner.widthAnchor.constraintEqualToConstant(width),
  banner.heightAnchor.constraintEqualToConstant(height),
]);

const gradient = new CAGradientLayer();
gradient.colors = ['#34C759', '#007AFF'];
gradient.frame = new CGRect(0, 0, width, height);
banner.layer.addSublayer(gradient);
```

**效果**：页面正中有一块 280 × 120 pt 的圆角渐变。页面大小变化时它保持在正中，渐变始终铺满它。**未在模拟器验证。**

### 视图变大后让子图层跟上

代码自己改了约束或 `frame` 之后，子图层的大小要再设一次。

```js
const gradient = new CAGradientLayer();
gradient.colors = ['#5856D6', '#FF2D55'];
gradient.frame = card.bounds;
card.layer.addSublayer(gradient);

// 之后卡片变大
card.frame = new CGRect(20, 100, 340, 200);
page.view.layoutIfNeeded();           // 用了约束时，先让约束算出结果

CATransaction.begin();
CATransaction.setDisableActions(true);
gradient.frame = card.bounds;         // 立刻生效，没有过渡动画
CATransaction.commit();
```

**效果**：渐变图层变成 340 × 200 pt，重新铺满卡片。**未在模拟器验证。**

`CATransaction` 那三行关闭了这次修改的隐式动画。不加的话，图层已经显示过时，渐变会用一段动画慢慢变大，这段时间里和卡片对不上。

### 切换深浅色后更新图层的颜色

```js
card.layer.borderWidth = 2;

function applyColors() {
  card.layer.borderColor = 'label';
}
applyColors();
card.addEventListener('traitchange', applyColors);
```

**效果**：浅色模式下边框是黑色，深色模式下是白色。系统切换模式后，回调执行，边框换成新模式下的颜色。

回调里写的还是 `'label'`。每次写入时，运行时按卡片当时的模式重新换算一次。

## 位置：`frame`、`bounds`、`position`

三个属性描述同一个矩形，单位都是[点（pt）](units.md)，y 轴朝下。

| 属性 | 含义 |
| --- | --- |
| `frame` | 图层在父图层坐标系里的位置和大小。`x`、`y` 是图层左上角的坐标 |
| `bounds` | 图层自己的坐标系。`width`、`height` 和 `frame` 相同，`x`、`y` 默认是 0 |
| `position` | 图层**中心点**在父图层坐标系里的坐标 |

```js
const layer = new CALayer();
layer.frame = new CGRect(1, 2, 3, 4);
console.log(String(layer.position));   // CGPoint(2.5, 4)

layer.position = new CGPoint(10, 10);
console.log(layer.frame.x);            // 8.5
```

**结果**：`frame` 的左上角是 (1, 2)、大小是 3 × 4 pt，所以中心点是 (2.5, 4)。把中心点移到 (10, 10)，大小不变，左上角的 x 变成 10 − 1.5 = 8.5。

摆放图层时用 `frame`。做位移动画时用 `position`：`frame` 不能做动画，见[动画](ca-animation.md)。

## `contentsScale`：每个点用几个像素

`contentsScale` 表示图层的内容每 1 pt 用几个像素来画。iPhone 的屏幕上 1 pt 是 2 或 3 个像素。

- 用 `new` 创建的图层，`contentsScale` 默认是 1。
- 视图自己的图层，在 `sceneconnect` 的回调里读到的也是 1，所以不能用它来读屏幕是几倍的。

屏幕的倍数从视图的[外观特征](ui-trait-collection.md)里读：

```js
const layer = new CAShapeLayer();
layer.contentsScale = card.traitCollection.displayScale;
console.log(layer.contentsScale);
```

**结果**：在 3 倍屏的 iPhone 上输出 `3`。

渐变图层和形状图层在 `contentsScale` 是 1 时画出来是否模糊，**未在模拟器验证**。验收用例里的渐变和形状都没有设过这个属性。

## 成员说明

所有长度的单位是[点（pt）](units.md)。结构体 `CGRect`、`CGPoint`、`CGSize` 见[结构体](structs.md)：读出来的结构体字段只读，要改就整体赋一个新的。

数值属性按 `Number()` 转换，`'0.5'` 当作 0.5；转换结果不是有限数时抛 `TypeError`。布尔属性按真假值转换。

### `CALayer`

#### 创建

```js
const layer = new CALayer();
```

没有参数。新图层的 `frame` 是 `(0, 0, 0, 0)`，没有父图层，没有子图层。

`CALayer`、`CAGradientLayer`、`CAShapeLayer` 都不能被继承，见[原生类](native-classes.md)。

#### 位置和大小

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `frame` | `CGRect` | 是 | 是 | `(0, 0, 0, 0)` | 在父图层坐标系里的位置和大小，单位 pt |
| `bounds` | `CGRect` | 是 | 是 | `(0, 0, 0, 0)` | 自己的坐标系。`width`、`height` 和 `frame` 相同 |
| `position` | `CGPoint` | 是 | 是 | `(0, 0)` | 中心点在父图层坐标系里的坐标，单位 pt |
| `zPosition` | 数 | 是 | 是 | `0` | 上下顺序。数值大的画在上面，没有单位 |

这四个属性变化时没有事件。它们只会被代码改动。

#### 层级

| 成员 | 类型 | 可读 | 可写 | 说明 |
| --- | --- | --- | --- | --- |
| `superlayer` | `CALayer` 或 `null` | 是 | 否 | 父图层。没有父图层时是 `null` |
| `sublayers` | `CALayer[]` | 是 | 否 | 子图层，靠后的画在上面。没有子图层时是空数组 |

`sublayers` 里的图层读出来是它实际的类：渐变图层读出来是 `CAGradientLayer`，形状图层是 `CAShapeLayer`。视图的图层的 `sublayers` 里，除了代码加进去的图层，还有每个子视图的图层。**后一句未在模拟器验证。**

**`addSublayer(layer)`**

把 `layer` 加为子图层，放在最上面。

- **参数**：`layer`，一个图层。
- **返回**：无。
- 一个图层只能有一个父图层。`layer` 已经在别的图层下面时，它先从原来的父图层移除。**未在模拟器验证。**
- **出错**：`layer` 不是图层时抛 `TypeError: addSublayer: expects a CALayer`。

**`insertSublayer(layer, options)`**

把 `layer` 插到指定位置。`options` 三选一：

| `options` | 效果 |
| --- | --- |
| `{ atIndex: n }` | 插到 `sublayers` 的第 `n` 位。0 是最下面 |
| `{ above: other }` | 插到 `other` 的上面，紧挨着它 |
| `{ below: other }` | 插到 `other` 的下面，紧挨着它 |

- **返回**：无。
- **出错**：
  - 三种都没给：`TypeError: insertSublayer needs one of { atIndex } / { above } / { below }`
  - `layer` 不是图层：`TypeError: insertSublayer: expects a CALayer`
  - `above` 或 `below` 给的不是图层：`TypeError: insertSublayer: expects two CALayers`
  - `atIndex` 是负数：`TypeError: insertSublayer:atIndex: index must not be negative`
  - `atIndex` 转换不出有限数：`TypeError: atIndex must be a finite number, got …`

**`removeFromSuperlayer()`**

把图层从父图层移除。移除后 `superlayer` 是 `null`。返回：无。

移除之后，代码里没有保存这个图层的话，它会被回收。

#### 外观

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `opacity` | 数 | 是 | 是 | `1` | 不透明度，0 到 1 的比例。0 是完全透明，1 是完全不透明。作用于图层和它的所有子图层 |
| `isHidden` | 布尔 | 是 | 是 | `false` | `true` 时图层和它的子图层都不显示；`false` 时显示 |
| `masksToBounds` | 布尔 | 是 | 是 | `false` | `true` 时子图层超出本图层范围（含圆角）的部分不显示；`false` 时照常显示 |
| `backgroundColor` | [颜色](ui-color.md)字符串或 `null` | 是 | 是 | `null` | 底色。`null` 是没有底色 |
| `contentsScale` | 数 | 是 | 是 | `1` | 每 1 pt 用几个像素画，见 [`contentsScale`](#contentsscale每个点用几个像素) |

视图自己的图层上，前四项用视图的属性，见[用视图的属性还是图层的属性](#用视图的属性还是图层的属性)。

#### 圆角

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `cornerRadius` | 数 | 是 | 是 | `0` | 圆角半径，单位 pt。0 是直角 |
| `cornerCurve` | `'circular'` \| `'continuous'` | 是 | 是 | `'continuous'` | 圆角的曲线，见下表 |
| `maskedCorners` | 角名数组 | 是 | 是 | 四个角都有 | 哪几个角是圆角，见下表 |

`cornerCurve` 的取值：

| 取值 | 效果 |
| --- | --- |
| `'circular'` | 圆角是一段正圆弧，和直边相接处曲率突变 |
| `'continuous'` | 圆角的曲率从直边开始逐渐变化，过渡更平滑。iOS 的 App 图标是这种圆角 |

两种取值画出来的差别**未在模拟器验证**。写别的值抛 `TypeError`，报错信息里列出这两个值。

`maskedCorners` 的角名：

| 角名 | 哪个角 |
| --- | --- |
| `'minXMinY'` | 左上 |
| `'maxXMinY'` | 右上 |
| `'minXMaxY'` | 左下 |
| `'maxXMaxY'` | 右下 |

- 空数组表示四个角都是直角。
- 读出来的数组按上表的顺序排列。
- **出错**：
  - 角名写错：`TypeError: maskedCorners has no value "topLeft"; expected one of: …`
  - 给的不是数组：`TypeError: maskedCorners needs an array of names; expected any of: …`

#### 边框

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `borderWidth` | 数 | 是 | 是 | `0` | 边框宽度，单位 pt。0 是没有边框。边框画在图层范围之内 |
| `borderColor` | [颜色](ui-color.md)字符串或 `null` | 是 | 是 | `'#000000'` | 边框颜色 |

#### 阴影

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `shadowColor` | [颜色](ui-color.md)字符串或 `null` | 是 | 是 | 不透明的黑色 | 阴影颜色 |
| `shadowOpacity` | 数 | 是 | 是 | `0` | 阴影的不透明度，0 到 1 的比例。0 是不显示阴影 |
| `shadowRadius` | 数 | 是 | 是 | `3` | 阴影边缘模糊的范围，单位 pt。越大越柔和 |
| `shadowOffset` | `CGSize` | 是 | 是 | `(0, -3)` | 阴影相对图层的偏移，单位 pt。`width` 为正向右，`height` 为正向下 |

颜色属性的读写规则见[图层上的颜色](#图层上的颜色)。

#### 动画

这五个方法把[动画](ca-animation.md)加到图层上，说明见那一页。

| 方法 | 作用 |
| --- | --- |
| `addAnimation(animation, { forKey })` | 把一个动画加到图层上 |
| `removeAnimationForKey(key)` | 移除指定名字的动画 |
| `removeAllAnimations()` | 移除图层上的全部动画 |
| `animationKeys()` | 图层上所有动画的名字，没有时是空数组 |
| `animationForKey(key)` | 读某个名字的动画，没有时是 `null` |

### `CAGradientLayer`

`CAGradientLayer` 继承 `CALayer`，上面的成员都有。它按 `colors` 在自己的 `frame` 范围内画渐变。

```js
const gradient = new CAGradientLayer();
```

没有参数。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `colors` | 读：颜色字符串数组；写：[颜色](ui-color.md)数组 | 是 | 是 | `[]` | 渐变依次经过的颜色 |
| `locations` | 数的数组或 `null` | 是 | 是 | `null` | 每个颜色的位置，0 到 1 的比例。`null` 是均匀分布 |
| `startPoint` | `CGPoint` | 是 | 是 | `(0.5, 0)` | 起点，单位坐标 |
| `endPoint` | `CGPoint` | 是 | 是 | `(0.5, 1)` | 终点，单位坐标 |
| `type` | `'axial'` \| `'radial'` \| `'conic'` | 是 | 是 | `'axial'` | 渐变的形状，见下表 |

`startPoint` 和 `endPoint` 用单位坐标：`(0, 0)` 是图层的左上角，`(1, 1)` 是右下角。默认值表示从顶边中点到底边中点，也就是从上到下。

`type` 的取值，以及两个点在每种取值下的含义：

| 取值 | 效果 | `startPoint` | `endPoint` |
| --- | --- | --- | --- |
| `'axial'` | 颜色沿一条直线变化 | 直线的起点 | 直线的终点 |
| `'radial'` | 颜色从圆心向外变化 | 圆心 | 决定圆的大小 |
| `'conic'` | 颜色绕圆心转一圈变化 | 圆心 | 决定从哪个角度开始 |

`'radial'` 和 `'conic'` 画出来的样子**未在模拟器验证**。

- `colors` 里有一个颜色写错时，整个数组不写入，控制台输出警告。
- `locations` 的个数应当和 `colors` 相同。个数不同时的效果**未在模拟器验证**。
- **出错**：
  - `type` 写错：`TypeError: type has no value "linear"; expected one of: …`
  - `locations` 的某一项转换不出有限数：`TypeError: locations[0] must be a finite number, got …`
  - `locations` 给的不是数组也不是 `null`：`TypeError: locations must be an array of numbers or null, got …`

### `CAShapeLayer`

`CAShapeLayer` 继承 `CALayer`。它把 `path` 画出来：先填充路径围出的区域，再沿路径描边。

```js
const shape = new CAShapeLayer();
```

没有参数。

#### `path`

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `path` | [`UIBezierPath`](ui-bezier-path.md) 或 `null` | 是 | 是 | `null` | 要画的路径。`null` 时什么都不画 |

- 路径里的坐标按图层自己的坐标系算，原点在图层左上角，单位 pt。
- 图层不会按路径调整自己的大小。路径超出图层 `frame` 的部分照常画出来，除非 `masksToBounds` 是 `true`。**未在模拟器验证。**
- 读 `path` 得到的是写进去的那个对象。
- **写入之后再修改这条路径，图层不会变。** 图层保存的是写入那一刻的形状。改完路径后要再赋值一次：

```js
const path = new UIBezierPath();
path.moveToPoint(new CGPoint(0, 0));
path.addLineToPoint(new CGPoint(100, 0));

const shape = new CAShapeLayer();
shape.path = path;

path.addLineToPoint(new CGPoint(100, 100));   // 图层上还是一段线
shape.path = path;                            // 图层上变成两段线
```

**效果**：第二次赋值之后，图层才画出新加的那一段。**未在模拟器验证。**

#### 填充

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `fillColor` | [颜色](ui-color.md)字符串或 `null` | 是 | 是 | `'#000000'` | 填充颜色。`null` 是不填充 |
| `fillRule` | `'nonZero'` \| `'evenOdd'` | 是 | 是 | `'nonZero'` | 路径自己相交或者一圈套一圈时，哪些区域算在内部 |

没有闭合的路径也会被填充：填充时按起点和终点连起来算。

`fillRule` 的取值。两种规则都是从某个点向外引一条射线，看它穿过路径的情况：

| 取值 | 效果 |
| --- | --- |
| `'nonZero'` | 路径从左向右穿过射线记 +1，从右向左记 −1。总和不是 0 的点在内部。两个同方向的圆套在一起时，里面的圆也被填充 |
| `'evenOdd'` | 只数穿过的次数。奇数次的点在内部。两个圆套在一起时，里面的圆是空的，得到一个环 |

两种取值画出来的差别**未在模拟器验证**。

#### 描边

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `strokeColor` | [颜色](ui-color.md)字符串或 `null` | 是 | 是 | `null` | 线的颜色。`null` 是不描边 |
| `lineWidth` | 数 | 是 | 是 | `1` | 线宽，单位 pt。线以路径为中心，两侧各占一半 |
| `lineCap` | `'butt'` \| `'round'` \| `'square'` | 是 | 是 | `'butt'` | 线两端的形状 |
| `lineJoin` | `'miter'` \| `'round'` \| `'bevel'` | 是 | 是 | `'miter'` | 拐角的形状 |
| `miterLimit` | 数 | 是 | 是 | `10` | `lineJoin` 是 `'miter'` 时，尖角长度与线宽之比的上限。超过上限的拐角改用 `'bevel'` 的画法 |
| `strokeStart` | 数 | 是 | 是 | `0` | 描边从路径的哪里开始，0 到 1 的比例 |
| `strokeEnd` | 数 | 是 | 是 | `1` | 描边到路径的哪里结束，0 到 1 的比例 |
| `lineDashPattern` | 数的数组或 `null` | 是 | 是 | `null` | 虚线的画法：依次是画多长、空多长，单位 pt，循环使用。`null` 是实线 |
| `lineDashPhase` | 数 | 是 | 是 | `0` | 虚线从图案的多少 pt 处开始画 |

`lineCap` 的取值：

| 取值 | 效果 |
| --- | --- |
| `'butt'` | 线在路径的端点处平着截断 |
| `'round'` | 端点外加一个半圆，线比路径长出半个线宽 |
| `'square'` | 端点外加半个方块，线比路径长出半个线宽 |

`lineJoin` 的取值：

| 取值 | 效果 |
| --- | --- |
| `'miter'` | 两段线的外边延长到相交，形成尖角 |
| `'round'` | 拐角处是圆弧 |
| `'bevel'` | 拐角的尖被平着切掉 |

线头和拐角画出来的样子**未在模拟器验证**。

- **出错**：
  - `fillRule`、`lineCap`、`lineJoin` 写错：`TypeError: lineCap has no value "flat"; expected one of: …`
  - `lineDashPattern` 的某一项转换不出有限数：`TypeError: lineDashPattern[0] must be a finite number, got …`

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `view.layer` | `view.layer` |
| `[CALayer layer]` | `new CALayer()` |
| `[CAGradientLayer layer]` | `new CAGradientLayer()` |
| `[CAShapeLayer layer]` | `new CAShapeLayer()` |
| `[host addSublayer:a]` | `host.addSublayer(a)` |
| `[host insertSublayer:c atIndex:0]` | `host.insertSublayer(c, { atIndex: 0 })` |
| `[host insertSublayer:c above:b]` | `host.insertSublayer(c, { above: b })` |
| `[host insertSublayer:c below:a]` | `host.insertSublayer(c, { below: a })` |
| `[c removeFromSuperlayer]` | `c.removeFromSuperlayer()` |
| `layer.frame = CGRectMake(1, 2, 3, 4)` | `layer.frame = new CGRect(1, 2, 3, 4)` |
| `layer.position = CGPointMake(10, 10)` | `layer.position = new CGPoint(10, 10)` |
| `layer.hidden = YES` | `layer.isHidden = true` |
| `layer.backgroundColor = color.CGColor` | `layer.backgroundColor = '#5856D6'` |
| `layer.cornerRadius = 14` | `layer.cornerRadius = 14` |
| `layer.cornerCurve = kCACornerCurveContinuous` | `layer.cornerCurve = 'continuous'` |
| `layer.maskedCorners = kCALayerMinXMinYCorner \| kCALayerMaxXMinYCorner` | `layer.maskedCorners = ['minXMinY', 'maxXMinY']` |
| `layer.borderColor = UIColor.systemBlueColor.CGColor` | `layer.borderColor = 'systemBlue'` |
| `[UIColor colorWithCGColor:layer.borderColor]` | `layer.borderColor`（读到的是字符串） |
| `layer.shadowOffset = CGSizeMake(0, 4)` | `layer.shadowOffset = new CGSize(0, 4)` |
| `layer.contentsScale = view.traitCollection.displayScale` | `layer.contentsScale = view.traitCollection.displayScale` |
| `gradient.colors = @[(id)a.CGColor, (id)b.CGColor]` | `gradient.colors = ['#000', '#fff']` |
| `gradient.locations = @[@0, @0.3, @1]` | `gradient.locations = [0, 0.3, 1]` |
| `gradient.type = kCAGradientLayerRadial` | `gradient.type = 'radial'` |
| `shape.path = path.CGPath` | `shape.path = path` |
| `shape.fillColor = UIColor.clearColor.CGColor` | `shape.fillColor = null` |
| `shape.fillRule = kCAFillRuleEvenOdd` | `shape.fillRule = 'evenOdd'` |
| `shape.lineCap = kCALineCapRound` | `shape.lineCap = 'round'` |
| `shape.lineJoin = kCALineJoinBevel` | `shape.lineJoin = 'bevel'` |
| `shape.lineDashPattern = @[@4, @2]` | `shape.lineDashPattern = [4, 2]` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 视图大小变化时自动调整子图层 | 覆写 `layoutSubviews` | 未实现。需要先支持用 JS 继承原生类 |
| 得知视图的大小变了 | 没有现成的通知，原生 App 同样靠覆写 `layoutSubviews` | 未实现 |
| 让一个视图直接用渐变图层或形状图层作为自己的图层 | 覆写 `+layerClass` | 未实现。需要先支持用 JS 继承原生类 |
| 用一个形状裁剪图层的内容 | `mask` | 未实现 |
| 指定阴影的轮廓 | `shadowPath` | 未实现 |
| 旋转、缩放图层，改变旋转的中心 | `transform`、`anchorPoint` | 未实现。视图可以用 `view.transform`，见 [`UIView`](ui-view.md) |
| 把一张图片直接作为图层的内容 | `contents` | 未实现。显示图片用 [`UIImageView`](ui-image.md) |
| 读动画进行中图层正显示的值 | `presentationLayer` | 未实现 |
| 文字图层、复制图层等其他图层 | `CATextLayer`、`CAReplicatorLayer` 等 | 未实现 |

## 参见

- [`UIBezierPath`](ui-bezier-path.md)：`CAShapeLayer.path` 的类型，路径怎么画
- [动画](ca-animation.md)：给图层的属性做动画，关闭隐式动画
- [`UIView`](ui-view.md)：`view.layer` 的来源，视图上和图层重叠的那几个属性
- [颜色](ui-color.md)：颜色字符串的写法
- [外观特征](ui-trait-collection.md)：`traitchange` 事件和 `displayScale`
- [结构体](structs.md)：`CGRect`、`CGPoint`、`CGSize`
- [单位](units.md)
- [实现原理：图层](../internals/ca-layer.md)
