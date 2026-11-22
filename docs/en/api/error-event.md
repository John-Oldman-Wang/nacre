---
type: reference
native: ErrorEvent
status: partial
---

# `ErrorEvent`

**`ErrorEvent`** represents an uncaught exception. It is the event object of the [`error`](application/error-event.md) event on [`application`](application.md), and carries the thrown value, the name of the script that failed, and the line number.

**Inheritance**: [`Event`](event.md) → `ErrorEvent`

## Constructor

[`ErrorEvent()`](error-event/constructor.md)

Creates an error event object. The runtime creates one itself when it fires `error`; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md). The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`message`](error-event/message.md) <small>read-only</small> | A short text summary of the error |
| [`error`](error-event/error.md) <small>read-only</small> | The value that was thrown |
| [`filename`](error-event/filename.md) <small>read-only</small> | The name of the script that failed |
| [`lineno`](error-event/lineno.md) <small>read-only</small> | The line number where the error occurred |
| [`colno`](error-event/colno.md) <small>read-only</small> | The column number where the error occurred. Always 0 in events the runtime fires |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`application`](application.md) | [`error`](application/error-event.md) |
| [`WebSocket`](websocket.md) | [`error`](websocket/error-event.md) |

`error` on `application` can be canceled: `cancelable` is `true`, and calling `preventDefault()` stops the runtime from printing its default error log. `error` on `WebSocket` can't be canceled and carries only [`message`](error-event/message.md): `filename` is an empty string, `lineno` and `colno` are 0, and `error` is `undefined`.

## Examples

```js
application.addEventListener('error', (e) => {
  console.log(e instanceof ErrorEvent, e.message);
  e.preventDefault();
});
throw new Error('Broken');
```

**Result**: prints `true` and the summary of the error.

## See also

- [`error`](application/error-event.md)
- [`error` of `WebSocket`](websocket/error-event.md)
- [Handling errors in one place](../guides/handle-errors.md)
