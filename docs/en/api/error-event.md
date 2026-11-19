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

Creates an error event object. The runtime creates one itself when it fires `error`; app code rarely needs to.

## Instance properties

Also inherits the properties of [`Event`](event.md). For the `error` event the runtime fires, `cancelable` is `true`.

| Property | Description |
| --- | --- |
| [`message`](error-event/message.md) <small>read-only</small> | A short text summary of the error |
| [`error`](error-event/error.md) <small>read-only</small> | The value that was thrown |
| [`filename`](error-event/filename.md) <small>read-only</small> | The name of the script that failed |
| [`lineno`](error-event/lineno.md) <small>read-only</small> | The line number where the error occurred |

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
- [Handling errors in one place](../guides/handle-errors.md)
