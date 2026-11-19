# 画一条路径

这一篇讲怎么用 [`UIBezierPath`](../api/ui-bezier-path.md) 描出形状，再交给 [`CAShapeLayer`](../api/ca-layer.md#cashapelayer) 画到屏幕上：矩形、圆角、圆弧、折线、曲线、扇形，以及判断一个点落在不在形状里。每个方法的细节在 [`UIBezierPath`](../api/ui-bezier-path.md) 的参考页。

## 推荐的做法

- **路径只管形状，线宽和颜色设在形状图层上。** 路径赋给 `CAShapeLayer` 的 `path`，图层的 `strokeColor`、`fillColor`、`lineWidth` 决定画成什么样。同一条路径可以给几个图层用。
- **先把路径画完，再赋给图层。** 图层保存的是赋值那一刻的形状，之后再改路径，图层不跟着变。要更新形状就再赋值一次，见[更新形状](#更新形状)。
- **只描线不填充时，把图层的 `fillColor` 设成 `null`。** 形状图层默认用黑色填充。
- **要描出完整轮廓，画完调 `closePath()`。** 不闭合时填充照样按闭合算，描边会缺最后一条边。
- **角度用弧度。** 180° 是 `Math.PI`，0 在正右方，角度增大是顺时针，见[坐标和角度](../api/ui-bezier-path.md#坐标和角度)。

## 第一条路径

从空白 App 开始，在一块灰色的区域里画一条蓝色的折线和一个橙色的扇形。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 一块固定大小的区域，用来放图形
  const card = new UIView();
  card.frame = new CGRect(20, 100, 300, 160);
  card.backgroundColor = 'secondarySystemBackground';
  page.view.addSubview(card);

  // 2. 折线：移动到起点，再依次连到后面三个点
  const line = new UIBezierPath();
  line.moveToPoint(new CGPoint(24, 130));
  line.addLineToPoint(new CGPoint(68, 60));
  line.addLineToPoint(new CGPoint(104, 96));
  line.addLineToPoint(new CGPoint(148, 30));

  // 3. 路径自己不显示。交给形状图层，线宽和颜色设在图层上
  const lineLayer = new CAShapeLayer();
  lineLayer.path = line;
  lineLayer.fillColor = null;           // 不填充，只描线
  lineLayer.strokeColor = 'systemBlue';
  lineLayer.lineWidth = 3;
  lineLayer.frame = card.bounds;
  card.layer.addSublayer(lineLayer);

  // 4. 扇形：从圆心出发，画一段弧，再回到圆心
  const center = new CGPoint(224, 80);
  const pie = new UIBezierPath();
  pie.moveToPoint(center);
  pie.addArcWithCenter(center, {
    radius: 56, startAngle: -Math.PI / 2, endAngle: Math.PI / 3, clockwise: true,
  });
  pie.closePath();

  const pieLayer = new CAShapeLayer();
  pieLayer.path = pie;
  pieLayer.fillColor = 'systemOrange';
  pieLayer.frame = card.bounds;
  card.layer.addSublayer(pieLayer);
});
```

**效果**

- 屏幕上方出现一块 300 × 160 pt 的浅灰色区域。
- 区域左半边有一条 3 pt 粗的蓝色折线，共三段。
- 区域右半边有一个橙色的扇形，半径 56 pt，从正上方开始沿顺时针方向扫过 150°。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

下面的例子只创建路径。把路径显示出来的写法和上面相同：赋给一个 `CAShapeLayer` 的 `path`，再把图层加到视图的 `layer` 上。

## 画矩形、椭圆和圆

```js
const rect = UIBezierPath.bezierPathWithRect(new CGRect(10, 20, 30, 40));
const oval = UIBezierPath.bezierPathWithOvalInRect(new CGRect(0, 0, 80, 50));
const circle = UIBezierPath.bezierPathWithOvalInRect(new CGRect(0, 0, 50, 50));
```

**效果**：`rect` 是左上角在 (10, 20)、30 × 40 pt 的矩形。`oval` 是 80 × 50 pt 的矩形的内切椭圆。`circle` 是直径 50 pt 的圆：给的矩形是正方形时，内切椭圆就是圆。

## 画圆角矩形

```js
const rounded = UIBezierPath.bezierPathWithRoundedRect(
  new CGRect(0, 0, 120, 60), { cornerRadius: 8 });
```

**效果**：一个 120 × 60 pt 的矩形，四个角是半径 8 pt 的圆角。

只让某几个角是圆角，用另一组选项：

```js
const tab = UIBezierPath.bezierPathWithRoundedRect(new CGRect(0, 0, 120, 60), {
  byRoundingCorners: ['topLeft', 'topRight'],
  cornerRadii: new CGSize(12, 12),
});
```

**效果**：上面两个角是半径 12 pt 的圆角，下面两个角是直角。**未在模拟器验证。**

角名只有 `'topLeft'`、`'topRight'`、`'bottomLeft'`、`'bottomRight'` 四个，见 [`bezierPathWithRoundedRect()`](../api/ui-bezier-path/bezierpathwithroundedrect.md)。

只是给一个视图加圆角时，不需要路径，用 `view.layer.cornerRadius`，见 [`CALayer`](../api/ca-layer.md)。

## 画圆弧和整圆

```js
const arc = UIBezierPath.bezierPathWithArcCenter(new CGPoint(50, 50), {
  radius: 50, startAngle: 0, endAngle: Math.PI, clockwise: true,
});
```

**效果**：一段半圆弧。圆心在 (50, 50)，半径 50 pt，从正右方沿顺时针方向经过正下方到正左方。

四个选项都必须给，没有默认值。

画整圆时，让结束角度比起始角度大 `2 * Math.PI`。做进度环时从正上方开始：

```js
const ring = UIBezierPath.bezierPathWithArcCenter(new CGPoint(50, 50), {
  radius: 40, startAngle: -Math.PI / 2, endAngle: Math.PI * 1.5, clockwise: true,
});
```

**效果**：一个半径 40 pt 的整圆，起点和终点都在正上方，方向是顺时针。配合形状图层的 `strokeEnd` 可以只画出其中一部分。

## 画折线和闭合的形状

```js
const triangle = new UIBezierPath();
triangle.moveToPoint(new CGPoint(50, 0));
triangle.addLineToPoint(new CGPoint(100, 80));
triangle.addLineToPoint(new CGPoint(0, 80));
triangle.closePath();
```

**效果**：一个三角形。`closePath()` 加上了从 (0, 80) 回到起点 (50, 0) 的第三条边。

不调 `closePath()` 时，路径是两条边的折线。这时填充和描边的结果不同：

- **填充**按闭合之后的形状算，仍然填出一个三角形。
- **描边**只画出实际存在的两条边。

所以要描出完整轮廓的形状，画完后调 `closePath()`。

## 画曲线

```js
const wave = new UIBezierPath();
wave.moveToPoint(new CGPoint(0, 50));

// 三次贝塞尔曲线：两个控制点
wave.addCurveToPoint(new CGPoint(100, 50), {
  controlPoint1: new CGPoint(30, 0),
  controlPoint2: new CGPoint(70, 100),
});

// 二次贝塞尔曲线：一个控制点
wave.addQuadCurveToPoint(new CGPoint(150, 50), {
  controlPoint: new CGPoint(125, 20),
});
```

**效果**：从 (0, 50) 出发，先是一段 S 形的曲线到 (100, 50)，再是一段向上拱起的曲线到 (150, 50)。

控制点决定曲线的弯曲方向，曲线本身不经过控制点。曲线从起点出发时朝向第一个控制点，到达终点时来自最后一个控制点的方向。

## 画扇形

[`addArcWithCenter()`](../api/ui-bezier-path/addarcwithcenter.md) 在已有当前点时，会先从当前点画一条直线到圆弧的起点，再画圆弧。扇形利用了这一点：

```js
const pieCenter = new CGPoint(60, 60);
const slice = new UIBezierPath();
slice.moveToPoint(pieCenter);                 // 当前点在圆心
slice.addArcWithCenter(pieCenter, {           // 先连到弧的起点，再画弧
  radius: 50, startAngle: 0, endAngle: Math.PI / 2, clockwise: true,
});
slice.closePath();                            // 从弧的终点连回圆心
```

**效果**：一个四分之一圆的扇形，圆心在 (60, 60)，占右下方的那一块。

画饼图时，每一块用一条这样的路径和一个形状图层，起始角度接着上一块的结束角度。

## 在一条路径里放几个形状

```js
const bars = new UIBezierPath();
bars.appendPath(UIBezierPath.bezierPathWithRect(new CGRect(0, 40, 10, 20)));
bars.appendPath(UIBezierPath.bezierPathWithRect(new CGRect(20, 10, 10, 50)));
bars.appendPath(UIBezierPath.bezierPathWithRect(new CGRect(40, 0, 10, 60)));
console.log(String(bars.bounds));
```

**效果**：`bars` 里有三个宽 10 pt 的矩形，高度分别是 20、50、60 pt，底边对齐。控制台输出 `CGRect(0, 0, 50, 60)`。

颜色和线宽都相同的一批图形，可以放进一条路径，只用一个形状图层画出来。颜色不同的图形要分开，每种颜色一条路径和一个图层。

## 更新形状

形状图层和关键帧动画保存的是赋值那一刻的形状。之后再修改这条路径，图层和动画不会跟着变。需要更新形状时，新建一条路径（或者改完原来那条），再赋值一次：

```js
const chart = new CAShapeLayer();

/** @param {number} height */
function update(height) {
  const peak = new UIBezierPath();
  peak.moveToPoint(new CGPoint(0, 100));
  peak.addLineToPoint(new CGPoint(50, 100 - height));
  peak.addLineToPoint(new CGPoint(100, 100));
  chart.path = peak;
}

update(40);
update(80);
```

**效果**：第二次调用之后，形状图层画的是高度为 80 pt 的折线。「不重新赋值时图层不变」这一点**未在模拟器验证**。

## 移动和缩放路径

```js
const moved = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 100, 100));
moved.applyTransform(CGAffineTransform.translation(10, 0));
console.log(moved.bounds.x);
```

**效果**：控制台输出 `10`。矩形整体向右移了 10 pt。

[`applyTransform()`](../api/ui-bezier-path/applytransform.md) 直接修改这条路径，不返回新路径。缩放用 `CGAffineTransform.scale()`，旋转用 `CGAffineTransform.rotation()`，见[结构体](../api/structs.md)。缩放和旋转都以坐标原点 (0, 0) 为中心，不是以路径的中心。

## 判断点击落在哪个形状上

```js
const target = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 100, 100));
console.log(target.containsPoint(new CGPoint(50, 50)));
console.log(target.containsPoint(new CGPoint(150, 50)));
```

**效果**：控制台依次输出 `true`、`false`。

[`containsPoint()`](../api/ui-bezier-path/containspoint.md) 判断的是填充区域，不考虑线宽。传进去的点和路径要在同一个坐标系里：触摸事件给的位置是视图坐标系里的，路径赋给了一个 `frame` 原点不在 (0, 0) 的图层时，要先减去图层的原点。

## 参见

- [`UIBezierPath`](../api/ui-bezier-path.md)：全部方法和属性
- [`CAShapeLayer`](../api/ca-layer.md#cashapelayer)：把路径画出来，线宽、颜色、虚线、填充规则
- [动画](../api/ca-animation.md)：让图层沿路径移动
- [结构体](../api/structs.md)：`CGPoint`、`CGRect`、`CGSize`、`CGAffineTransform`
