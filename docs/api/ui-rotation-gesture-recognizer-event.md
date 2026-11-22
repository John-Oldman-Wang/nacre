---
type: reference
native: UIRotationGestureRecognizerEvent
---

# `UIRotationGestureRecognizerEvent`

**`UIRotationGestureRecognizerEvent`** 表示旋转手势的一次事件：开始、变化、结束、被取消。

它在 [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md) 的基础上多带转过的角度和旋转的速度。

**继承关系**：[`Event`](event.md) → [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md) → `UIRotationGestureRecognizerEvent`

## 构造函数

[`UIRotationGestureRecognizerEvent()`](ui-rotation-gesture-recognizer-event/constructor.md)

创建一个 `UIRotationGestureRecognizerEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md) 的 [`location`](ui-gesture-recognizer-event/location.md)、[`numberOfTouches`](ui-gesture-recognizer-event/numberoftouches.md)，和 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`rotation`](ui-rotation-gesture-recognizer-event/rotation.md) <small>只读</small> | 相对手势开始时转过的角度 |
| [`velocity`](ui-rotation-gesture-recognizer-event/velocity.md) <small>只读</small> | 旋转的速度 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UIRotationGestureRecognizer`](ui-rotation-gesture-recognizer.md) | [`began`](ui-gesture-recognizer/began-event.md)、[`changed`](ui-gesture-recognizer/changed-event.md)、[`ended`](ui-gesture-recognizer/ended-event.md)、[`cancelled`](ui-gesture-recognizer/cancelled-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。这些值都是事件发生那一刻的：回调比手势晚执行，回头在识别器上读不到当时的值。

## 示例

```js
const dial = new UIView();
const turn = new UIRotationGestureRecognizer();
turn.addEventListener('changed', (e) => {
  console.log(e instanceof UIRotationGestureRecognizerEvent, (e.rotation * 180 / Math.PI).toFixed(0));
});
dial.addGestureRecognizer(turn);
```

**效果**：两指在 `dial` 上转动时，输出 `true` 和转过的度数。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `recognizer.rotation` | `event.rotation` |
| `recognizer.velocity` | `event.velocity` |

## 参见

- [`UIRotationGestureRecognizer`](ui-rotation-gesture-recognizer.md)：派发这些事件的对象
- [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md)：父类
