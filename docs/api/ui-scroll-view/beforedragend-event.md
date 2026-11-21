---
type: reference
native: "UIScrollViewDelegate scrollViewWillEndDragging:withVelocity:targetContentOffset:"
---

# `UIScrollView`：`beforedragend` 事件

**`beforedragend`** 事件在用户拖动之后松手的那一刻派发，比 [`dragend`](dragend-event.md) 早。这时系统已经算好内容会滑到哪里停下，监听器可以改掉这个停下的位置。

## 语法

```
scroller.addEventListener('beforedragend', (event) => { })
```

## 事件对象

`UIScrollViewDragEndEvent`。除了 `type` 和 `target`（这个滚动视图），还带两个字段：

| 字段 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `velocity` | [`CGPoint`](../cg-point.md) | 是 | 否 | 松手时内容移动的速度，单位是 [pt](../units.md) 每毫秒 |
| `targetContentOffset` | [`CGPoint`](../cg-point.md) | 是 | 是 | 内容停下时的 [`contentOffset`](contentoffset.md)，单位 pt。初值是系统算出的停下的位置 |

回调参数的类型声明是 `Event`，读写这两个字段要转一下类型，见示例。

不能取消：`event.cancelable` 是 `false`，`preventDefault()` 没有效果。要让内容停在原地，把 `targetContentOffset` 写成当前的 `contentOffset`。

`velocity` 的正负号表示方向，和 `contentOffset` 变化的方向一致：`y` 为正时，内容往 `contentOffset.y` 增大的方向滑。**未用真实的手指验证。**

### 写 `targetContentOffset`

- 写一个 [`CGPoint`](../cg-point.md)，或者带数值 `x`、`y` 的普通对象，比如 `{ x: 0, y: 40 }`。监听器全部执行完之后，内容滑到这个位置停下。
- 写别的值（字符串、缺字段的对象、`NaN`）不报错，也没有警告。这一次按系统算出的位置停。
- 不写，按系统算出的位置停。
- 写的位置超出内容区时内容怎么停，**未在模拟器验证**。
- 松手时手指没有速度（`velocity` 是 0）时改停下的位置，内容怎么移过去，**未在模拟器验证**。

## 什么时候派发

- 只在用户拖动之后松手时派发。代码写 `contentOffset`、调 [`setContentOffset()`](setcontentoffset.md) 不派发（来自 iOS 的定义，**未在模拟器验证**）。
- 当场派发。系统派发事件之后等监听器全部执行完，再按 `targetContentOffset` 让内容滑下去。这一点和别的滚动事件不同：它们在事情发生之后、当前这段 JS 执行完之后才派发。
- 同一个事件有多个监听器时，按添加的顺序执行。后面的监听器读到的 `targetContentOffset` 是前面写过的值，最后的值生效。
- 监听器里抛出异常时，同一事件的其他监听器照常执行。异常在 [`application`](../application.md#没处理的异常不会让-app-退出) 上派发 `error`。抛出之前写进 `targetContentOffset` 的值仍然有效；没写就按系统算出的位置停。
- 没有监听器时，内容按系统算出的位置停。移除最后一个监听器之后也一样。
- 派发、两个字段的值、写入后系统按什么位置停，都在验收用例里验证过：用例照系统松手时的做法向滚动视图要停下的位置，断言了交回给系统的值。用真实的手指拖动时内容滑到新位置的样子，**未用真实的手指验证**。

> **注意**：监听器执行期间系统在等。在监听器里只算停下的位置，不做耗时的事。

## 示例

```js
const scroller = new UIScrollView();
const rowHeight = 80;
scroller.addEventListener('beforedragend', (event) => {
  const e = /** @type {UIScrollViewDragEndEvent} */ (event);
  const y = Math.round(e.targetContentOffset.y / rowHeight) * rowHeight;
  e.targetContentOffset = new CGPoint(0, y);
});
```

**效果**：每次拖动松手后，内容停在 `contentOffset.y` 是 80 的整数倍的位置。系统算出停在 123 时，内容停在 160。交回给系统的值在验收用例里验证过；内容滑过去的样子**未用真实的手指验证**。

## 对应的 iOS API

`UIScrollViewDelegate` 的 `scrollViewWillEndDragging:withVelocity:targetContentOffset:`。参数 `velocity` 是事件对象的 `velocity`；出参 `targetContentOffset` 改成事件对象上可写的 `targetContentOffset`。

## 参见

- [让滚动停在整行的位置](../../guides/scrolling.md#让滚动停在整行的位置)
- [`dragend`](dragend-event.md)：紧接着派发，松手之后的状态从这里读
- [`isPagingEnabled`](ispagingenabled.md)：按可视区的整数倍停，不用写监听器
- [`decelerationRate`](decelerationrate.md)：松手之后滑得多远
