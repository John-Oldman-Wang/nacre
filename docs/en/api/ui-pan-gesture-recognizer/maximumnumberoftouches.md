---
type: reference
native: UIPanGestureRecognizer.maximumNumberOfTouches
---

# `UIPanGestureRecognizer`: `maximumNumberOfTouches` property

The **`maximumNumberOfTouches`** property is the maximum number of fingers that can be down.

## Value

A number, in fingers.

- Readable and writable.
- The default is `4294967295`, which means no limit. For [`UIScreenEdgePanGestureRecognizer`](../ui-screen-edge-pan-gesture-recognizer.md), the default is `1`.

### Observing changes

No event fires when it changes. Only the app's own code changes it, so no notification is needed.

### Invalid values

- A negative number: throws `TypeError: maximumNumberOfTouches must be a non-negative integer`.
- A value that can't be converted to a number (`undefined`, `'abc'`, `NaN`): throws `TypeError: maximumNumberOfTouches must be a finite number, got "abc"`.
- The fractional part of a decimal is dropped: writing `2.9` reads back `2`. Numeric strings are used as numbers.
- On error, the property keeps its previous value.

## Examples

```js
const drag = new UIPanGestureRecognizer();
drag.maximumNumberOfTouches = 1;
console.log(drag.maximumNumberOfTouches);
```

**Effect**: Prints `1`. Once the recognizer is added to a view, a two-finger pan fires no events. **Not verified in the simulator.**

## Corresponding iOS API

`UIPanGestureRecognizer.maximumNumberOfTouches`.

## See also

- [`minimumNumberOfTouches`](minimumnumberoftouches.md)
