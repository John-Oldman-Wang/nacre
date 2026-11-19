---
type: reference
native: UIView.layoutMarginsGuide
---

# `UIView`：`layoutMarginsGuide` 属性

**`layoutMarginsGuide`** 属性是视图四边各向内缩进[内边距](directionallayoutmargins.md)之后的区域。

## 值

[`UILayoutGuide`](../ui-layout-guide.md)。

- 只读。给它赋值抛 `TypeError`。
- 由系统提供，不需要用 `addLayoutGuide()` 加，也不在 [`layoutGuides`](layoutguides.md) 里。
- 内边距默认四边各 8 pt，用 [`directionalLayoutMargins`](directionallayoutmargins.md) 改。
- 子视图要用约束对齐它，才会按内边距缩进。
- 具体范围**未在模拟器验证**。

## 示例

```js
const card = new UIView();
card.directionalLayoutMargins = { top: 12, leading: 20, bottom: 12, trailing: 20 };

const caption = new UILabel();
caption.text = '说明';
caption.translatesAutoresizingMaskIntoConstraints = false;
card.addSubview(caption);

const margins = card.layoutMarginsGuide;
NSLayoutConstraint.activateConstraints([
  caption.topAnchor.constraintEqualToAnchor(margins.topAnchor),
  caption.leadingAnchor.constraintEqualToAnchor(margins.leadingAnchor),
]);
```

**效果**：文字「说明」出现在 `card` 的左上角，距 `card` 的上边 12 pt、左边 20 pt。**未在模拟器验证。**

## 对应的 iOS API

`UIView.layoutMarginsGuide`。

## 参见

- [`UILayoutGuide`](../ui-layout-guide.md)
- [用约束排版](../../guides/auto-layout.md)
