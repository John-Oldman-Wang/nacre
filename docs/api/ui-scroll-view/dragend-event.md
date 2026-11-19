---
type: reference
native: "UIScrollViewDelegate scrollViewDidEndDragging:willDecelerate:"
---

# `UIScrollView`：`dragend` 事件

**`dragend`** 事件在用户松手时派发。

## 语法

```
scroller.addEventListener('dragend', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target`（这个滚动视图），不带别的数据。不能取消。

## 什么时候派发

- 回调里读 [`isDecelerating`](isdecelerating.md)，得到的是「松手后是否还在滑」的实际结果。
- 松手时手指没有速度，内容不会继续滑，之后也就没有 `deceleratebegin` 和 `decelerateend`（**未在模拟器验证**）。所以要在内容停下时做事，`dragend` 和 `decelerateend` 两个都要听。
- 在事情发生之后、当前这段 JS 执行完之后派发。回调执行时滚动视图的状态已经是新的。
- 没有监听器时没有开销。

## 示例

```js
const scroller = new UIScrollView();
function settled() {
  console.log('停在', scroller.contentOffset.y);
}
scroller.addEventListener('decelerateend', settled);
scroller.addEventListener('dragend', () => {
  if (!scroller.isDecelerating) settled();
});
```

**效果**：不管松手时内容还滑不滑，内容停下时都输出一次停下的位置。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollViewDelegate` 的 `scrollViewDidEndDragging:willDecelerate:`。参数 `willDecelerate` 改读 `isDecelerating`。

## 参见

- [`decelerateend`](decelerateend-event.md)
