---
type: reference
native: "UIScrollViewDelegate scrollViewDidScrollToTop:"
---

# `UIScrollView`：`scrolltotop` 事件

**`scrolltotop`** 事件在用户点了屏幕顶部的状态栏、滚动视图滚回顶部之后派发。

## 语法

```
scroller.addEventListener('scrolltotop', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target`（这个滚动视图），不带别的数据。不能取消。

## 什么时候派发

- 只有 [`scrollsToTop`](scrollstotop.md) 是 `true` 的滚动视图会滚回顶部。
- 一个屏幕上只能有一个滚动视图的 `scrollsToTop` 是 `true`。有多个时，点状态栏都没有反应。
- 要真实点击状态栏才能触发，**未在模拟器验证**。
- 在事情发生之后、当前这段 JS 执行完之后派发。回调执行时滚动视图的状态已经是新的。
- 没有监听器时没有开销。

## 示例

```js
const scroller = new UIScrollView();
scroller.addEventListener('scrolltotop', () => console.log('回到了顶部'));
```

**效果**：用户点状态栏，内容滚回顶部后，控制台输出 `回到了顶部`。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollViewDelegate` 的 `scrollViewDidScrollToTop:`。

## 参见

- [`scrollsToTop`](scrollstotop.md)
