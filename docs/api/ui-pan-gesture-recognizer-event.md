---
type: reference
native: UIPanGestureRecognizerEvent
---

# `UIPanGestureRecognizerEvent`

**`UIPanGestureRecognizerEvent`** 表示拖动手势的一次事件：开始、移动、结束、被取消。

它在 [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md) 的基础上多带手指移动的距离和速度。

**继承关系**：[`Event`](event.md) → [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md) → `UIPanGestureRecognizerEvent`

## 构造函数

[`UIPanGestureRecognizerEvent()`](ui-pan-gesture-recognizer-event/constructor.md)

创建一个 `UIPanGestureRecognizerEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md) 的 [`location`](ui-gesture-recognizer-event/location.md)、[`numberOfTouches`](ui-gesture-recognizer-event/numberoftouches.md)，和 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`translation`](ui-pan-gesture-recognizer-event/translation.md) <small>只读</small> | 从手势开始到这个事件为止，手指移动了多少 |
| [`velocity`](ui-pan-gesture-recognizer-event/velocity.md) <small>只读</small> | 手指移动的速度 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UIPanGestureRecognizer`](ui-pan-gesture-recognizer.md)、[`UIScreenEdgePanGestureRecognizer`](ui-screen-edge-pan-gesture-recognizer.md) | [`began`](ui-gesture-recognizer/began-event.md)、[`changed`](ui-gesture-recognizer/changed-event.md)、[`ended`](ui-gesture-recognizer/ended-event.md)、[`cancelled`](ui-gesture-recognizer/cancelled-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。这些值都是事件发生那一刻的：回调比手势晚执行，回头在识别器上读不到当时的值。

## 示例

```js
const card = new UIView();
const drag = new UIPanGestureRecognizer();
drag.addEventListener('changed', (e) => {
  console.log(e instanceof UIPanGestureRecognizerEvent, e.translation.x, e.velocity.x);
});
card.addGestureRecognizer(drag);
```

**效果**：在 `card` 上拖动时，每次移动输出 `true`、横向移动的距离和横向速度。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[recognizer translationInView:recognizer.view]` | `event.translation` |
| `[recognizer velocityInView:recognizer.view]` | `event.velocity` |

## 参见

- [`UIPanGestureRecognizer`](ui-pan-gesture-recognizer.md)：派发这些事件的对象
- [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md)：父类
