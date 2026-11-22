---
type: reference
native: ErrorEvent.colno
---

# `ErrorEvent`: `colno` property

The **`colno`** property is the column number where the error occurred.

## Value

A number.

- Read-only. Assigning to it throws `TypeError`.
- It is always `0` in `error` events the runtime fires: the runtime doesn't report column numbers. Use [`filename`](filename.md) and [`lineno`](lineno.md) to find where the error occurred.
- When the event is created with [`new`](constructor.md) without it, it is `0`.

## Examples

```js
const event = new ErrorEvent('error', { message: '坏了', lineno: 3, colno: 7 });
console.log(event.lineno, event.colno);
```

**Result**: prints `3 7`.

## See also

- [`lineno`](lineno.md)
