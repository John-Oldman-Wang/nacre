---
type: reference
native: AVCaptureSessionInterruptEvent
---

# `AVCaptureSessionInterruptEvent`

**`AVCaptureSessionInterruptEvent`** 表示取景被系统打断了。

[`AVCaptureSession`](av-capture-session.md) 的 [`interrupt`](av-capture-session/interrupt-event.md) 事件是它，[`reason`](av-capture-session-interrupt-event/reason.md) 是被打断的原因。

它属于 `@nacrejs/av-capture` 这个包，装法见 [`AVCaptureSession`](av-capture-session.md#先装上)。

**继承关系**：[`Event`](event.md) → `AVCaptureSessionInterruptEvent`

## 构造函数

[`AVCaptureSessionInterruptEvent()`](av-capture-session-interrupt-event/constructor.md)

创建一个 `AVCaptureSessionInterruptEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`reason`](av-capture-session-interrupt-event/reason.md) <small>只读</small> | 为什么被打断 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`AVCaptureSession`](av-capture-session.md) | [`interrupt`](av-capture-session/interrupt-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const session = new AVCaptureSession();
session.addEventListener('interrupt', (e) => {
  console.log(e instanceof AVCaptureSessionInterruptEvent, e.reason);
});
```

**效果**：取景被打断时，输出 `true` 和原因。**未在真机验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `AVCaptureSessionWasInterruptedNotification` | `interrupt` 事件 |
| `userInfo[AVCaptureSessionInterruptionReasonKey]` | `event.reason` |
| `AVCaptureSessionInterruptionReasonVideoDeviceInUseByAnotherClient` | `'videoDeviceInUseByAnotherClient'`，其余同理 |

## 参见

- [`interrupt`](av-capture-session/interrupt-event.md)：什么时候派发
- [`AVCaptureSession`](av-capture-session.md)
