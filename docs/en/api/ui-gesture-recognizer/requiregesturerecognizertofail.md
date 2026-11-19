---
type: reference
native: "-[UIGestureRecognizer requireGestureRecognizerToFail:]"
---

# `UIGestureRecognizer`: `requireGestureRecognizerToFail()` method

The **`requireGestureRecognizerToFail()`** method makes this recognizer wait until another recognizer is certain it will not recognize its gesture before recognizing. If the other recognizer does recognize its gesture, this recognizer does not. The typical use is making a single tap wait for a double tap to fail.

## Syntax

```
requireGestureRecognizerToFail(otherGestureRecognizer)
```

### Parameters

**`otherGestureRecognizer`**

Another recognizer, of any kind.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

The argument is not a recognizer (including `null`): `requireGestureRecognizerToFail needs a UIGestureRecognizer`

## Description

- The relationship cannot be undone once set up.
- The relationship does not keep the recognizers alive. After `a.requireGestureRecognizerToFail(b)`, `a` and `b` are each still kept by the view they are attached to, and both must be attached to views for it to work. If one of them is not attached to a view and the app's code does not hold on to it either, it is garbage-collected and the relationship stops working.
- Waiting makes this recognizer recognize a bit later: the system first has to be certain the other recognizer will not recognize.

## Examples

```js
const card = new UIView();

const doubleTap = new UITapGestureRecognizer();
doubleTap.numberOfTapsRequired = 2;
doubleTap.addEventListener('ended', () => {
  console.log('Double tap');
});
card.addGestureRecognizer(doubleTap);

const singleTap = new UITapGestureRecognizer();
singleTap.addEventListener('ended', () => {
  console.log('Single tap');
});
singleTap.requireGestureRecognizerToFail(doubleTap);
card.addGestureRecognizer(singleTap);
```

**Effect**: Tapping `card` twice quickly prints only `Double tap`. Tapping once prints `Single tap`; this line appears later than it would without the relationship, because the system first waits a short time to be sure there is no second tap. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIGestureRecognizer requireGestureRecognizerToFail:]`.

## See also

- [Responding to gestures](../../guides/gestures.md#making-the-single-tap-wait-for-the-double-tap-to-fail)
- [Ownership](../ui-gesture-recognizer.md#ownership)
