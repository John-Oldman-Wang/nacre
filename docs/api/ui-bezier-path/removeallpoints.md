---
type: reference
native: "-[UIBezierPath removeAllPoints]"
---

# `UIBezierPath`：`removeAllPoints()` 方法

**`removeAllPoints()`** 方法清空路径，去掉全部子路径。

## 语法

```
removeAllPoints()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

清空之后 [`isEmpty`](isempty.md) 是 `true`。已经赋给形状图层的路径，图层保存的是赋值那一刻的形状，清空不影响图层。

## 示例

```js
const box = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 10, 10));
box.removeAllPoints();
console.log(box.isEmpty);
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

`-[UIBezierPath removeAllPoints]`。

## 参见

- [`isEmpty`](isempty.md)
