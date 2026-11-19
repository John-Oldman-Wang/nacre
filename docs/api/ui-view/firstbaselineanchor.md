---
type: reference
native: UIView.firstBaselineAnchor
---

# `UIView`：`firstBaselineAnchor` 属性

**`firstBaselineAnchor`** 属性是视图的第一行文字的基线，用来建约束。

## 值

[`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md)。

- 只读。给它赋值抛 `TypeError`。
- 同一个视图上多次读取得到同一个对象：`view.firstBaselineAnchor === view.firstBaselineAnchor` 是 `true`。
- 锚点不能自己构造。代码里只保存了锚点、没有保存视图时，锚点照样能用。
- 只能和同一种类型的锚点建约束，见 [`NSLayoutAnchor`](../ns-layout-anchor.md)。
- 基线是一行文字里字母底部所在的那条线。两个字号不同的标签并排时，对齐基线之后两段文字的底部在同一条线上。

## 示例

```js
const parent = new UIView();
const box = new UILabel();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.firstBaselineAnchor.constraintEqualToAnchor(parent.topAnchor, { constant: 30 }).isActive = true;
```

**效果**：`box` 第一行文字的基线离 `parent` 的上边 30 pt。**未在模拟器验证。**

## 对应的 iOS API

`UIView.firstBaselineAnchor`。

## 参见

- [`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md)：能建哪些约束
- [用约束排版](../../guides/auto-layout.md)
