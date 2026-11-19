---
type: reference
native: "-[UIBezierPath addCurveToPoint:controlPoint1:controlPoint2:]"
---

# `UIBezierPath`：`addCurveToPoint()` 方法

**`addCurveToPoint()`** 方法从[当前点](currentpoint.md)画一段三次贝塞尔曲线到指定的点。曲线的弯曲由两个控制点决定，曲线本身不经过控制点。

## 语法

```
addCurveToPoint(point, { controlPoint1, controlPoint2 })
```

### 参数

**`point`**

曲线的终点，`CGPoint`，单位是 [pt](../units.md)。也可以写成普通对象 `{ x, y }`。

**`options.controlPoint1`**

第一个控制点，`CGPoint`，必填。曲线从起点出发时朝向它。

**`options.controlPoint2`**

第二个控制点，`CGPoint`，必填。曲线到达终点时来自它的方向。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- `point` 写错：`addCurveToPoint needs an object with all of: x, y`，或 `addCurveToPoint is missing x, or it is not a finite number`。
- 控制点没给或写错：`controlPoint1 needs an object with all of: x, y`（`controlPoint2` 同理）。

## 示例

```js
const wave = new UIBezierPath();
wave.moveToPoint(new CGPoint(0, 50));
wave.addCurveToPoint(new CGPoint(100, 50), {
  controlPoint1: new CGPoint(30, 0),
  controlPoint2: new CGPoint(70, 100),
});
console.log(String(wave.currentPoint));
```

**结果**：从 (0, 50) 到 (100, 50) 的一段 S 形曲线。控制台输出 `CGPoint(100, 50)`。

## 对应的 iOS API

`-[UIBezierPath addCurveToPoint:controlPoint1:controlPoint2:]`。两个控制点放进 options 对象。

## 参见

- [`addQuadCurveToPoint()`](addquadcurvetopoint.md)：一个控制点的曲线
