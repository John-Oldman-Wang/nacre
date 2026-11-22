---
type: reference
native: UIScrollViewDragEndEvent
---

# `UIScrollViewDragEndEvent`

**`UIScrollViewDragEndEvent`** 表示用户拖动滚动视图之后、松手的那一刻。

[`UIScrollView`](ui-scroll-view.md) 的 [`beforedragend`](ui-scroll-view/beforedragend-event.md) 事件是它。它带着松手时的速度和内容将要停下的位置；监听器可以改这个位置，让内容停在别处，比如对齐到一行的边界。

**继承关系**：[`Event`](event.md) → `UIScrollViewDragEndEvent`

## 构造函数

[`UIScrollViewDragEndEvent()`](ui-scroll-view-drag-end-event/constructor.md)

创建一个 `UIScrollViewDragEndEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性除了 `targetContentOffset` 都是只读的，给只读的属性赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`velocity`](ui-scroll-view-drag-end-event/velocity.md) <small>只读</small> | 松手时内容移动的速度 |
| [`targetContentOffset`](ui-scroll-view-drag-end-event/targetcontentoffset.md) | 内容停下时的位置。可写，写了内容就停在那里 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UIScrollView`](ui-scroll-view.md) 和它的子类 | [`beforedragend`](ui-scroll-view/beforedragend-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。要让内容停在原地，把 [`targetContentOffset`](ui-scroll-view-drag-end-event/targetcontentoffset.md) 写成当前的 `contentOffset`。

## 示例

```js
const scroller = new UIScrollView();
scroller.addEventListener('beforedragend', (e) => {
  console.log(e instanceof UIScrollViewDragEndEvent, e.velocity.y, e.targetContentOffset.y);
});
```

**效果**：拖动 `scroller` 后松手，输出 `true`、纵向的速度和系统算出的停下的位置。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `scrollViewWillEndDragging:withVelocity:targetContentOffset:` | `beforedragend` 事件 |
| 参数 `velocity` | `event.velocity` |
| `*targetContentOffset = CGPointMake(0, y)` | `event.targetContentOffset = new CGPoint(0, y)` |

## 参见

- [`beforedragend`](ui-scroll-view/beforedragend-event.md)：什么时候派发
- [做一个能滚动的页面](../guides/scrolling.md)
