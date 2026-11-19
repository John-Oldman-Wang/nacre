---
type: reference
native: UIApplication.prefersReducedResourceUsage
---

# `Application`: `prefersReducedResourceUsage` property

The **`prefersReducedResourceUsage`** property indicates whether the system recommends that the app reduce its resource usage.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | The system recommends that the app reduce resource usage |
| `false` | No such recommendation |

- Read-only. Assigning to it throws `TypeError`.
- Always `false` on systems below iOS 27.
- Fires [`reducedresourceusagechange`](reducedresourceusagechange-event.md) when it changes.
- Reading `true` is **not verified in the simulator**.

## Examples

```js
if (application.prefersReducedResourceUsage) {
  console.log('Do less background work');
}
```

**Result**: prints one line when the system recommends reducing resource usage.

## Corresponding iOS API

`UIApplication.prefersReducedResourceUsage`, available from iOS 27.

## See also

- [`reducedresourceusagechange`](reducedresourceusagechange-event.md)
