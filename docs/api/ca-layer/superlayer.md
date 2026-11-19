---
type: reference
native: CALayer.superlayer
---

# `CALayer`：`superlayer` 属性

**`superlayer`** 属性是图层的父图层。

## 值

`CALayer`，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 没有父图层时是 `null`。
- 由 [`addSublayer()`](addsublayer.md)、[`insertSublayer()`](insertsublayer.md)、[`removeFromSuperlayer()`](removefromsuperlayer.md) 改变。

## 示例

```js
const parent = new CALayer();
const child = new CALayer();
parent.addSublayer(child);
console.log(child.superlayer === parent);
child.removeFromSuperlayer();
console.log(child.superlayer);
```

**结果**：依次输出 `true` 和 `null`。

## 对应的 iOS API

`CALayer.superlayer`。

## 参见

- [`sublayers`](sublayers.md)
