---
type: reference
native: UIApplication.prefersReducedResourceUsage
---

# `Application`: `reducedresourceusagechange` event

The **`reducedresourceusagechange`** event fires when the system's recommendation on resource usage changes.

## Syntax

```
application.addEventListener('reducedresourceusagechange', (event) => { })
```

## Event object

`Event`, with only the basic fields. Read the new value from [`application.prefersReducedResourceUsage`](prefersreducedresourceusage.md). Not cancelable.

## When it fires

- When the system's recommendation on resource usage changes. Fires only on iOS 27 and later.
- Firing of this event is **not verified in the simulator**.

## Examples

```js
application.addEventListener('reducedresourceusagechange', () => {
  console.log('Reduce resource usage', application.prefersReducedResourceUsage);
});
```

**Effect**: prints the new value after the recommendation changes. **Not verified in the simulator.**

## Corresponding iOS API

The change notification for `prefersReducedResourceUsage`, available from iOS 27.

## See also

- [`prefersReducedResourceUsage`](prefersreducedresourceusage.md)
