---
type: reference
native: "UIScrollViewDelegate scrollViewDidEndScrollingAnimation:"
---

# `UIScrollView`：`scrollanimationend` 事件

**`scrollanimationend`** 事件在 [`setContentOffset()`](setcontentoffset.md) 带动画的滚动结束时派发。

## 语法

```
scroller.addEventListener('scrollanimationend', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target`（这个滚动视图），不带别的数据。不能取消。

## 什么时候派发

- 只有带动画的 `setContentOffset()` 会引起它。直接写 `contentOffset` 不派发。
- 回调执行时 [`isScrollAnimating`](isscrollanimating.md) 是 `false`。
- 在事情发生之后、当前这段 JS 执行完之后派发。回调执行时滚动视图的状态已经是新的。
- 没有监听器时没有开销。

## 示例

```js
const scroller = new UIScrollView();
scroller.addEventListener('scrollanimationend', () => console.log('滚到了'));
scroller.setContentOffset(new CGPoint(0, 500), { animated: true });
```

**效果**：动画结束时，控制台输出 `滚到了`。

## 对应的 iOS API

`UIScrollViewDelegate` 的 `scrollViewDidEndScrollingAnimation:`。

## 参见

- [`setContentOffset()`](setcontentoffset.md)
