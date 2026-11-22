---
type: reference
native: UIControlTouchEvent
---

# `UIControlTouchEvent`

**`UIControlTouchEvent`** 表示控件上的一次触摸事件：手指按下、移动、松开、被打断。

[`UIControl`](ui-control.md) 和它的子类（按钮、开关、滑块……）上 `touch` 开头的九个事件是它。它带着手指的位置和连击次数。

**继承关系**：[`Event`](event.md) → `UIControlTouchEvent`

## 构造函数

[`UIControlTouchEvent()`](ui-control-touch-event/constructor.md)

创建一个 `UIControlTouchEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`location`](ui-control-touch-event/location.md) <small>只读</small> | 手指的位置，在这个控件自己的坐标系里 |
| [`tapCount`](ui-control-touch-event/tapcount.md) <small>只读</small> | 连击次数 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UIControl`](ui-control.md) 和它的子类 | [`touchdown`](ui-control/touchdown-event.md)、[`touchdownrepeat`](ui-control/touchdownrepeat-event.md)、[`touchdraginside`](ui-control/touchdraginside-event.md)、[`touchdragoutside`](ui-control/touchdragoutside-event.md)、[`touchdragenter`](ui-control/touchdragenter-event.md)、[`touchdragexit`](ui-control/touchdragexit-event.md)、[`touchupinside`](ui-control/touchupinside-event.md)、[`touchupoutside`](ui-control/touchupoutside-event.md)、[`touchcancel`](ui-control/touchcancel-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const card = new UIControl();
card.addEventListener('touchupinside', (e) => {
  console.log(e instanceof UIControlTouchEvent, e.location?.x, e.tapCount);
});
card.sendActionsForControlEvents(['touchupinside']);
```

**效果**：输出 `true undefined 0`：用代码派发的事件没有真实的触摸，`location` 是 `null`。手指在 `card` 上松开时，输出 `true`、手指的横坐标和连击次数。

## 对应的 iOS API

原生的 action 方法收到一个 `UIEvent`，从里面的 `UITouch` 取位置和连击次数。这里两样都直接在事件对象上。

| ObjC | JS |
| --- | --- |
| `[touch locationInView:control]` | `event.location` |
| `touch.tapCount` | `event.tapCount` |

## 参见

- [`UIControl`](ui-control.md)：派发这些事件的对象
- [处理控件的触摸](../guides/control-touches.md)：九个事件的先后
