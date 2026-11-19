---
type: reference
native: UIScrollView.adjustedContentInset
---

# `UIScrollView`：`adjustedContentInset` 属性

**`adjustedContentInset`** 属性是实际生效的留白：[`contentInset`](contentinset.md) 加上系统为安全区自动加的部分。

## 值

[`UIEdgeInsets`](../structs.md)，单位是 [pt](../units.md)。

- 只读。给它赋值抛 `TypeError`。
- 由系统决定。系统加不加由 [`contentInsetAdjustmentBehavior`](contentinsetadjustmentbehavior.md) 决定。
- 滚动视图整个在安全区里面时，系统不加留白，`adjustedContentInset.top` 等于 `contentInset.top`（验收用例断言过）。
- 铺满屏幕时上下有留白，**未在模拟器验证**。
- 变化时派发 [`adjustedcontentinsetchange`](adjustedcontentinsetchange-event.md)。
- 每次读出来是一个新对象，字段只读。要改就整个重新赋值，见[结构体](../structs.md)。

## 示例

```js
const scroller = new UIScrollView();
const top = -scroller.adjustedContentInset.top;
scroller.setContentOffset(new CGPoint(0, top), { animated: true });
```

**效果**：平滑滚回最顶部。顶部的位置不一定是 `0`，所以减去 `adjustedContentInset.top`。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollView.adjustedContentInset`。

## 参见

- [安全区](../ui-scroll-view.md#安全区)
