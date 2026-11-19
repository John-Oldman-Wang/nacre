---
type: reference
native: UIView.trailingAnchor
---

# `UIView`：`trailingAnchor` 属性

**`trailingAnchor`** 属性是视图的结束边，用来建约束。

## 值

[`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md)。

- 只读。给它赋值抛 `TypeError`。
- 同一个视图上多次读取得到同一个对象：`view.trailingAnchor === view.trailingAnchor` 是 `true`。
- 锚点不能自己构造。代码里只保存了锚点、没有保存视图时，锚点照样能用。
- 只能和同一种类型的锚点建约束，见 [`NSLayoutAnchor`](../ns-layout-anchor.md)。
- 和 `leadingAnchor` 相对：从左往右书写的语言里是右边。

## 示例

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.trailingAnchor.constraintEqualToAnchor(parent.trailingAnchor, { constant: -16 }).isActive = true;
```

**效果**：`box` 的结束边在 `parent` 的结束边往里 16 pt 处。往右是正，所以写 `-16`。

## 对应的 iOS API

`UIView.trailingAnchor`。

## 参见

- [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md)：能建哪些约束
- [用约束排版](../../guides/auto-layout.md)
