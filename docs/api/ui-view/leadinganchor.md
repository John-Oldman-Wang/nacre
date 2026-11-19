---
type: reference
native: UIView.leadingAnchor
---

# `UIView`：`leadingAnchor` 属性

**`leadingAnchor`** 属性是视图的起始边，用来建约束。

## 值

[`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md)。

- 只读。给它赋值抛 `TypeError`。
- 同一个视图上多次读取得到同一个对象：`view.leadingAnchor === view.leadingAnchor` 是 `true`。
- 锚点不能自己构造。代码里只保存了锚点、没有保存视图时，锚点照样能用。
- 只能和同一种类型的锚点建约束，见 [`NSLayoutAnchor`](../ns-layout-anchor.md)。
- 从左往右书写的语言里是左边，从右往左的语言里是右边。平常用它和 `trailingAnchor`，界面在从右往左的语言里会自动镜像。从右往左时对调的行为**未在模拟器验证**。

## 示例

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.leadingAnchor.constraintEqualToAnchor(parent.leadingAnchor, { constant: 16 }).isActive = true;
```

**效果**：`box` 的起始边在 `parent` 的起始边往里 16 pt 处。

## 对应的 iOS API

`UIView.leadingAnchor`。

## 参见

- [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md)：能建哪些约束
- [用约束排版](../../guides/auto-layout.md)
