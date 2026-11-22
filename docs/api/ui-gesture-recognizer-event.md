---
type: reference
native: UIGestureRecognizerEvent
---

# `UIGestureRecognizerEvent`

**`UIGestureRecognizerEvent`** 表示手势识别器的一次事件：手势要开始、开始、变化、结束、被取消。

它带着手势的位置和参与的手指个数。拖动、捏合、旋转三种识别器的 `began`、`changed`、`ended`、`cancelled` 是它的子类，多带几个字段：[`UIPanGestureRecognizerEvent`](ui-pan-gesture-recognizer-event.md)、[`UIPinchGestureRecognizerEvent`](ui-pinch-gesture-recognizer-event.md)、[`UIRotationGestureRecognizerEvent`](ui-rotation-gesture-recognizer-event.md)。

**继承关系**：[`Event`](event.md) → `UIGestureRecognizerEvent`

## 构造函数

[`UIGestureRecognizerEvent()`](ui-gesture-recognizer-event/constructor.md)

创建一个 `UIGestureRecognizerEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`location`](ui-gesture-recognizer-event/location.md) <small>只读</small> | 手势的位置，在识别器所在视图的坐标系里 |
| [`numberOfTouches`](ui-gesture-recognizer-event/numberoftouches.md) <small>只读</small> | 参与手势的手指个数 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UIGestureRecognizer`](ui-gesture-recognizer.md) 和它的全部子类 | [`beforebegin`](ui-gesture-recognizer/beforebegin-event.md) |
| [`UITapGestureRecognizer`](ui-tap-gesture-recognizer.md)、[`UILongPressGestureRecognizer`](ui-long-press-gesture-recognizer.md)、[`UISwipeGestureRecognizer`](ui-swipe-gesture-recognizer.md) | [`began`](ui-gesture-recognizer/began-event.md)、[`changed`](ui-gesture-recognizer/changed-event.md)、[`ended`](ui-gesture-recognizer/ended-event.md)、[`cancelled`](ui-gesture-recognizer/cancelled-event.md) |

`beforebegin` 可以取消：`cancelable` 是 `true`，调了 `preventDefault()`，这一次手势不开始。其余的不能取消。

拖动、捏合、旋转识别器的 `beforebegin` 也是这个类，不是子类：手势还没开始，没有移动的距离、缩放的倍数这些值。

## 示例

```js
const page = new UIViewController();
const tap = new UITapGestureRecognizer();
tap.addEventListener('beforebegin', (e) => {
  if (e.location !== null && e.location.y < 100) {
    e.preventDefault();
  }
});
tap.addEventListener('ended', (e) => {
  console.log(e instanceof UIGestureRecognizerEvent, e.location?.y);
});
page.view.addGestureRecognizer(tap);
```

**效果**：点页面顶部 100 pt 以内，手势不开始，什么都不输出。点别处，输出 `true` 和点的纵坐标。

## 对应的 iOS API

原生的 action 方法收到识别器本身，从识别器上读位置和手指个数。这里两样是事件发生那一刻的值，在事件对象上。

| ObjC | JS |
| --- | --- |
| `[recognizer locationInView:recognizer.view]` | `event.location` |
| `recognizer.numberOfTouches` | `event.numberOfTouches` |
| `gestureRecognizerShouldBegin:` 返回 `NO` | 在 `beforebegin` 里调 `preventDefault()` |

## 参见

- [`UIGestureRecognizer`](ui-gesture-recognizer.md)：派发这些事件的对象
- [响应手势](../guides/gestures.md)
