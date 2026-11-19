---
type: reference
native: CALayer.contentsScale
---

# `CALayer`：`contentsScale` 属性

**`contentsScale`** 属性是图层的内容每 1 pt 用几个像素来画。

## 值

数，没有单位。

- 可读，可写。
- 默认值是 `1`。iPhone 的屏幕上 1 pt 是 2 或 3 个像素。
- 视图自己的图层，在 `sceneconnect` 的回调里读到的也是 1，所以不能用它来读屏幕是几倍的。屏幕的倍数从 [`traitCollection.displayScale`](../ui-trait-collection/displayscale.md) 读。
- 渐变图层和形状图层在它是 1 时画出来是否模糊，**未在模拟器验证**。

### 写错时

写入的值按 `Number()` 转成数。转不成有限数的抛 `TypeError`。

## 示例

```js
const view = new UIView();
const layer = new CAShapeLayer();
layer.contentsScale = view.traitCollection.displayScale;
console.log(layer.contentsScale);
```

**结果**：在 3 倍屏的 iPhone 上输出 `3`。

## 对应的 iOS API

`CALayer.contentsScale`。

## 参见

- [`contentsScale`：每个点用几个像素](../ca-layer.md#contentsscale每个点用几个像素)
