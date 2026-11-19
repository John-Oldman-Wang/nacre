---
type: reference
native: "-[UIBezierPath addQuadCurveToPoint:controlPoint:]"
---

# `UIBezierPath`：`addQuadCurveToPoint()` 方法

**`addQuadCurveToPoint()`** 方法从[当前点](currentpoint.md)画一段二次贝塞尔曲线到指定的点。曲线的弯曲由一个控制点决定，曲线本身不经过控制点。

## 语法

```
addQuadCurveToPoint(point, { controlPoint })
```

### 参数

**`point`**

曲线的终点，`CGPoint`，单位是 [pt](../units.md)。也可以写成普通对象 `{ x, y }`。

**`options.controlPoint`**

控制点，`CGPoint`，必填。曲线从起点出发时朝向它，到达终点时也来自它的方向。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- `point` 写错：`addQuadCurveToPoint needs an object with all of: x, y`，或 `addQuadCurveToPoint is missing x, or it is not a finite number`。
- 控制点没给或写错：`controlPoint needs an object with all of: x, y`。

## 示例

```js
const arch = new UIBezierPath();
arch.moveToPoint(new CGPoint(100, 50));
arch.addQuadCurveToPoint(new CGPoint(150, 50), {
  controlPoint: new CGPoint(125, 20),
});
console.log(String(arch.currentPoint));
```

**结果**：从 (100, 50) 到 (150, 50) 的一段向上拱起的曲线。控制台输出 `CGPoint(150, 50)`。

## 对应的 iOS API

`-[UIBezierPath addQuadCurveToPoint:controlPoint:]`。控制点放进 options 对象。

## 参见

- [`addCurveToPoint()`](addcurvetopoint.md)：两个控制点的曲线
