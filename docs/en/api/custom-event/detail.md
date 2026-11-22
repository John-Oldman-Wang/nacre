---
type: reference
web: CustomEvent.detail
---

# `CustomEvent`: `detail` property

The **`detail`** property is the data the event carries.

## Value

Any value. In an event from a native module, it is one of the [values that can be passed to JS](../native-module.md#values-that-can-be-passed); when the native side passes no data, it is `null`.

- Read-only. Assigning to it throws `TypeError`.
- It is the very value given when the event was built; it is not copied.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const target = new EventTarget();
target.addEventListener('ping', (e) => {
  if (e instanceof CustomEvent) {
    console.log(e.detail);
  }
});
target.dispatchEvent(new CustomEvent('ping', { detail: 42 }));
```

**Effect**: the console prints `42`.

## Corresponding iOS API

The `detail` a native module passes when it fires an event with `emitEvent:detail:`; see [Writing your own native module](../../guides/native-modules.md).

## See also

- [`CustomEvent`](../custom-event.md)
