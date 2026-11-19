---
type: reference
native: Event.preventDefault
---

# `Event`: `preventDefault()` method

The **`preventDefault()`** method cancels the event's default action.

## Syntax

```
preventDefault()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

- When [`cancelable`](cancelable.md) is `true`, it sets [`defaultPrevented`](defaultprevented.md) to `true`, and the `dispatchEvent()` that dispatched it returns `false`.
- When `cancelable` is `false`, it does nothing and doesn't throw (measured).
- What the "default action" is depends on each event. For example, for `application`'s `error` event, the default action is the runtime printing an error log.

## Examples

```js
application.addEventListener('ask', (e) => e.preventDefault());
console.log(application.dispatchEvent(new Event('ask', { cancelable: true })));
console.log(application.dispatchEvent(new Event('ask')));
```

**Result**: Prints `false` and then `true`.

## See also

- [`defaultPrevented`](defaultprevented.md)
