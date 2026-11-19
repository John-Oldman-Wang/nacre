---
type: reference
native: UIView.rightAnchor
---

# `UIView`：`rightAnchor` 属性

**`rightAnchor`** 属性是视图的右边，用来建约束。

## 值

[`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md)。

- 只读。给它赋值抛 `TypeError`。
- 同一个视图上多次读取得到同一个对象：`view.rightAnchor === view.rightAnchor` 是 `true`。
- 锚点不能自己构造。代码里只保存了锚点、没有保存视图时，锚点照样能用。
- 只能和同一种类型的锚点建约束，见 [`NSLayoutAnchor`](../ns-layout-anchor.md)。
- 永远是屏幕的右边，不随书写方向变。不要和 `leading` / `trailing` 在同一条约束里混用。

## 示例

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.rightAnchor.constraintEqualToAnchor(parent.rightAnchor, { constant: -16 }).isActive = true;
```

**效果**：`box` 的右边离 `parent` 的右边 16 pt，不随书写方向变。

## 对应的 iOS API

`UIView.rightAnchor`。

## 参见

- [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md)：能建哪些约束
- [用约束排版](../../guides/auto-layout.md)
