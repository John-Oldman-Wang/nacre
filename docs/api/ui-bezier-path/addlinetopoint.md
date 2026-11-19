---
type: reference
native: "-[UIBezierPath addLineToPoint:]"
---

# `UIBezierPath`：`addLineToPoint()` 方法

**`addLineToPoint()`** 方法从[当前点](currentpoint.md)画一条直线到指定的点，这个点成为新的当前点。

## 语法

```
addLineToPoint(point)
```

### 参数

**`point`**

直线的终点，`CGPoint`，单位是 [pt](../units.md)。也可以写成普通对象 `{ x, y }`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- `point` 不是对象：`addLineToPoint needs an object with all of: x, y`。
- `x` 或 `y` 缺失或转不成有限数：`addLineToPoint is missing x, or it is not a finite number`。

## 说明

画线之前要先调 [`moveToPoint()`](movetopoint.md) 给出起点。在空路径上直接调 `addLineToPoint()` 的结果**未在模拟器验证**。

## 示例

```js
const line = new UIBezierPath();
line.moveToPoint(new CGPoint(0, 60));
line.addLineToPoint(new CGPoint(40, 20));
line.addLineToPoint(new CGPoint(80, 50));
console.log(String(line.currentPoint), String(line.bounds));
```

**结果**：一条两段的折线。控制台输出 `CGPoint(80, 50) CGRect(0, 20, 80, 40)`。

## 对应的 iOS API

`-[UIBezierPath addLineToPoint:]`。

## 参见

- [`closePath()`](closepath.md)：画直线回到起点
- [`addCurveToPoint()`](addcurvetopoint.md)：画曲线
