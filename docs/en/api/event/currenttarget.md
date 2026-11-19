---
type: reference
native: Event.currentTarget
---

# `Event`: `currentTarget` property

The **`currentTarget`** property is the object whose listener is currently running. Events don't bubble, so it is always the same as [`target`](target.md).

## Value

[`EventTarget`](../event-target.md), or `null`.

- Read-only. Assigning to it throws `TypeError`.
- Same as `target`.

## Examples

```js
application.addEventListener('ping', (e) => {
  console.log(e.currentTarget === e.target);
});
application.dispatchEvent(new Event('ping'));
```

**Result**: The console prints `true`. **Not verified in the simulator.**

## See also

- [`target`](target.md)
