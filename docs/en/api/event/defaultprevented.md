---
type: reference
native: Event.defaultPrevented
---

# `Event`: `defaultPrevented` property

The **`defaultPrevented`** property indicates whether a listener called [`preventDefault()`](preventdefault.md) and it took effect.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | A listener called `preventDefault()`, and `cancelable` is `true` |
| `false` | None did, or `cancelable` is `false` |

- Read-only. Assigning to it throws `TypeError`.

## Examples

```js
application.addEventListener('ask', (e) => e.preventDefault());
const event = new Event('ask', { cancelable: true });
application.dispatchEvent(event);
console.log(event.defaultPrevented);
```

**Result**: The console prints `true`.

## See also

- [`cancelable`](cancelable.md)
