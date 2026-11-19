---
type: reference
native: "UIScrollViewDelegate scrollViewWillBeginDragging:"
---

# `UIScrollView`：`dragbegin` 事件

**`dragbegin`** 事件在用户开始拖动时派发。

## 语法

```
scroller.addEventListener('dragbegin', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target`（这个滚动视图），不带别的数据。不能取消。

## 什么时候派发

- 回调执行时 [`isDragging`](isdragging.md) 是 `true`。
- 用户拖一下再松手，顺序是 `dragbegin` → `dragend` → `deceleratebegin` → `decelerateend`（实测）。
- 在事情发生之后、当前这段 JS 执行完之后派发。回调执行时滚动视图的状态已经是新的。
- 没有监听器时没有开销。

## 示例

```js
const scroller = new UIScrollView();
scroller.addEventListener('dragbegin', () => console.log('开始拖'));
scroller.addEventListener('dragend', () => console.log('松手'));
scroller.addEventListener('decelerateend', () => console.log('完全停下'));
```

**效果**：用户拖一下再松手，依次输出 `开始拖`、`松手`、`完全停下`（实测的顺序）。

## 对应的 iOS API

`UIScrollViewDelegate` 的 `scrollViewWillBeginDragging:`。

## 参见

- [`dragend`](dragend-event.md)
