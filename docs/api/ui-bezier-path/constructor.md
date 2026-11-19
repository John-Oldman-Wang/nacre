---
type: reference
native: +[UIBezierPath bezierPath]
---

# `UIBezierPath()` 构造函数

**`UIBezierPath()`** 构造函数创建一条空路径。路径里没有任何线段，之后用 [`moveToPoint()`](movetopoint.md) 和画线的方法一段一段加进去。

矩形、椭圆、圆角矩形和圆弧有现成的静态方法，见 [`UIBezierPath`](../ui-bezier-path.md#静态方法)。

## 语法

```
new UIBezierPath()
```

### 参数

无。

### 返回值

新建的 `UIBezierPath`。它的 [`isEmpty`](isempty.md) 是 `true`，[`currentPoint`](currentpoint.md) 是 `CGPoint(0, 0)`。

### 异常

无。

## 示例

```js
const path = new UIBezierPath();
console.log(path.isEmpty);
path.moveToPoint(new CGPoint(0, 60));
path.addLineToPoint(new CGPoint(40, 20));
console.log(path.isEmpty);
```

**结果**：控制台依次输出 `true`、`false`。

## 对应的 iOS API

`[UIBezierPath bezierPath]`，或 `[[UIBezierPath alloc] init]`。

## 参见

- [`moveToPoint()`](movetopoint.md)：开始画第一段
- [`UIBezierPath.bezierPathWithRect()`](bezierpathwithrect.md)：直接得到一个矩形
