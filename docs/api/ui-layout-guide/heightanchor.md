---
type: reference
native: UILayoutGuide.heightAnchor
---

# `UILayoutGuide`：`heightAnchor` 属性

**`heightAnchor`** 属性是 layout guide 的高度，用来建约束。

## 值

[`NSLayoutDimension`](../ns-layout-dimension.md)。

- 只读。给它赋值抛 `TypeError`。
- 同一个 layout guide 上多次读取得到同一个对象。
- 含义和视图上的同名锚点 [`UIView.heightAnchor`](../ui-view/heightanchor.md) 相同。
- layout guide 要先用 [`addLayoutGuide()`](../ui-view/addlayoutguide.md) 加到视图上，才能用它的锚点建约束并激活。

## 示例

```js
const card = new UIView();
const guide = new UILayoutGuide();
card.addLayoutGuide(guide);
guide.heightAnchor.constraintEqualToConstant(44).isActive = true;
```

**效果**：建立并激活一条约束，确定 `guide` 的高度。

## 对应的 iOS API

`UILayoutGuide.heightAnchor`。

## 参见

- [`NSLayoutDimension`](../ns-layout-dimension.md)：能建哪些约束
- [`UIView.heightAnchor`](../ui-view/heightanchor.md)
