---
type: reference
native: AVCaptureSessionRuntimeErrorEvent
---

# `AVCaptureSessionRuntimeErrorEvent`

**`AVCaptureSessionRuntimeErrorEvent`** 表示取景中出了错。

[`AVCaptureSession`](av-capture-session.md) 的 [`runtimeerror`](av-capture-session/runtimeerror-event.md) 事件是它，[`error`](av-capture-session-runtime-error-event/error.md) 是系统给的错误。

它属于 `@nacrejs/av-capture` 这个包，装法见 [`AVCaptureSession`](av-capture-session.md#先装上)。

**继承关系**：[`Event`](event.md) → `AVCaptureSessionRuntimeErrorEvent`

## 构造函数

[`AVCaptureSessionRuntimeErrorEvent()`](av-capture-session-runtime-error-event/constructor.md)

创建一个 `AVCaptureSessionRuntimeErrorEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`error`](av-capture-session-runtime-error-event/error.md) <small>只读</small> | 系统给的错误 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`AVCaptureSession`](av-capture-session.md) | [`runtimeerror`](av-capture-session/runtimeerror-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const session = new AVCaptureSession();
session.addEventListener('runtimeerror', (e) => {
  console.log(e instanceof AVCaptureSessionRuntimeErrorEvent, e.error instanceof NSError);
});
```

**效果**：取景出错时，输出 `true true`。**未在真机验证**：这个事件触发不了。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `AVCaptureSessionRuntimeErrorNotification` | `runtimeerror` 事件 |
| `userInfo[AVCaptureSessionErrorKey]` | `event.error` |

## 参见

- [`runtimeerror`](av-capture-session/runtimeerror-event.md)：什么时候派发
- [`NSError`](ns-error.md)
