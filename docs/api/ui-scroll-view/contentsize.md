---
type: reference
native: UIScrollView.contentSize
---

# `UIScrollView`：`contentSize` 属性

**`contentSize`** 属性是内容区的大小。某个方向上它比可视区大，这个方向才能滚。

## 值

[`CGSize`](../structs.md)，单位是 [pt](../units.md)。

- 可读，可写。
- 默认值是 `(0, 0)`。
- 用约束把内容和 [`contentLayoutGuide`](contentlayoutguide.md) 对齐时，它由系统算出，不要写。系统完成布局之后才算出来：激活约束后先在页面的根视图上调 `layoutIfNeeded()` 再读。
- 子视图用 `frame` 定位时，用它告诉滚动视图内容有多大。内容变了要重新写一次，它不会自己更新。
- 没有变化通知，iOS 不提供。
- 实测：12 行、每行高 36 pt、间距 6 pt 的内容用约束对齐 `contentLayoutGuide`，`contentSize.height` 读出来是 498 pt（12 × 36 + 11 × 6），`contentSize.width` 等于滚动视图的宽度。
- 每次读出来是一个新对象，字段只读。要改就整个重新赋值，见[结构体](../structs.md)。

### 写错时

- 写入的不是对象：`TypeError: contentSize needs an object with all of: width, height`
- 缺字段，或者字段不是有限的数：`TypeError: contentSize is missing height, or it is not a finite number`

抛错之后属性保持原值。

## 示例

```js
const scroller = new UIScrollView();
scroller.frame = new CGRect(0, 0, 400, 800);
scroller.contentSize = new CGSize(400, 3000);
```

**效果**：一个 400 × 800 pt 的滚动区域，可以向下滚 2200 pt（3000 减 800）。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollView.contentSize`。

## 参见

- [内容区的大小](../ui-scroll-view.md#内容区的大小)
- [`contentLayoutGuide`](contentlayoutguide.md)
