---
type: reference
native: "UIScrollViewDelegate scrollViewWillBeginDecelerating:"
---

# `UIScrollView`：`deceleratebegin` 事件

**`deceleratebegin`** 事件在用户松手后、内容开始继续滑时派发。

## 语法

```
scroller.addEventListener('deceleratebegin', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target`（这个滚动视图），不带别的数据。不能取消。

## 什么时候派发

- 在 `dragend` 之后（实测）。
- 回调执行时 [`isDecelerating`](isdecelerating.md) 是 `true`。
- 松手时内容已经停住的话，不派发（**未在模拟器验证**）。
- 在事情发生之后、当前这段 JS 执行完之后派发。回调执行时滚动视图的状态已经是新的。
- 没有监听器时没有开销。

## 示例

```js
const scroller = new UIScrollView();
scroller.addEventListener('deceleratebegin', () => console.log('开始减速'));
```

**效果**：用户快速一划再松手，控制台输出 `开始减速`。

## 对应的 iOS API

`UIScrollViewDelegate` 的 `scrollViewWillBeginDecelerating:`。

## 参见

- [`decelerateend`](decelerateend-event.md)
