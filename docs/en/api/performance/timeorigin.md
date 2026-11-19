---
type: reference
---

# `Performance`: `timeOrigin` property

The **`timeOrigin`** property is the moment corresponding to zero for [`now()`](now.md).

## Value

A number: a Unix timestamp (counted from 00:00 UTC on January 1, 1970), in milliseconds.

- Read-only; assigning to it throws `TypeError`.
- The value is recorded from the system time at the moment the runtime starts. It doesn't follow later changes to the system time.
- It doesn't change while running, so there's no change notification.

## Examples

```js
const date = new Date(performance.timeOrigin + performance.now());
console.log(date.toISOString());
```

**Result**: Prints the current moment, like `2026-11-12T01:23:45.678Z`. It differs from `new Date()` by less than 50 ms (measured).

If you just want the current date, use `new Date()` directly. This conversion is for when you already have a batch of `now()` readings and later need to know what time each one corresponds to.

## Differences from the web

Same as on the web. What zero means is different; see [`now()`](now.md#differences-from-the-web).

## See also

- [`now()`](now.md)
