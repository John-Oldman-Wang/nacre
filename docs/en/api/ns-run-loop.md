---
type: reference
native: NSRunLoop
status: partial
---

# `NSRunLoop`

**`NSRunLoop`** represents a thread's event loop. JS runs on the main thread, so the only one you can get is the main thread's, [`NSRunLoop.mainRunLoop`](ns-run-loop/mainrunloop.md).

Its only use is as the argument to [`CADisplayLink.addToRunLoop()`](ca-display-link/addtorunloop.md): a `CADisplayLink` starts working only after it is added to the run loop.

**Inheritance**: `EventTarget` → `NSObject` → `NSRunLoop`

## Constructor

Can't be created with `new`. Use `NSRunLoop.mainRunLoop`.

## Static properties

[`NSRunLoop.mainRunLoop`](ns-run-loop/mainrunloop.md) <small>read-only</small>

The main thread's event loop.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `NSRunLoop.mainRunLoop` | `NSRunLoop.mainRunLoop` |
| `NSRunLoop.currentRunLoop` | `NSRunLoop.mainRunLoop`. JS is on the main thread, so the two are the same |

## See also

- [`CADisplayLink`](ca-display-link.md)
