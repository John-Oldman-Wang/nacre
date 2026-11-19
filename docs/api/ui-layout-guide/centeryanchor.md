---
type: reference
native: UILayoutGuide.centerYAnchor
---

# `UILayoutGuide`：`centerYAnchor` 属性

**`centerYAnchor`** 属性是 layout guide 的垂直方向的中心线，用来建约束。

## 值

[`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md)。

- 只读。给它赋值抛 `TypeError`。
- 同一个 layout guide 上多次读取得到同一个对象。
- 含义和视图上的同名锚点 [`UIView.centerYAnchor`](../ui-view/centeryanchor.md) 相同。
- layout guide 要先用 [`addLayoutGuide()`](../ui-view/addlayoutguide.md) 加到视图上，才能用它的锚点建约束并激活。

## 示例

```js
const card = new UIView();
const guide = new UILayoutGuide();
card.addLayoutGuide(guide);
guide.centerYAnchor.constraintEqualToAnchor(card.centerYAnchor, { constant: 8 }).isActive = true;
```

**效果**：建立并激活一条约束，确定 `guide` 的垂直方向的中心线。

## 对应的 iOS API

`UILayoutGuide.centerYAnchor`。

## 参见

- [`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md)：能建哪些约束
- [`UIView.centerYAnchor`](../ui-view/centeryanchor.md)
