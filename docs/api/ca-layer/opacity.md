---
type: reference
native: CALayer.opacity
---

# `CALayer`：`opacity` 属性

**`opacity`** 属性是图层的不透明度，作用于图层和它的所有子图层。

## 值

数，0 到 1 的比例。0 是完全透明，1 是完全不透明。

- 可读，可写。
- 默认值是 `1`。
- 视图自己的图层用 `view.alpha`，见[用视图的属性还是图层的属性](../ca-layer.md#用视图的属性还是图层的属性)。

### 写错时

写入的值按 `Number()` 转成数。转不成有限数的抛 `TypeError`。

## 示例

```js
const layer = new CALayer();
layer.opacity = 0.5;
console.log(layer.opacity);
```

**结果**：控制台输出 `0.5`。

## 对应的 iOS API

`CALayer.opacity`。

## 参见

- [`isHidden`](ishidden.md)
