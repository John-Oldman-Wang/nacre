---
type: reference
native: NSRunLoop.mainRunLoop
---

# `NSRunLoop.mainRunLoop` static property

The **`NSRunLoop.mainRunLoop`** static property is the event loop of the app's main thread.

## Value

An `NSRunLoop`.

- Read-only; assigning to it throws `TypeError`.
- Every read returns the same object.

## Examples

```js
console.log(NSRunLoop.mainRunLoop === NSRunLoop.mainRunLoop);

const link = new CADisplayLink();
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**Result**: The console prints `true`. `link` starts working.

## Corresponding iOS API

`NSRunLoop.mainRunLoop`.

## See also

- [`CADisplayLink.addToRunLoop()`](../ca-display-link/addtorunloop.md)
