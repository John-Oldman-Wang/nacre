---
type: reference
native: "UIScrollViewDelegate scrollViewDidEndDecelerating:"
---

# `UIScrollView`：`decelerateend` 事件

**`decelerateend`** 事件在惯性滑动结束、内容完全停下时派发。

## 语法

```
scroller.addEventListener('decelerateend', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target`（这个滚动视图），不带别的数据。不能取消。

## 什么时候派发

- 在 `deceleratebegin` 之后（实测）。
- 松手时内容已经停住的话，不派发（**未在模拟器验证**）。这时在 [`dragend`](dragend-event.md) 里判断。
- `setContentOffset()` 的动画结束时派发的是 [`scrollanimationend`](scrollanimationend-event.md)，不是它。
- 在事情发生之后、当前这段 JS 执行完之后派发。回调执行时滚动视图的状态已经是新的。
- 没有监听器时没有开销。

## 示例

```js
const scroller = new UIScrollView();
scroller.isPagingEnabled = true;
scroller.addEventListener('decelerateend', () => {
  const index = Math.round(scroller.contentOffset.x / scroller.bounds.width);
  console.log('第', index, '页');
});
```

**效果**：横向翻页的滚动视图每次停下时，输出当前是第几页（从 0 开始）。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollViewDelegate` 的 `scrollViewDidEndDecelerating:`。

## 参见

- [`dragend`](dragend-event.md)
