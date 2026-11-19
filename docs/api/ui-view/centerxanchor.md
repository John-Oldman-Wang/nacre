---
type: reference
native: UIView.centerXAnchor
---

# `UIView`：`centerXAnchor` 属性

**`centerXAnchor`** 属性是视图的水平方向的中心线，用来建约束。

## 值

[`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md)。

- 只读。给它赋值抛 `TypeError`。
- 同一个视图上多次读取得到同一个对象：`view.centerXAnchor === view.centerXAnchor` 是 `true`。
- 锚点不能自己构造。代码里只保存了锚点、没有保存视图时，锚点照样能用。
- 只能和同一种类型的锚点建约束，见 [`NSLayoutAnchor`](../ns-layout-anchor.md)。

## 示例

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.centerXAnchor.constraintEqualToAnchor(parent.centerXAnchor).isActive = true;
```

**效果**：`box` 在 `parent` 里水平居中。

## 对应的 iOS API

`UIView.centerXAnchor`。

## 参见

- [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md)：能建哪些约束
- [用约束排版](../../guides/auto-layout.md)
