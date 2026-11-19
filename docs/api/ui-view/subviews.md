---
type: reference
native: UIView.subviews
---

# `UIView`：`subviews` 属性

**`subviews`** 属性是视图的全部子视图，按绘制顺序排列，后面的画在上面。

## 值

`UIView` 的只读数组。

- 只读。给它赋值抛 `TypeError`。
- 默认是空数组。
- 每次读得到一个新数组，改这个数组不影响视图。数组里的视图对象是同一个，可以用 `===` 比较。
- 叠放顺序只由这个顺序决定，没有单独的层级数值。
- 没有变化通知。

## 示例

```js
const card = new UIView();
const a = new UIView();
const b = new UIView();
card.addSubview(a);
card.addSubview(b);
console.log(card.subviews.length, card.subviews[1] === b);
```

**结果**：输出 `2 true`。`b` 后加入，排在后面，画在 `a` 上面。

## 对应的 iOS API

`UIView.subviews`。

## 参见

- [`superview`](superview.md)
- [`bringSubviewToFront()`](bringsubviewtofront.md)、[`insertSubview()`](insertsubview.md)
- [视图树和叠放顺序](../ui-view.md#视图树和叠放顺序)
