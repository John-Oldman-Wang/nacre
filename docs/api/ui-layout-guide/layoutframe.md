---
type: reference
native: UILayoutGuide.layoutFrame
---

# `UILayoutGuide`：`layoutFrame` 属性

**`layoutFrame`** 属性是布局算出的这个 layout guide 的矩形，在 [`owningView`](owningview.md) 的坐标系里。

## 值

[`CGRect`](../cg-rect.md)，单位 [pt](../units.md)。

- 只读。给它赋值抛 `TypeError`。
- 布局完成之后才有意义。激活约束之后要立刻读，先在共同的祖先上调 [`layoutIfNeeded()`](../ui-view/layoutifneeded.md)。
- 每次读得到一个新的 `CGRect`。
- 变化时不派发事件。需要时在 `layoutIfNeeded()` 之后读。

## 示例

```js
const card = new UIView();
const left = new UIView();
const middle = new UIView();
for (const v of [left, middle]) {
  v.translatesAutoresizingMaskIntoConstraints = false;
  card.addSubview(v);
}
const spacer = new UILayoutGuide();
card.addLayoutGuide(spacer);

NSLayoutConstraint.activateConstraints([
  left.leadingAnchor.constraintEqualToAnchor(card.leadingAnchor),
  left.widthAnchor.constraintEqualToConstant(60),
  spacer.leadingAnchor.constraintEqualToAnchor(left.trailingAnchor),
  spacer.widthAnchor.constraintEqualToConstant(8),
  middle.leadingAnchor.constraintEqualToAnchor(spacer.trailingAnchor),
  spacer.topAnchor.constraintEqualToAnchor(card.topAnchor),
  spacer.heightAnchor.constraintEqualToConstant(4),
]);
card.layoutIfNeeded();
console.log(spacer.layoutFrame.width, spacer.layoutFrame.height);
```

**结果**：输出 `8 4`。

## 对应的 iOS API

`UILayoutGuide.layoutFrame`。

## 参见

- [用不显示的矩形占位](../../guides/auto-layout.md#用不显示的矩形占位)
