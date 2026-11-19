---
type: reference
native: UIView.lastBaselineAnchor
---

# `UIView`：`lastBaselineAnchor` 属性

**`lastBaselineAnchor`** 属性是视图的最后一行文字的基线，用来建约束。

## 值

[`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md)。

- 只读。给它赋值抛 `TypeError`。
- 同一个视图上多次读取得到同一个对象：`view.lastBaselineAnchor === view.lastBaselineAnchor` 是 `true`。
- 锚点不能自己构造。代码里只保存了锚点、没有保存视图时，锚点照样能用。
- 只能和同一种类型的锚点建约束，见 [`NSLayoutAnchor`](../ns-layout-anchor.md)。
- 基线是一行文字里字母底部所在的那条线。

## 示例

```js
const parent = new UIView();
const box = new UILabel();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.lastBaselineAnchor.constraintEqualToAnchor(parent.bottomAnchor, { constant: -20 }).isActive = true;
```

**效果**：`box` 最后一行文字的基线在 `parent` 的下边上方 20 pt。**未在模拟器验证。**

## 对应的 iOS API

`UIView.lastBaselineAnchor`。

## 参见

- [`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md)：能建哪些约束
- [用约束排版](../../guides/auto-layout.md)
