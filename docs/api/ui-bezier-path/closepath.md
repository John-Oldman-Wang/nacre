---
type: reference
native: "-[UIBezierPath closePath]"
---

# `UIBezierPath`：`closePath()` 方法

**`closePath()`** 方法从[当前点](currentpoint.md)画一条直线回到这段子路径的起点，让这段子路径首尾相接。

## 语法

```
closePath()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

调不调 `closePath()`，填充的结果相同，描边的结果不同：

- **填充**按闭合之后的形状算。没有闭合的路径也填出完整的形状。
- **描边**只画出实际存在的线段。没有闭合时，回到起点的那条边不画。

要描出完整轮廓的形状，画完后调 `closePath()`。

## 示例

```js
const triangle = new UIBezierPath();
triangle.moveToPoint(new CGPoint(50, 0));
triangle.addLineToPoint(new CGPoint(100, 80));
triangle.addLineToPoint(new CGPoint(0, 80));
triangle.closePath();
```

**结果**：一个三角形。`closePath()` 加上了从 (0, 80) 回到起点 (50, 0) 的第三条边。**闭合与否对描边和填充的影响未在模拟器验证。**

## 对应的 iOS API

`-[UIBezierPath closePath]`。

## 参见

- [`moveToPoint()`](movetopoint.md)：子路径的起点从这里来
