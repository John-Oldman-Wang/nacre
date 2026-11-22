---
type: reference
native: PushEvent()
---

# `PushEvent()` constructor

The **`PushEvent()`** constructor creates a `PushEvent`.

## Syntax

```
new PushEvent(type)
new PushEvent(type, { data })
```

### Parameters

**`type`**

The event name, a string. Use `'push'` to simulate a silent push.

**`options.data`**

Optional. Corresponds to the [`data`](data.md) property: the push content, a plain object. When omitted, it is an empty object.

### Return value

The new `PushEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'PushEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const push = application.remoteNotifications;
push.addEventListener('push', (event) => {
  console.log('收到', event.data.orderId);
});
push.dispatchEvent(new PushEvent('push', { data: { orderId: 42 } }));
```

**Result**: prints `收到 42`. Nothing happens on the system side.

> **Note**: Calling [`waitUntil()`](waituntil.md) on a `PushEvent` you dispatched yourself throws `InvalidStateError`: only silent pushes the runtime dispatches can use it.

## Corresponding iOS API

There is no corresponding system API. It corresponds to `new PushEvent()` in the browser.

## See also

- [`PushEvent`](../push-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
