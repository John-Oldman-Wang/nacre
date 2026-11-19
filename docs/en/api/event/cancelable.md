---
type: reference
native: Event.cancelable
---

# `Event`: `cancelable` property

The **`cancelable`** property indicates whether this event can be canceled with [`preventDefault()`](preventdefault.md).

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | `preventDefault()` takes effect |
| `false` | `preventDefault()` has no effect and doesn't throw |

- Read-only. Assigning to it throws `TypeError`.
- When you construct the event yourself and don't pass it, it is `false`.
- Events fired for system notifications are always `false`; see [Events fired by the system can't be canceled](../event.md#events-fired-by-the-system-cant-be-canceled).

## Examples

```js
console.log(new Event('a').cancelable, new Event('b', { cancelable: true }).cancelable);
```

**Result**: The console prints `false true`.

## See also

- [`defaultPrevented`](defaultprevented.md)
