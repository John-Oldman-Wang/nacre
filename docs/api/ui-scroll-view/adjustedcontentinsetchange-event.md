---
type: reference
native: "UIScrollViewDelegate scrollViewDidChangeAdjustedContentInset:"
---

# `UIScrollView`：`adjustedcontentinsetchange` 事件

**`adjustedcontentinsetchange`** 事件在 [`adjustedContentInset`](adjustedcontentinset.md) 变了时派发。

## 语法

```
scroller.addEventListener('adjustedcontentinsetchange', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target`（这个滚动视图），不带别的数据。不能取消。

## 什么时候派发

- 系统为安全区加的留白变了，或者 App 改了 `contentInset`，都可能引起它。哪些情况下派发**未在模拟器验证**。
- 在事情发生之后、当前这段 JS 执行完之后派发。回调执行时滚动视图的状态已经是新的。
- 没有监听器时没有开销。

## 示例

```js
const scroller = new UIScrollView();
scroller.addEventListener('adjustedcontentinsetchange', () => {
  console.log('顶部留白', scroller.adjustedContentInset.top);
});
```

**效果**：实际留白变化时输出新的顶部留白。

## 对应的 iOS API

`UIScrollViewDelegate` 的 `scrollViewDidChangeAdjustedContentInset:`。

## 参见

- [安全区](../ui-scroll-view.md#安全区)
