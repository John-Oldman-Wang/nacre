---
type: reference
native: UIBezierPath
status: partial
---

# `UIBezierPath`

**`UIBezierPath`** 表示一条路径：由直线段、曲线段和圆弧连成的几何形状。矩形、椭圆、圆角矩形有现成的创建方法，其他形状用「移动到一点、连线到下一点」的方式一段一段画出来。

路径只描述形状。它没有颜色，没有线宽，创建之后屏幕上不会出现任何东西。路径有三个用处：

- 赋给 [`CAShapeLayer`](ca-layer.md#cashapelayer) 的 `path`，由形状图层把它画出来。
- 赋给关键帧动画的 `path`，让图层沿着它移动，见[动画](ca-animation.md)。
- 调 `containsPoint()`，判断一个点是否在形状内部。

## 路径由什么组成

一条路径由一段或几段**子路径**组成。每段子路径是一串首尾相接的线段：

- `moveToPoint()` 开始一段新的子路径，把起点放在指定的位置。
- `addLineToPoint()`、`addCurveToPoint()` 等方法从**当前点**画到新的一点，新的一点成为当前点。当前点用 `currentPoint` 读。
- `closePath()` 从当前点画一条直线回到这段子路径的起点。

再调一次 `moveToPoint()` 就开始第二段子路径，它和前一段不相连。一条路径里可以有多个互不相连的形状。

路径创建之后可以继续修改：追加线段、追加另一条路径、做变换、清空。

## 坐标和角度

坐标的单位是[点（pt）](units.md)。x 轴朝右，y 轴朝下。路径里的坐标没有固定的原点：赋给形状图层之后，按那个图层自己的坐标系解释，原点是图层的左上角。

角度的单位是**弧度**，不是度。180° 是 `Math.PI`。0 弧度指向正右方。因为 y 轴朝下，角度增大的方向在屏幕上是顺时针：

| 角度 | 方向 |
| --- | --- |
| `0` | 正右 |
| `Math.PI / 2` | 正下 |
| `Math.PI` | 正左 |
| `-Math.PI / 2`，或 `Math.PI * 1.5` | 正上 |

画圆弧时的 `clockwise` 决定从起始角度到结束角度走哪一边：`true` 沿屏幕上的顺时针方向走，`false` 沿逆时针方向走。同样的两个角度，两种走法得到的是一个圆上互补的两段弧。

上表的方向和 `clockwise` 在屏幕上的走向来自 iOS 的定义，**未在模拟器验证**。

## 线宽和颜色在图层上

线有多粗、什么颜色、端点和拐角是什么形状、是不是虚线、形状内部填什么颜色，这些都是 [`CAShapeLayer`](ca-layer.md#cashapelayer) 的属性，不在路径上。同一条路径可以赋给几个图层，各自用不同的线宽和颜色画出来。

## 改了路径之后要重新赋值

形状图层和关键帧动画保存的是赋值那一刻的形状。之后再修改这条路径，图层和动画不会跟着变。

推荐的做法是**先把路径画完，再赋给图层**。需要更新形状时，新建一条路径（或者改完原来那条），再赋值一次：

```js
const shape = new CAShapeLayer();

/** @param {number} height */
function update(height) {
  const path = new UIBezierPath();
  path.moveToPoint(new CGPoint(0, 100));
  path.addLineToPoint(new CGPoint(50, 100 - height));
  path.addLineToPoint(new CGPoint(100, 100));
  shape.path = path;
}

update(40);
update(80);
```

**效果**：第二次调用之后，形状图层画的是高度为 80 pt 的折线。「不重新赋值时图层不变」这一点**未在模拟器验证**。

## 完整例子

下面的代码从空白 App 开始，在一块灰色的区域里画一条蓝色的折线和一个橙色的扇形。

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

## 常见用法

以下例子只创建路径。把路径显示出来的写法和上面相同：赋给一个 [`CAShapeLayer`](ca-layer.md#cashapelayer) 的 `path`。

### 矩形、椭圆和圆

```js
const rect = UIBezierPath.bezierPathWithRect(new CGRect(10, 20, 30, 40));
const oval = UIBezierPath.bezierPathWithOvalInRect(new CGRect(0, 0, 80, 50));
const circle = UIBezierPath.bezierPathWithOvalInRect(new CGRect(0, 0, 50, 50));
```

**结果**：`rect` 是左上角在 (10, 20)、30 × 40 pt 的矩形。`oval` 是 80 × 50 pt 的矩形的内切椭圆。`circle` 是直径 50 pt 的圆：给的矩形是正方形时，内切椭圆就是圆。

### 圆角矩形

```js
const rounded = UIBezierPath.bezierPathWithRoundedRect(
  new CGRect(0, 0, 120, 60), { cornerRadius: 8 });
```

**结果**：一个 120 × 60 pt 的矩形，四个角是半径 8 pt 的圆角。

只让某几个角是圆角，用另一组选项：

```js
const tab = UIBezierPath.bezierPathWithRoundedRect(new CGRect(0, 0, 120, 60), {
  byRoundingCorners: ['topLeft', 'topRight'],
  cornerRadii: new CGSize(12, 12),
});
```

**结果**：上面两个角是半径 12 pt 的圆角，下面两个角是直角。

`cornerRadii` 是一个 `CGSize`，`width` 是圆角的横向半径，`height` 是纵向半径。两个值不同时圆角是一段椭圆弧。**两个值不同时的形状未在模拟器验证。**

角名只有 `'topLeft'`、`'topRight'`、`'bottomLeft'`、`'bottomRight'` 四个。四个角都要时把四个名字都写上。

只是给一个视图加圆角时，不需要路径，用 `view.layer.cornerRadius`，见 [`CALayer`](ca-layer.md)。

### 圆弧和整圆

```js
const arc = UIBezierPath.bezierPathWithArcCenter(new CGPoint(50, 50), {
  radius: 50, startAngle: 0, endAngle: Math.PI, clockwise: true,
});
```

**结果**：一段半圆弧。圆心在 (50, 50)，半径 50 pt，从正右方沿顺时针方向经过正下方到正左方。

四个选项都必须给，没有默认值。

画整圆时，让结束角度比起始角度大 `2 * Math.PI`。做进度环时从正上方开始：

```js
const ring = UIBezierPath.bezierPathWithArcCenter(new CGPoint(50, 50), {
  radius: 40, startAngle: -Math.PI / 2, endAngle: Math.PI * 1.5, clockwise: true,
});
```

**结果**：一个半径 40 pt 的整圆，起点和终点都在正上方，方向是顺时针。配合形状图层的 `strokeEnd` 可以只画出其中一部分。

### 折线和闭合的形状

```js
const triangle = new UIBezierPath();
triangle.moveToPoint(new CGPoint(50, 0));
triangle.addLineToPoint(new CGPoint(100, 80));
triangle.addLineToPoint(new CGPoint(0, 80));
triangle.closePath();
```

**结果**：一个三角形。`closePath()` 加上了从 (0, 80) 回到起点 (50, 0) 的第三条边。

不调 `closePath()` 时，路径是两条边的折线。这时填充和描边的结果不同：

- **填充**按闭合之后的形状算，仍然填出一个三角形。
- **描边**只画出实际存在的两条边。

所以要描出完整轮廓的形状，画完后调 `closePath()`。

### 曲线

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

**结果**：从 (0, 50) 出发，先是一段 S 形的曲线到 (100, 50)，再是一段向上拱起的曲线到 (150, 50)。

控制点决定曲线的弯曲方向，曲线本身不经过控制点。曲线从起点出发时朝向第一个控制点，到达终点时来自最后一个控制点的方向。

### 扇形

`addArcWithCenter()` 在已有当前点时，会先从当前点画一条直线到圆弧的起点，再画圆弧。扇形利用了这一点：

```js
const center = new CGPoint(60, 60);
const pie = new UIBezierPath();
pie.moveToPoint(center);                      // 当前点在圆心
pie.addArcWithCenter(center, {                // 先连到弧的起点，再画弧
  radius: 50, startAngle: 0, endAngle: Math.PI / 2, clockwise: true,
});
pie.closePath();                              // 从弧的终点连回圆心
```

**结果**：一个四分之一圆的扇形，圆心在 (60, 60)，占右下方的那一块。

画饼图时，每一块用一条这样的路径和一个形状图层，起始角度接着上一块的结束角度。

### 在一条路径里放几个形状

```js
const bars = new UIBezierPath();
bars.appendPath(UIBezierPath.bezierPathWithRect(new CGRect(0, 40, 10, 20)));
bars.appendPath(UIBezierPath.bezierPathWithRect(new CGRect(20, 10, 10, 50)));
bars.appendPath(UIBezierPath.bezierPathWithRect(new CGRect(40, 0, 10, 60)));
console.log(String(bars.bounds));
```

**结果**：`bars` 里有三个宽 10 pt 的矩形，高度分别是 20、50、60 pt，底边对齐。控制台输出 `CGRect(0, 0, 50, 60)`。

颜色和线宽都相同的一批图形，可以放进一条路径，只用一个形状图层画出来。颜色不同的图形要分开，每种颜色一条路径和一个图层。

`appendPath()` 加进来的是另一条路径当时的形状。之后再修改那条路径，这一条不变。**后一句未在模拟器验证。**

### 移动和缩放路径

```js
const box = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 100, 100));
box.applyTransform(CGAffineTransform.translation(10, 0));
console.log(box.bounds.x);
```

**结果**：控制台输出 `10`。矩形整体向右移了 10 pt。

`applyTransform()` 直接修改这条路径，不返回新路径。缩放用 `CGAffineTransform.scale()`，旋转用 `CGAffineTransform.rotation()`，见[结构体](structs.md)。缩放和旋转都以坐标原点 (0, 0) 为中心，不是以路径的中心。

### 判断一个点在不在形状里

```js
const box = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 100, 100));
console.log(box.containsPoint(new CGPoint(50, 50)));
console.log(box.containsPoint(new CGPoint(150, 50)));
```

**结果**：控制台依次输出 `true`、`false`。

`containsPoint()` 判断的是填充区域：点在路径围出的范围之内才算。它不考虑线宽，落在描边上但在形状之外的点不算。没有闭合的路径按闭合之后的形状判断。**后两句未在模拟器验证。**

传进去的点和路径要在同一个坐标系里。触摸事件给的位置是视图坐标系里的，路径赋给了一个 `frame` 原点不在 (0, 0) 的图层时，要先减去图层的原点。

## 成员说明

接受 `CGPoint`、`CGRect`、`CGSize` 的参数，也接受字段相同的普通对象，比如 `{ x: 10, y: 20 }`，见[结构体](structs.md)。字段缺失或者转换不出有限数时抛 `TypeError`：

```
TypeError: moveToPoint needs an object with all of: x, y
TypeError: moveToPoint is missing y, or it is not a finite number
```

所有坐标和长度的单位是[点（pt）](units.md)，角度的单位是弧度。

`UIBezierPath` 不能被继承，见[原生类](native-classes.md)。

### 创建

| 写法 | 得到什么 |
| --- | --- |
| `new UIBezierPath()` | 一条空路径 |
| `UIBezierPath.bezierPathWithRect(rect)` | 矩形 |
| `UIBezierPath.bezierPathWithOvalInRect(rect)` | `rect` 的内切椭圆。`rect` 是正方形时是圆 |
| `UIBezierPath.bezierPathWithRoundedRect(rect, options)` | 圆角矩形 |
| `UIBezierPath.bezierPathWithArcCenter(center, options)` | 一段圆弧 |

这些方法都返回新建的 `UIBezierPath`。

**`bezierPathWithRoundedRect(rect, options)`**

`options` 二选一：

| `options` | 效果 |
| --- | --- |
| `{ cornerRadius }` | 四个角都是圆角，半径是 `cornerRadius`（数，pt） |
| `{ byRoundingCorners, cornerRadii }` | `byRoundingCorners` 是角名数组，只有列出的角是圆角。`cornerRadii` 是 `CGSize`，`width` 是横向半径，`height` 是纵向半径 |

角名的取值：

| 角名 | 哪个角 |
| --- | --- |
| `'topLeft'` | 左上 |
| `'topRight'` | 右上 |
| `'bottomLeft'` | 左下 |
| `'bottomRight'` | 右下 |

- **出错**：
  - 两组选项都没给：`TypeError: bezierPathWithRoundedRect needs { cornerRadius } or { byRoundingCorners, cornerRadii }`
  - 角名写错：抛 `TypeError`，报错信息里列出四个角名。

**`bezierPathWithArcCenter(center, options)`**

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `center` | `CGPoint` | 圆心 |
| `options.radius` | 数 | 半径，pt |
| `options.startAngle` | 数 | 起始角度，弧度 |
| `options.endAngle` | 数 | 结束角度，弧度 |
| `options.clockwise` | 布尔 | `true` 沿屏幕上的顺时针方向从起始角度画到结束角度；`false` 沿逆时针方向 |

- 四个选项都必须给。
- **出错**：缺少任何一个时抛 `TypeError`，报错信息指出缺的是哪个：`TypeError: bezierPathWithArcCenter needs { radius, startAngle, endAngle, clockwise }; missing startAngle`

### 画线

这些方法都没有返回值。

| 方法 | 作用 |
| --- | --- |
| `moveToPoint(point)` | 开始一段新的子路径，起点是 `point`。不画线 |
| `addLineToPoint(point)` | 从当前点画直线到 `point` |
| `addCurveToPoint(point, { controlPoint1, controlPoint2 })` | 从当前点画三次贝塞尔曲线到 `point`。两个控制点都是 `CGPoint` |
| `addQuadCurveToPoint(point, { controlPoint })` | 从当前点画二次贝塞尔曲线到 `point`。一个控制点 |
| `addArcWithCenter(center, { radius, startAngle, endAngle, clockwise })` | 加一段圆弧，参数含义和 `bezierPathWithArcCenter()` 相同。已有当前点时，先从当前点画直线到圆弧的起点 |
| `closePath()` | 从当前点画直线回到这段子路径的起点 |
| `removeAllPoints()` | 清空路径。之后 `isEmpty` 是 `true` |

- 画线之前要先调 `moveToPoint()` 给出起点。在空路径上直接调 `addLineToPoint()` 的结果**未在模拟器验证**。
- `addArcWithCenter()` 的四个选项都必须给。缺少时抛 `TypeError: addArcWithCenter needs { radius, startAngle, endAngle, clockwise }; missing …`。

### 组合和变换

| 方法 | 返回 | 作用 |
| --- | --- | --- |
| `appendPath(path)` | 无 | 把另一条路径的全部子路径加到这一条里 |
| `applyTransform(transform)` | 无 | 对这条路径的所有点做变换，直接修改这条路径。`transform` 是 `CGAffineTransform`，见[结构体](structs.md) |
| `bezierPathByReversingPath()` | 新的 `UIBezierPath` | 形状相同、方向相反的一条新路径。原路径不变 |

- 路径的方向在两个地方有影响：形状图层的 `fillRule` 是 `'nonZero'` 时哪些区域被填充，以及沿路径做动画时的行进方向。
- **出错**：`appendPath()` 的参数不是路径时抛 `TypeError: appendPath: expects a UIBezierPath`。

### 查询

| 成员 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `isEmpty` | 布尔 | 是 | 否 | `true` | 路径里是否什么都没有。调过 `moveToPoint()` 之后就是 `false` |
| `bounds` | `CGRect` | 是 | 否 | `(0, 0, 0, 0)` | 包住整条路径的矩形，单位 pt。不含线宽 |
| `currentPoint` | `CGPoint` | 是 | 否 | `(0, 0)` | 当前点。空路径时是 `(0, 0)` |
| `usesEvenOddFillRule` | 布尔 | 是 | 是 | `false` | `containsPoint()` 用哪种规则判断内部。`false` 用非零规则，`true` 用奇偶规则 |

- 这几个值随路径的修改而变，没有事件。路径只会被代码修改。
- `bounds`：只有直线的路径，得到的是恰好包住所有顶点的矩形。含贝塞尔曲线的路径，这个矩形是否把控制点也包进去，**未在模拟器验证**。
- `usesEvenOddFillRule` 不影响形状图层怎么填充，图层只看自己的 `fillRule`。两种规则的含义见 [`CAShapeLayer`](ca-layer.md#cashapelayer)。它对 `containsPoint()` 的影响**未在模拟器验证**。

**`containsPoint(point)`**

- **参数**：`point`，一个 `CGPoint`。
- **返回**：布尔。点在路径的填充区域内是 `true`，否则是 `false`。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `[UIBezierPath bezierPath]` | `new UIBezierPath()` |
| `[UIBezierPath bezierPathWithRect:r]` | `UIBezierPath.bezierPathWithRect(r)` |
| `[UIBezierPath bezierPathWithOvalInRect:r]` | `UIBezierPath.bezierPathWithOvalInRect(r)` |
| `[UIBezierPath bezierPathWithRoundedRect:r cornerRadius:8]` | `UIBezierPath.bezierPathWithRoundedRect(r, { cornerRadius: 8 })` |
| `[UIBezierPath bezierPathWithRoundedRect:r byRoundingCorners:UIRectCornerTopLeft cornerRadii:s]` | `UIBezierPath.bezierPathWithRoundedRect(r, { byRoundingCorners: ['topLeft'], cornerRadii: s })` |
| `UIRectCornerAllCorners` | `['topLeft', 'topRight', 'bottomLeft', 'bottomRight']` |
| `[UIBezierPath bezierPathWithArcCenter:c radius:50 startAngle:0 endAngle:M_PI clockwise:YES]` | `UIBezierPath.bezierPathWithArcCenter(c, { radius: 50, startAngle: 0, endAngle: Math.PI, clockwise: true })` |
| `[path moveToPoint:p]` | `path.moveToPoint(p)` |
| `[path addLineToPoint:p]` | `path.addLineToPoint(p)` |
| `[path addCurveToPoint:p controlPoint1:a controlPoint2:b]` | `path.addCurveToPoint(p, { controlPoint1: a, controlPoint2: b })` |
| `[path addQuadCurveToPoint:p controlPoint:c]` | `path.addQuadCurveToPoint(p, { controlPoint: c })` |
| `[path addArcWithCenter:c radius:r startAngle:s endAngle:e clockwise:YES]` | `path.addArcWithCenter(c, { radius: r, startAngle: s, endAngle: e, clockwise: true })` |
| `[path closePath]` | `path.closePath()` |
| `[path removeAllPoints]` | `path.removeAllPoints()` |
| `[path appendPath:other]` | `path.appendPath(other)` |
| `[path applyTransform:t]` | `path.applyTransform(t)` |
| `[path bezierPathByReversingPath]` | `path.bezierPathByReversingPath()` |
| `[path containsPoint:p]` | `path.containsPoint(p)` |
| `path.empty` | `path.isEmpty` |
| `path.usesEvenOddFillRule` | `path.usesEvenOddFillRule` |
| `shapeLayer.path = path.CGPath` | `shapeLayer.path = path` |
| `path.lineWidth = 3`，再 `[path stroke]` | `shapeLayer.lineWidth = 3`，线宽在图层上 |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 让路径自己把自己画出来 | `-fill`、`-stroke`、`-addClip`，以及路径上的 `lineWidth`、`lineCapStyle`、`lineJoinStyle`、`miterLimit`、`flatness` | 未实现。这些只能在自定义绘制（`drawRect:`）里用，需要先支持用 JS 继承原生类。现在用 `CAShapeLayer` 画 |
| 读出路径里的每个点 | `CGPath` 的遍历 | 未实现 |
| 从 `CGPath` 创建路径 | `bezierPathWithCGPath:` | 未实现 |
| 读路径上的虚线设置 | `getLineDash:count:phase:` | 未实现。虚线设在 `CAShapeLayer` 上 |

## 参见

- [`CAShapeLayer`](ca-layer.md#cashapelayer)：把路径画出来，线宽、颜色、虚线都在它上面
- [动画](ca-animation.md)：让图层沿路径移动，或者让形状从一条路径变成另一条
- [结构体](structs.md)：`CGPoint`、`CGRect`、`CGSize`、`CGAffineTransform`
- [单位](units.md)
- [实现原理：图层和路径](../internals/ca-layer.md)
