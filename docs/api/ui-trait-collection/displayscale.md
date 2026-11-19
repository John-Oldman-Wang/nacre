---
type: reference
native: UITraitCollection.displayScale
---

# `UITraitCollection`：`displayScale` 属性

**`displayScale`** 属性是屏幕上 1 [pt](../units.md) 对应几个像素。

## 值

数，没有单位。

- 现在的 iPhone 是 3。iPhone Air 的模拟器上实测是 3。
- 还没加到界面上的视图也读得到屏幕的倍率（实测是 3，不是 0）。
- 两个常见用途：要画一条 1 像素宽的细线，宽度写 `1 / displayScale` pt；自己创建的[图层](../ca-layer.md)要画得清晰，把它的 [`contentsScale`](../ca-layer/contentsscale.md) 设成这个值。
- 不要写死 3，从这里读。

- 只读。给它赋值抛 `TypeError`。
- 它是读 `traitCollection` 那一刻的值，之后不会变。环境变了时，视图、页面、场景派发 [`traitchange`](../ui-trait-collection.md#traitchange-事件)，要新的值就重新读 `traitCollection`。

## 示例

```js
const view = new UIView();
const scale = view.traitCollection.displayScale;
console.log(scale);
console.log(1 / scale);
```

**结果**：iPhone Air 的模拟器上输出 `3` 和 `0.3333333333333333`。

## 对应的 iOS API

`UITraitCollection.displayScale`。

## 参见

- [`UITraitCollection`](../ui-trait-collection.md)
- [单位](../units.md)
