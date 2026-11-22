---
type: reference
native: UIPinchGestureRecognizerEvent
---

# `UIPinchGestureRecognizerEvent`

**`UIPinchGestureRecognizerEvent`** 表示捏合手势的一次事件：开始、变化、结束、被取消。

它在 [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md) 的基础上多带缩放的倍数和速度。

**继承关系**：[`Event`](event.md) → [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md) → `UIPinchGestureRecognizerEvent`

## 构造函数

[`UIPinchGestureRecognizerEvent()`](ui-pinch-gesture-recognizer-event/constructor.md)

创建一个 `UIPinchGestureRecognizerEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md) 的 [`location`](ui-gesture-recognizer-event/location.md)、[`numberOfTouches`](ui-gesture-recognizer-event/numberoftouches.md)，和 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`scale`](ui-pinch-gesture-recognizer-event/scale.md) <small>只读</small> | 两指间距相对手势开始时的倍数 |
| [`velocity`](ui-pinch-gesture-recognizer-event/velocity.md) <small>只读</small> | `scale` 每秒变化多少 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UIPinchGestureRecognizer`](ui-pinch-gesture-recognizer.md) | [`began`](ui-gesture-recognizer/began-event.md)、[`changed`](ui-gesture-recognizer/changed-event.md)、[`ended`](ui-gesture-recognizer/ended-event.md)、[`cancelled`](ui-gesture-recognizer/cancelled-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。这些值都是事件发生那一刻的：回调比手势晚执行，回头在识别器上读不到当时的值。

## 示例

```js
const photo = new UIView();
const pinch = new UIPinchGestureRecognizer();
pinch.addEventListener('changed', (e) => {
  console.log(e instanceof UIPinchGestureRecognizerEvent, e.scale.toFixed(2));
});
photo.addGestureRecognizer(pinch);
```

**效果**：两指在 `photo` 上捏合时，输出 `true` 和当前的倍数。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `recognizer.scale` | `event.scale` |
| `recognizer.velocity` | `event.velocity` |

## 参见

- [`UIPinchGestureRecognizer`](ui-pinch-gesture-recognizer.md)：派发这些事件的对象
- [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md)：父类
