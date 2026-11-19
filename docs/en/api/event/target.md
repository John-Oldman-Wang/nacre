---
type: reference
native: Event.target
---

# `Event`: `target` property

The **`target`** property is the object the event was dispatched to.

## Value

[`EventTarget`](../event-target.md), or `null`.

- Read-only. Assigning to it throws `TypeError`.
- `null` if it hasn't been dispatched yet.
- In events fired by the system, it is the object where the event happened, for example the tapped button or `application`.

## Examples

```js
application.addEventListener('ping', (e) => {
  console.log(e.target === application);
});
application.dispatchEvent(new Event('ping'));
```

**Result**: The console prints `true`.

## See also

- [`currentTarget`](currenttarget.md)
