---
type: reference
native: CAShapeLayer
status: partial
---

# `CAShapeLayer`

**`CAShapeLayer`** 表示形状图层：把一条路径（[`UIBezierPath`](ui-bezier-path.md)）画出来。它先填充路径围出的区域，再沿路径描边。折线图、饼图、进度环都用它画。

它是一个[图层](ca-layer.md)，和别的子图层一样要自己设 `frame`，再加到某个视图的图层下面。它不按路径调整自己的大小：路径里的坐标是图层自己坐标系里的点，原点是图层的左上角。

> **注意**：[`fillColor`](ca-shape-layer/fillcolor.md) 默认是不透明的黑色，[`strokeColor`](ca-shape-layer/strokecolor.md) 默认是 `null`。只要一条线时，要把 `fillColor` 设成 `null`、给 `strokeColor` 一个颜色。

`CAShapeLayer` 不派发事件。它的属性只会被 App 的代码修改，所以没有变化通知。

**继承关系**：`EventTarget` → `NSObject` → [`CALayer`](ca-layer.md) → `CAShapeLayer`

怎么画折线、扇形、进度环、虚线，见指南[用图层画圆角、阴影、渐变和形状](../guides/layers.md)。

## 构造函数

[`CAShapeLayer()`](ca-shape-layer/constructor.md)

创建一个形状图层。大小是 0 × 0 pt，没有路径。

## 实例属性

还继承 [`CALayer`](ca-layer.md) 的属性，常用的是 `frame`、`masksToBounds`。

| 属性 | 说明 |
| --- | --- |
| [`path`](ca-shape-layer/path.md) | 要画的路径 |

填充：

| 属性 | 说明 |
| --- | --- |
| [`fillColor`](ca-shape-layer/fillcolor.md) | 填充颜色 |
| [`fillRule`](ca-shape-layer/fillrule.md) | 哪些区域算在路径内部 |

描边：

| 属性 | 说明 |
| --- | --- |
| [`strokeColor`](ca-shape-layer/strokecolor.md) | 线的颜色 |
| [`lineWidth`](ca-shape-layer/linewidth.md) | 线宽 |
| [`lineCap`](ca-shape-layer/linecap.md) | 线两端的形状 |
| [`lineJoin`](ca-shape-layer/linejoin.md) | 拐角的形状 |
| [`miterLimit`](ca-shape-layer/miterlimit.md) | 尖角的长度上限 |
| [`strokeStart`](ca-shape-layer/strokestart.md) | 描边从路径的哪里开始 |
| [`strokeEnd`](ca-shape-layer/strokeend.md) | 描边到路径的哪里结束 |
| [`lineDashPattern`](ca-shape-layer/linedashpattern.md) | 虚线的画法 |
| [`lineDashPhase`](ca-shape-layer/linedashphase.md) | 虚线从图案的哪里开始画 |

## 实例方法

`CAShapeLayer` 没有自己的方法。还继承 [`CALayer`](ca-layer.md) 的方法。

## 示例

### 一条折线

```js
const card = new UIView();
card.frame = new CGRect(20, 100, 300, 160);

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

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[CAShapeLayer layer]` | `new CAShapeLayer()` |
| `shape.path = path.CGPath` | `shape.path = path` |
| `shape.fillColor = UIColor.clearColor.CGColor` | `shape.fillColor = null` |
| `shape.fillRule = kCAFillRuleEvenOdd` | `shape.fillRule = 'evenOdd'` |
| `shape.lineCap = kCALineCapRound` | `shape.lineCap = 'round'` |
| `shape.lineJoin = kCALineJoinBevel` | `shape.lineJoin = 'bevel'` |
| `shape.lineDashPattern = @[@4, @2]` | `shape.lineDashPattern = [4, 2]` |

## 参见

- [`UIBezierPath`](ui-bezier-path.md)：`path` 的类型，路径怎么画
- [`CALayer`](ca-layer.md)：父类，子图层的大小、图层上的颜色
- [`CABasicAnimation`](ca-basic-animation.md)：给 `strokeEnd` 做动画，让线一点点画出来
- [用图层画圆角、阴影、渐变和形状](../guides/layers.md)
