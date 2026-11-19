---
type: reference
native: "-[UIBezierPath appendPath:]"
---

# `UIBezierPath`：`appendPath()` 方法

**`appendPath()`** 方法把另一条路径的全部子路径加到这一条里。

## 语法

```
appendPath(path)
```

### 参数

**`path`**

要加进来的路径，`UIBezierPath`。加进来的是它当时的形状；之后再修改那条路径，这一条不变。**后一句未在模拟器验证。**

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

`path` 不是 `UIBezierPath`：`appendPath: expects a UIBezierPath`。

## 说明

颜色和线宽都相同的一批图形，可以放进一条路径，只用一个形状图层画出来。

## 示例

```js
const bars = new UIBezierPath();
bars.appendPath(UIBezierPath.bezierPathWithRect(new CGRect(0, 40, 10, 20)));
bars.appendPath(UIBezierPath.bezierPathWithRect(new CGRect(20, 10, 10, 50)));
bars.appendPath(UIBezierPath.bezierPathWithRect(new CGRect(40, 0, 10, 60)));
console.log(String(bars.bounds));
```

**结果**：`bars` 里有三个宽 10 pt、底边对齐的矩形。控制台输出 `CGRect(0, 0, 50, 60)`。

## 对应的 iOS API

`-[UIBezierPath appendPath:]`。

## 参见

- [`bounds`](bounds.md)
