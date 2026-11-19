---
type: reference
native: UIView.widthAnchor
---

# `UIView`：`widthAnchor` 属性

**`widthAnchor`** 属性是视图的宽度，用来建约束。

## 值

[`NSLayoutDimension`](../ns-layout-dimension.md)。

- 只读。给它赋值抛 `TypeError`。
- 同一个视图上多次读取得到同一个对象：`view.widthAnchor === view.widthAnchor` 是 `true`。
- 锚点不能自己构造。代码里只保存了锚点、没有保存视图时，锚点照样能用。
- 只能和同一种类型的锚点建约束，见 [`NSLayoutAnchor`](../ns-layout-anchor.md)。
- 尺寸锚点能和常数比，也能带倍数。

## 示例

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.widthAnchor.constraintEqualToConstant(120).isActive = true;
```

**效果**：`box` 宽 120 pt。

## 对应的 iOS API

`UIView.widthAnchor`。

## 参见

- [`NSLayoutDimension`](../ns-layout-dimension.md)：能建哪些约束
- [用约束排版](../../guides/auto-layout.md)
