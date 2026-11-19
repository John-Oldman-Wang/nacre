---
type: reference
native: "-[UIBezierPath containsPoint:]"
---

# `UIBezierPath`：`containsPoint()` 方法

**`containsPoint()`** 方法判断一个点是否在路径的填充区域内。

## 语法

```
containsPoint(point)
```

### 参数

**`point`**

要判断的点，`CGPoint`，单位是 [pt](../units.md)。也可以写成普通对象 `{ x, y }`。它和路径要在同一个坐标系里。

### 返回值

布尔。点在路径围出的范围之内是 `true`，否则是 `false`。

### 异常

**`TypeError`**

- `point` 不是对象：`containsPoint needs an object with all of: x, y`。
- `x` 或 `y` 缺失或转不成有限数：`containsPoint is missing x, or it is not a finite number`。

## 说明

- 判断的是填充区域。不考虑线宽：落在描边上但在形状之外的点不算。**未在模拟器验证。**
- 没有闭合的路径按闭合之后的形状判断。**未在模拟器验证。**
- 自相交或嵌套的形状里哪些区域算内部，由 [`usesEvenOddFillRule`](usesevenoddfillrule.md) 决定。
- 触摸事件给的位置在视图坐标系里。路径赋给了一个 `frame` 原点不在 (0, 0) 的图层时，要先减去图层的原点。

## 示例

```js
const box = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 100, 100));
console.log(box.containsPoint(new CGPoint(50, 50)));
console.log(box.containsPoint(new CGPoint(150, 50)));
```

**结果**：控制台依次输出 `true`、`false`。

## 对应的 iOS API

`-[UIBezierPath containsPoint:]`。

## 参见

- [`usesEvenOddFillRule`](usesevenoddfillrule.md)：判断内部用的规则
- [判断点击落在哪个形状上](../../guides/drawing-paths.md#判断点击落在哪个形状上)
