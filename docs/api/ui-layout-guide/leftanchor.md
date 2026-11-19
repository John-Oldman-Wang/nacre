---
type: reference
native: UILayoutGuide.leftAnchor
---

# `UILayoutGuide`：`leftAnchor` 属性

**`leftAnchor`** 属性是 layout guide 的左边，不随书写方向变，用来建约束。

## 值

[`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md)。

- 只读。给它赋值抛 `TypeError`。
- 同一个 layout guide 上多次读取得到同一个对象。
- 含义和视图上的同名锚点 [`UIView.leftAnchor`](../ui-view/leftanchor.md) 相同。
- layout guide 要先用 [`addLayoutGuide()`](../ui-view/addlayoutguide.md) 加到视图上，才能用它的锚点建约束并激活。

## 示例

```js
const card = new UIView();
const guide = new UILayoutGuide();
card.addLayoutGuide(guide);
guide.leftAnchor.constraintEqualToAnchor(card.leftAnchor, { constant: 16 }).isActive = true;
```

**效果**：建立并激活一条约束，确定 `guide` 的左边。

## 对应的 iOS API

`UILayoutGuide.leftAnchor`。

## 参见

- [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md)：能建哪些约束
- [`UIView.leftAnchor`](../ui-view/leftanchor.md)
