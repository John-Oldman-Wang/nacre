---
type: reference
native: UIView.intrinsicContentSize
---

# `UIView`：`intrinsicContentSize` 属性

**`intrinsicContentSize`** 属性是视图按内容算出的固有大小：视图自己知道应该多大。

## 值

[`CGSize`](../cg-size.md)，单位 [pt](../units.md)。

- 只读。给它赋值抛 `TypeError`。
- 普通 `UIView` 没有内容，返回 `(-1, -1)`，表示没有固有大小（实测）。没有固有大小的方向是 `-1`。
- [`UILabel`](../ui-label.md) 返回文字排出来的大小，[`UIButton`](../ui-button.md) 返回标题和图标的大小，[`UIImageView`](../ui-image.md) 返回图片的大小。
- 有固有大小的视图用约束定位时不需要写宽高约束，只写位置。内容变了，固有大小跟着变，视图的大小在下一次布局时更新。
- 没有变化通知。内容变了要立刻重算，调 [`invalidateIntrinsicContentSize()`](invalidateintrinsiccontentsize.md)。

## 示例

```js
console.log(String(new UIView().intrinsicContentSize));

const label = new UILabel();
label.text = 'Hello';
console.log(label.intrinsicContentSize.width > 0);
```

**结果**：依次输出 `CGSize(-1, -1)`、`true`。

## 对应的 iOS API

`UIView.intrinsicContentSize`。

## 参见

- [固有尺寸](../auto-layout.md#固有尺寸)
- [`setContentHuggingPriority()`](setcontenthuggingpriority.md)
