---
type: reference
native: UIBezierPath
status: partial
---

# `UIBezierPath`

**`UIBezierPath`** 表示一条路径：由直线段、曲线段和圆弧连成的几何形状。矩形、椭圆、圆角矩形、圆弧有现成的创建方法，其他形状用「移动到一点、连线到下一点」的方式一段一段画出来。

路径只描述形状。它没有颜色，没有线宽，创建之后屏幕上不会出现任何东西。路径有三个用处：

- 赋给 [`CAShapeLayer`](ca-layer.md#cashapelayer) 的 `path`，由形状图层把它画出来。
- 赋给关键帧动画的 `path`，让图层沿着它移动，见[动画](ca-animation.md)。
- 调 [`containsPoint()`](ui-bezier-path/containspoint.md)，判断一个点是否在形状内部。

**继承关系**：`EventTarget` → `NSObject` → `UIBezierPath`

`UIBezierPath` 不能被继承，见[原生类](native-classes.md)。怎么画出常见的形状，见指南[画一条路径](../guides/drawing-paths.md)。

## 构造函数

[`UIBezierPath()`](ui-bezier-path/constructor.md)

创建一条空路径，之后用画线的方法一段一段加进去。

## 静态方法

这几个方法都返回新建的 `UIBezierPath`：

| 方法 | 说明 |
| --- | --- |
| [`UIBezierPath.bezierPathWithRect()`](ui-bezier-path/bezierpathwithrect.md) | 矩形 |
| [`UIBezierPath.bezierPathWithOvalInRect()`](ui-bezier-path/bezierpathwithovalinrect.md) | 矩形的内切椭圆。矩形是正方形时是圆 |
| [`UIBezierPath.bezierPathWithRoundedRect()`](ui-bezier-path/bezierpathwithroundedrect.md) | 圆角矩形，可以只让某几个角是圆角 |
| [`UIBezierPath.bezierPathWithArcCenter()`](ui-bezier-path/bezierpathwitharccenter.md) | 一段圆弧 |

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`isEmpty`](ui-bezier-path/isempty.md) <small>只读</small> | 路径里是否什么都没有 |
| [`bounds`](ui-bezier-path/bounds.md) <small>只读</small> | 包住整条路径的矩形，不含线宽 |
| [`currentPoint`](ui-bezier-path/currentpoint.md) <small>只读</small> | 当前点：下一段线从这里开始 |
| [`usesEvenOddFillRule`](ui-bezier-path/usesevenoddfillrule.md) | `containsPoint()` 用哪种规则判断内部 |

## 实例方法

画线的方法从[当前点](#路径由什么组成)画到新的一点：

| 方法 | 说明 |
| --- | --- |
| [`moveToPoint()`](ui-bezier-path/movetopoint.md) | 开始一段新的子路径，不画线 |
| [`addLineToPoint()`](ui-bezier-path/addlinetopoint.md) | 画直线 |
| [`addCurveToPoint()`](ui-bezier-path/addcurvetopoint.md) | 画三次贝塞尔曲线，两个控制点 |
| [`addQuadCurveToPoint()`](ui-bezier-path/addquadcurvetopoint.md) | 画二次贝塞尔曲线，一个控制点 |
| [`addArcWithCenter()`](ui-bezier-path/addarcwithcenter.md) | 加一段圆弧 |
| [`closePath()`](ui-bezier-path/closepath.md) | 画直线回到这段子路径的起点 |
| [`removeAllPoints()`](ui-bezier-path/removeallpoints.md) | 清空路径 |

组合、变换和查询：

| 方法 | 说明 |
| --- | --- |
| [`appendPath()`](ui-bezier-path/appendpath.md) | 把另一条路径加进这一条 |
| [`applyTransform()`](ui-bezier-path/applytransform.md) | 移动、缩放、旋转这条路径 |
| [`bezierPathByReversingPath()`](ui-bezier-path/bezierpathbyreversingpath.md) | 形状相同、方向相反的一条新路径 |
| [`containsPoint()`](ui-bezier-path/containspoint.md) | 一个点是否在形状内部 |

## 事件

路径不派发事件。路径只会被代码修改，修改之后读属性就是新的值。

## 路径由什么组成

一条路径由一段或几段**子路径**组成。每段子路径是一串首尾相接的线段：

- [`moveToPoint()`](ui-bezier-path/movetopoint.md) 开始一段新的子路径，把起点放在指定的位置。
- [`addLineToPoint()`](ui-bezier-path/addlinetopoint.md)、[`addCurveToPoint()`](ui-bezier-path/addcurvetopoint.md) 等方法从**当前点**画到新的一点，新的一点成为当前点。当前点用 [`currentPoint`](ui-bezier-path/currentpoint.md) 读。
- [`closePath()`](ui-bezier-path/closepath.md) 从当前点画一条直线回到这段子路径的起点。

再调一次 `moveToPoint()` 就开始第二段子路径，它和前一段不相连。一条路径里可以有多个互不相连的形状。

路径创建之后可以继续修改：追加线段、追加另一条路径、做变换、清空。

## 坐标和角度

坐标和长度的单位是[点（pt）](units.md)。x 轴朝右，y 轴朝下。路径里的坐标没有固定的原点：赋给形状图层之后，按那个图层自己的坐标系解释，原点是图层的左上角。

接受 `CGPoint`、`CGRect`、`CGSize` 的参数，也接受字段相同的普通对象，比如 `{ x: 10, y: 20 }`，见[结构体](structs.md)。

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

形状图层和关键帧动画保存的是赋值那一刻的形状。之后再修改这条路径，图层和动画不会跟着变，要再赋值一次。**「不重新赋值时图层不变」未在模拟器验证。**

## 示例

### 一条折线和一个扇形

从空白 App 开始，在一块灰色的区域里画一条蓝色的折线和一个橙色的扇形。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const card = new UIView();
  card.frame = new CGRect(20, 100, 300, 160);
  card.backgroundColor = 'secondarySystemBackground';
  page.view.addSubview(card);

  // 折线：移动到起点，再依次连到后面三个点
  const line = new UIBezierPath();
  line.moveToPoint(new CGPoint(24, 130));
  line.addLineToPoint(new CGPoint(68, 60));
  line.addLineToPoint(new CGPoint(104, 96));
  line.addLineToPoint(new CGPoint(148, 30));

  // 路径自己不显示。交给形状图层，线宽和颜色设在图层上
  const lineLayer = new CAShapeLayer();
  lineLayer.path = line;
  lineLayer.fillColor = null;
  lineLayer.strokeColor = 'systemBlue';
  lineLayer.lineWidth = 3;
  lineLayer.frame = card.bounds;
  card.layer.addSublayer(lineLayer);

  // 扇形：从圆心出发，画一段弧，再回到圆心
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

更多写法见指南[画一条路径](../guides/drawing-paths.md)。

## 对应的 iOS API

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

## 参见

- [画一条路径](../guides/drawing-paths.md)：矩形、圆弧、扇形、曲线、几个形状放一起、点击判断
- [`CAShapeLayer`](ca-layer.md#cashapelayer)：把路径画出来，线宽、颜色、虚线都在它上面
- [动画](ca-animation.md)：让图层沿路径移动，或者让形状从一条路径变成另一条
- [结构体](structs.md)：`CGPoint`、`CGRect`、`CGSize`、`CGAffineTransform`
- [单位](units.md)
