---
type: reference
native: "-[UIBezierPath moveToPoint:]"
---

# `UIBezierPath`：`moveToPoint()` 方法

**`moveToPoint()`** 方法开始一段新的子路径，把起点放在指定的位置。它不画线，只把[当前点](currentpoint.md)移过去。

## 语法

```
moveToPoint(point)
```

### 参数

**`point`**

新的起点，`CGPoint`，单位是 [pt](../units.md)。也可以写成普通对象 `{ x, y }`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- `point` 不是对象：`moveToPoint needs an object with all of: x, y`。
- `x` 或 `y` 缺失或转不成有限数：`moveToPoint is missing y, or it is not a finite number`。

## 说明

- 调过之后 [`isEmpty`](isempty.md) 变成 `false`，[`currentPoint`](currentpoint.md) 变成 `point`。
- 在已经有线段的路径上再调一次，开始第二段子路径。两段之间不相连。

## 示例

```js
const path = new UIBezierPath();
path.moveToPoint(new CGPoint(0, 60));
console.log(path.isEmpty, String(path.currentPoint));
```

**结果**：控制台输出 `false CGPoint(0, 60)`。

## 对应的 iOS API

`-[UIBezierPath moveToPoint:]`。

## 参见

- [`addLineToPoint()`](addlinetopoint.md)：从当前点画直线
- [路径由什么组成](../ui-bezier-path.md#路径由什么组成)
