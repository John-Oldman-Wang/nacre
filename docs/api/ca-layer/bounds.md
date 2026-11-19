---
type: reference
native: CALayer.bounds
---

# `CALayer`：`bounds` 属性

**`bounds`** 属性是图层自己的坐标系：大小，以及左上角在自己坐标系里的坐标。

## 值

[`CGRect`](../structs.md)，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `(0, 0, 0, 0)`。
- `width`、`height` 和 [`frame`](frame.md) 相同。`x`、`y` 默认是 0。
- 子图层的坐标、形状图层路径里的坐标，都按这个坐标系算。
- 写入时可以给 `CGRect`，也可以给 `{ x, y, width, height }`。

### 写错时

**`TypeError`**

给的不是对象，或者缺字段、字段不是有限的数。

## 示例

```js
const layer = new CALayer();
layer.frame = new CGRect(10, 20, 100, 50);
console.log(layer.bounds.x, layer.bounds.width);
```

**结果**：控制台输出 `0 100`。

## 对应的 iOS API

`CALayer.bounds`。

## 参见

- [`frame`](frame.md)
