---
type: reference
native: CALayer.shadowOffset
---

# `CALayer`：`shadowOffset` 属性

**`shadowOffset`** 属性是阴影相对图层的偏移。

## 值

[`CGSize`](../structs.md)，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `(0, -3)`，向上偏 3 pt。
- `width` 为正向右，`height` 为正向下。
- 写入时可以给 `CGSize`，也可以给 `{ width, height }`。

### 写错时

**`TypeError`**

给的不是对象，或者缺字段、字段不是有限的数。

## 示例

```js
const layer = new CALayer();
layer.shadowOffset = new CGSize(0, 4);
console.log(layer.shadowOffset.height);
```

**结果**：控制台输出 `4`。阴影向下偏 4 pt。

## 对应的 iOS API

`CALayer.shadowOffset`。`CGSizeMake(0, 4)` 写成 `new CGSize(0, 4)`。

## 参见

- [`shadowOpacity`](shadowopacity.md)
