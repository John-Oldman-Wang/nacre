# 用图层画圆角、阴影、渐变和形状

这一篇讲怎么用[图层](../api/ca-layer.md)给视图加圆角、边框、阴影，怎么用 [`CAGradientLayer`](../api/ca-gradient-layer.md) 画渐变、用 [`CAShapeLayer`](../api/ca-shape-layer.md) 画折线、扇形、进度环和虚线，以及子图层的大小怎么跟上视图、颜色怎么跟上深浅色。每个属性的细节在这三个类的参考页。

## 推荐的做法

- **视图自己的图层，底色、透明度、隐藏、裁剪、位置和大小用视图的属性**（`view.backgroundColor`、`view.alpha`、`view.isHidden`、`view.clipsToBounds`、`view.frame` 或约束）。视图没有对应属性的圆角、边框、阴影，直接写 `view.layer`。理由见[用视图的属性还是图层的属性](../api/ca-layer.md#用视图的属性还是图层的属性)。
- **只要底色就用 `view.backgroundColor`**，它跟随深浅色模式。图层上的颜色要自己在 `traitchange` 里重写。
- **子图层的大小要自己管**，按下面三种情况处理，见[子图层的大小跟上视图](#子图层的大小跟上视图)。

## 第一个例子

从空白 App 开始，做一张固定大小的卡片：圆角，渐变底色，上面画一条白色的折线。

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

下面的例子都沿用这里的 `page` 和 `card`。`card` 是一个 300 × 160 pt 的视图。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const card = new UIView();
card.frame = new CGRect(20, 100, 300, 160);
page.view.addSubview(card);
```

## 子图层的大小跟上视图

用 `new` 创建的图层，位置和大小只有一个来源：代码写进去的 `frame`。约束只作用于视图，图层没有约束，也没有「跟随父图层大小」的设置。用约束定位的视图，在系统做完第一次布局之前 `bounds` 是 0 × 0 pt。原因见[子图层的大小不随视图变化](../api/ca-layer.md#子图层的大小不随视图变化)。

推荐的做法按情况分三种：

1. **视图能表达的内容，用子视图，不用子图层。** 纯色块、带圆角和边框的块，用一个 `UIView` 加约束来做。视图的大小随约束变化，它的图层跟着视图走，不需要任何额外代码。
2. **渐变和形状，放进一个大小固定的视图。** 给这个视图的宽和高加固定数值的约束，位置仍用约束定。子图层的 `frame` 按这个固定大小写。视图的位置可以随布局变，大小不变，子图层就一直对得上。写法见[把渐变放进用约束定位的视图](#把渐变放进用约束定位的视图)。
3. **代码自己改了布局之后，重新设一次 `frame`。** 先调 `layoutIfNeeded()` 让约束立即算出结果，再读 `bounds`。写法见[视图变大后让子图层跟上](#视图变大后让子图层跟上)。

系统引起的大小变化没有事件通知，例如屏幕旋转。大小会随这类变化改变的视图，目前没有办法让它的子图层自动跟上。

## 加圆角

```js
card.layer.cornerRadius = 16;
```

**效果**：卡片的底色和边框的四个角变成半径 16 pt 的圆角。

圆角只作用于图层自己的底色和边框。子视图和子图层仍然是直角，会画到圆角外面。要让它们也被裁掉，再加一行：

```js
card.clipsToBounds = true;
```

**效果**：子视图和子图层超出圆角的部分不再显示。**未在模拟器验证。**

## 只圆上面两个角

```js
card.layer.cornerRadius = 16;
card.layer.maskedCorners = ['minXMinY', 'maxXMinY'];
```

**效果**：左上角和右上角是圆角，下面两个角是直角。

`maskedCorners` 列出要变成圆角的那几个角。名字里的 `minX` 是左边，`maxX` 是右边，`minY` 是上边，`maxY` 是下边，因为 y 轴朝下。

## 加边框

```js
card.layer.borderWidth = 2;
card.layer.borderColor = '#5856D6';
```

**效果**：卡片四周出现一圈 2 pt 宽的紫色边框。边框沿着圆角走。

边框画在图层的范围之内，不会让卡片变大。它画在底色、子视图和子图层的上面，所以会盖住边缘 2 pt 的内容。**边框和内容的上下关系未在模拟器验证。**

只设 `borderWidth` 不设颜色，得到的是黑色边框：`borderColor` 的默认值是不透明的黑色。

## 加阴影

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

## 同时要圆角裁剪和阴影

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

## 加渐变底色

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

## 改渐变的方向和颜色的位置

`startPoint` 和 `endPoint` 用单位坐标：`(0, 0)` 是图层的左上角，`(1, 1)` 是右下角，和图层的实际大小无关。

```js
const gradient2 = new CAGradientLayer();
gradient2.colors = ['#5856D6', '#FF2D55', '#FF9500'];
gradient2.startPoint = new CGPoint(0, 0.5);   // 左边的中点
gradient2.endPoint = new CGPoint(1, 0.5);     // 右边的中点
gradient2.locations = [0, 0.3, 1];
gradient2.frame = card.bounds;
card.layer.addSublayer(gradient2);
```

**效果**：渐变从左到右。最左边是紫色，到宽度的 30% 处变成粉红色，再到最右边变成橙色。**未在模拟器验证。**

`locations` 给出每个颜色所在的位置，取值 0 到 1，0 是起点，1 是终点。不设时颜色均匀分布。

## 画一条折线

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

路径的画法见 [`UIBezierPath`](../api/ui-bezier-path.md)。

## 画一个填充的形状

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

## 只画路径的一段：进度环

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

之后要更新进度，直接改 `strokeEnd`。图层已经显示过时，这次修改会带一段过渡动画，见[改属性时的过渡动画](../api/ca-layer.md#改属性时的过渡动画)。

## 画虚线

```js
const line2 = new CAShapeLayer();
line2.path = UIBezierPath.bezierPathWithRect(new CGRect(20, 20, 260, 120));
line2.fillColor = null;
line2.strokeColor = 'systemGray';
line2.lineWidth = 1;
line2.lineDashPattern = [6, 3];
line2.frame = card.bounds;
card.layer.addSublayer(line2);
```

**效果**：一个 260 × 120 pt 的灰色虚线框。每段线长 6 pt，间隔 3 pt。**未在模拟器验证。**

`lineDashPattern` 里的数字依次是「画多长、空多长」，单位是 pt，到数组末尾后从头循环。设回 `null` 变回实线。

## 调整子图层的上下顺序

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

## 把一张图片作为图层的内容

```js
const dot = UIImage.imageNamed('JS/assets/dot');

const badge = new CALayer();
badge.frame = new CGRect(20, 20, 40, 40);
badge.contents = dot;
card.layer.addSublayer(badge);

console.log(badge.contents === dot);
```

**结果**

- 卡片左上方出现这张图，拉伸到 40 × 40 pt。**屏幕上的样子未在模拟器验证。**
- 控制台输出 `true`：读出来的就是写进去的那个图片对象。

显示一张图片通常用 [`UIImageView`](../api/ui-image-view.md)，它会处理图片的比例和倍率。直接写 `contents` 用在两种情况：图层本身是别的动画的一部分；或者要自己逐帧播放一组图片，写法见[自己控制动图的播放](images.md#自己控制动图的播放)。

- `imageNamed()` 找不到图片时返回 `null`，`contents = null` 表示没有内容，不会出错。
- 只写新建的图层的 `contents`。视图自己的图层（`view.layer`）的内容由视图管理。

## 把渐变放进用约束定位的视图

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

const gradient3 = new CAGradientLayer();
gradient3.colors = ['#34C759', '#007AFF'];
gradient3.frame = new CGRect(0, 0, width, height);
banner.layer.addSublayer(gradient3);
```

**效果**：页面正中有一块 280 × 120 pt 的圆角渐变。页面大小变化时它保持在正中，渐变始终铺满它。**未在模拟器验证。**

## 视图变大后让子图层跟上

代码自己改了约束或 `frame` 之后，子图层的大小要再设一次。

```js
const gradient4 = new CAGradientLayer();
gradient4.colors = ['#5856D6', '#FF2D55'];
gradient4.frame = card.bounds;
card.layer.addSublayer(gradient4);

// 之后卡片变大
card.frame = new CGRect(20, 100, 340, 200);
page.view.layoutIfNeeded();           // 用了约束时，先让约束算出结果

CATransaction.begin();
CATransaction.setDisableActions(true);
gradient4.frame = card.bounds;         // 立刻生效，没有过渡动画
CATransaction.commit();
```

**效果**：渐变图层变成 340 × 200 pt，重新铺满卡片。**未在模拟器验证。**

`CATransaction` 那三行关闭了这次修改的隐式动画。不加的话，图层已经显示过时，渐变会用一段动画慢慢变大，这段时间里和卡片对不上。

## 切换深浅色后更新图层的颜色

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

## 参见

- [`CALayer`](../api/ca-layer.md)：图层的全部属性，图层上的颜色，过渡动画
- [`CAGradientLayer`](../api/ca-gradient-layer.md)、[`CAShapeLayer`](../api/ca-shape-layer.md)
- [`UIBezierPath`](../api/ui-bezier-path.md)：路径怎么画
- [`CATransaction`](../api/ca-transaction.md)：关闭隐式动画
- [适配深色模式](dark-mode.md)
