# `UIBezierPath`

一条路径：直线、曲线、圆弧，以及现成的矩形 / 椭圆 / 圆角矩形。

路径**只管形状**，画出来是 [`CAShapeLayer`](ca-layer.md#cashapelayer) 的事。

```js
const line = new UIBezierPath();
line.moveToPoint(new CGPoint(0, 60));
line.addLineToPoint(new CGPoint(40, 20));
line.addLineToPoint(new CGPoint(80, 50));

const shape = new CAShapeLayer();
shape.path = line;
shape.strokeColor = 'systemBlue';
shape.fillColor = null;        // 默认是黑色实心，不设就糊成一团
shape.lineWidth = 3;
shape.frame = card.bounds;
card.layer.addSublayer(shape);
```

## 先读这两条

**角度一律是弧度**，而且 UIKit 的 y 轴朝下：**0 弧度在正右方，角度增大是顺时针**，和数学课上的方向相反。`clockwise: true` 画的就是这个方向。

**线宽、线头、虚线这些不在路径上，在图层上。** `UIBezierPath` 在 ObjC 里也有 `lineWidth` / `lineCapStyle` / `lineJoinStyle` / `miterLimit` / `flatness`，但那几个只服务于 `-fill` / `-stroke`——路径自己往当前绘图上下文里画的时候。画在 `CAShapeLayer` 上时生效的是**图层**的同名属性，路径上那套完全不参与。所以运行时只暴露图层那一套，避免摆两份设置、其中一份永远不起作用。

## 现成的形状

```js
UIBezierPath.bezierPathWithRect(new CGRect(10, 20, 30, 40))
UIBezierPath.bezierPathWithOvalInRect(new CGRect(0, 0, 50, 50))   // 正方形进去就是正圆
```

### 圆角矩形：两种写法

```js
// 四个角一样圆
UIBezierPath.bezierPathWithRoundedRect(rect, { cornerRadius: 8 })

// 挑角。半径是 CGSize，横纵可以不同
UIBezierPath.bezierPathWithRoundedRect(rect, {
  byRoundingCorners: ['topLeft', 'bottomRight'],
  cornerRadii: new CGSize(12, 12),
})
```

角名只有四个：`topLeft` / `topRight` / `bottomLeft` / `bottomRight`。**没有 `allCorners`**——它在 ObjC 里的值是 `~0`，和「四个位或起来」不是同一个数，往返不回来。四个角全圆就四个名字都写。

两种选项都不给会抛 `TypeError`。

### 圆弧

```js
UIBezierPath.bezierPathWithArcCenter(new CGPoint(50, 50), {
  radius: 50, startAngle: 0, endAngle: Math.PI, clockwise: true,
})
```

**四个选项都要给**，缺一个抛 `TypeError` 并点名缺的是哪个。原生这里没有默认值，我们也不发明一个。

## 自己画

```js
path.moveToPoint(p)        // 抬笔，开一段新的子路径
path.addLineToPoint(p)     // 从 currentPoint 连直线过去
path.closePath()           // 连回这段子路径的起点
path.removeAllPoints()
```

还没有 `currentPoint` 时 `addLineToPoint` 什么都不画。

### 曲线

```js
// 三次贝塞尔，两个控制点
path.addCurveToPoint(end, { controlPoint1: c1, controlPoint2: c2 })

// 二次贝塞尔，一个控制点
path.addQuadCurveToPoint(end, { controlPoint: c })
```

### 接一段弧

```js
path.addArcWithCenter(center, {
  radius: 28, startAngle: -Math.PI / 2, endAngle: Math.PI / 3, clockwise: true,
})
```

**已经有 `currentPoint` 的话会先连一条直线到弧的起点。** 画扇形就是利用这一点：

```js
const pie = new UIBezierPath();
pie.moveToPoint(center);                 // 先到圆心
pie.addArcWithCenter(center, { … });     // 自动连到弧起点，再画弧
pie.closePath();                         // 从弧终点连回圆心
```

### 拼和变形

```js
a.appendPath(b)                  // 把 b 整段接过来。接的是副本
path.applyTransform(CGAffineTransform.translation(10, 0))   // 就地改，不返回新的
const back = path.bezierPathByReversingPath()               // 新建一条，原路径不动
```

反向只在 `nonZero` 填充规则下看得出来（绕向变了）。

## 问它

```js
path.isEmpty            // boolean
path.bounds             // CGRect，包住路径的最小矩形，**不含线宽**
path.currentPoint       // CGPoint，笔尖在哪；空路径时是 (0, 0)
path.containsPoint(p)   // 只看填充区域，描边不算；开口路径按闭合之后算
```

`usesEvenOddFillRule` 是可写的，但**画在图层上时不看它**，看的是 `CAShapeLayer.fillRule`。路径上这条只影响 `containsPoint()` 的判定。

## 属性一览

| 属性 | 类型 | 默认值 |
| --- | --- | --- |
| `isEmpty` | `boolean`（只读） | `true` |
| `bounds` | `CGRect`（只读） | `(0, 0, 0, 0)` |
| `currentPoint` | `CGPoint`（只读） | `(0, 0)` |
| `usesEvenOddFillRule` | `boolean` | `false` |

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `[UIBezierPath bezierPath]` | `new UIBezierPath()` |
| `[UIBezierPath bezierPathWithRect:r]` | `UIBezierPath.bezierPathWithRect(r)` |
| `[UIBezierPath bezierPathWithOvalInRect:r]` | `UIBezierPath.bezierPathWithOvalInRect(r)` |
| `[UIBezierPath bezierPathWithRoundedRect:r cornerRadius:8]` | `UIBezierPath.bezierPathWithRoundedRect(r, { cornerRadius: 8 })` |
| `[UIBezierPath bezierPathWithRoundedRect:r byRoundingCorners:UIRectCornerTopLeft cornerRadii:s]` | `UIBezierPath.bezierPathWithRoundedRect(r, { byRoundingCorners: ['topLeft'], cornerRadii: s })` |
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
| `path.usesEvenOddFillRule` | `path.usesEvenOddFillRule` |

## 还没做

| | |
| --- | --- |
| `-fill` / `-stroke` / `-addClip` | 要当前的 `CGContext`，也就是覆写 `drawRect:`（**M2**） |
| 路径自己那套线宽、线头、虚线 | 同上——它们只服务于 `-fill` / `-stroke`。画在图层上时用图层的 |
| `CGPath` / `bezierPathWithCGPath:` | `CGPathRef` 还没有包装，和 `CGColorRef` 一样要单独定 |
| `getLineDash:count:phase:` | 出参数组，要先定怎么表达 |

---

设计理由和实测依据见[实现原理](../internals/ca-layer.md)。

← 返回 [API 文档](README.md)
