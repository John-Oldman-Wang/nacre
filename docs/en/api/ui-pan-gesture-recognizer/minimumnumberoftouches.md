---
type: reference
native: UIPanGestureRecognizer.minimumNumberOfTouches
---

# `UIPanGestureRecognizer`: `minimumNumberOfTouches` property

The **`minimumNumberOfTouches`** property is the minimum number of fingers that must be down for the gesture to count as a pan.

## Value

A number, in fingers.

- Readable and writable.
- The default is `1`.

### Observing changes

No event fires when it changes. Only the app's own code changes it, so no notification is needed.

### Invalid values

- A negative number: throws `TypeError: minimumNumberOfTouches must be a non-negative integer`.
- A value that can't be converted to a number (`undefined`, `'abc'`, `NaN`): throws `TypeError: minimumNumberOfTouches must be a finite number, got "abc"`.
- The fractional part of a decimal is dropped: writing `2.9` reads back `2`. Numeric strings are used as numbers.
- On error, the property keeps its previous value.

## Examples

```js
const twoFingerDrag = new UIPanGestureRecognizer();
twoFingerDrag.minimumNumberOfTouches = 2;
twoFingerDrag.maximumNumberOfTouches = 2;
```

**Effect**: A one-finger pan fires no events from this recognizer; only a pan with two fingers together does. **Not verified in the simulator.**

## Corresponding iOS API

`UIPanGestureRecognizer.minimumNumberOfTouches`.

## See also

- [`maximumNumberOfTouches`](maximumnumberoftouches.md)
