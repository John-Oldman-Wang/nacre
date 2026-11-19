---
type: reference
native: "-[CALayer addSublayer:]"
---

# `CALayer`：`addSublayer()` 方法

**`addSublayer()`** 方法把一个图层加为子图层，放在最上面。

## 语法

```
addSublayer(layer)
```

### 参数

**`layer`**

一个图层：`CALayer`、`CAGradientLayer` 或 `CAShapeLayer`。

### 返回值

无（`undefined`）。

- 加进去之后，`layer` 在 [`sublayers`](sublayers.md) 的末尾，画在其他子图层的上面。要放到别的位置，用 [`insertSublayer()`](insertsublayer.md)。
- 一个图层只能有一个父图层。`layer` 已经在别的图层下面时，它先从原来的父图层移除。**未在模拟器验证。**
- 加进去之后由父图层保管，一直显示到被移除，或者父图层所在的视图被移除。

### 异常

**`TypeError`**

`layer` 不是图层：`addSublayer: expects a CALayer`。

## 示例

```js
const host = new CALayer();
const a = new CALayer();
const b = new CALayer();
host.addSublayer(a);
host.addSublayer(b);
console.log(host.sublayers.indexOf(b));
```

**结果**：控制台输出 `1`。`b` 在 `a` 上面。

## 对应的 iOS API

`-[CALayer addSublayer:]`。

## 参见

- [`insertSublayer()`](insertsublayer.md)、[`removeFromSuperlayer()`](removefromsuperlayer.md)
