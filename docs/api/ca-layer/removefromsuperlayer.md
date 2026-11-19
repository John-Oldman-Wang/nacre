---
type: reference
native: "-[CALayer removeFromSuperlayer]"
---

# `CALayer`：`removeFromSuperlayer()` 方法

**`removeFromSuperlayer()`** 方法把图层从它的父图层移除。

## 语法

```
removeFromSuperlayer()
```

### 参数

无。

### 返回值

无（`undefined`）。

移除后 [`superlayer`](superlayer.md) 是 `null`。代码里没有保存这个图层的话，它会被回收。

### 异常

无。

## 示例

```js
const host = new CALayer();
const c = new CALayer();
host.addSublayer(c);
c.removeFromSuperlayer();
console.log(host.sublayers.length, c.superlayer);
```

**结果**：控制台输出 `0 null`。

## 对应的 iOS API

`-[CALayer removeFromSuperlayer]`。

## 参见

- [`addSublayer()`](addsublayer.md)
