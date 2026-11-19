---
type: reference
native: "+[CADisplayLink displayLinkWithTarget:selector:]"
---

# `CADisplayLink()` constructor

The **`CADisplayLink()`** constructor creates a timer synchronized with screen refreshes. It doesn't start on its own after creation.

## Syntax

```
new CADisplayLink()
```

### Parameters

None.

### Return value

A new `CADisplayLink`. It starts firing only after you both listen for [`tick`](tick-event.md) and call [`addToRunLoop()`](addtorunloop.md). Before it starts, [`timestamp`](timestamp.md) and [`duration`](duration.md) are 0.

## Examples

```js
const link = new CADisplayLink();
console.log(link.isPaused, link.timestamp);
```

**Result**: logs `false 0` to the console.

## Corresponding iOS API

`+[CADisplayLink displayLinkWithTarget:selector:]`. There is no target or selector; add the callback with `addEventListener('tick', …)`.

## See also

- [`addToRunLoop()`](addtorunloop.md)
