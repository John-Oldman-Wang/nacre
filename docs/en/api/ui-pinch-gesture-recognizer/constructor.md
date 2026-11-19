---
type: reference
native: "-[UIPinchGestureRecognizer init]"
---

# `UIPinchGestureRecognizer()` constructor

The **`UIPinchGestureRecognizer()`** constructor creates a pinch gesture recognizer, which recognizes two fingers spreading apart or pinching together.

## Syntax

```
new UIPinchGestureRecognizer()
```

### Parameters

None.

### Return value

A new `UIPinchGestureRecognizer`. [`scale`](scale.md) is 1, [`velocity`](velocity.md) is 0, and it is not attached to any view.

### Exceptions

**`TypeError`**

Subclassing with `class X extends UIPinchGestureRecognizer {}` and then calling `new X()` throws `TypeError`. No native class can be subclassed; see [Native classes](../native-classes.md).

## Examples

```js
const card = new UIView();
const pinch = new UIPinchGestureRecognizer();
pinch.addEventListener('changed', (e) => {
  const { scale } = /** @type {UIPinchGestureRecognizerEvent} */ (e);
  console.log(scale);
});
card.addGestureRecognizer(pinch);
```

**Effect**: spreading two fingers on `card` logs numbers greater than 1; pinching logs numbers less than 1. **Not verified in the simulator.**

## Corresponding iOS API

`[[UIPinchGestureRecognizer alloc] init]`. Natively, `initWithTarget:action:` registers the callback at the same time; here you create the recognizer first, then listen with [`addEventListener()`](../ui-gesture-recognizer/addeventlistener.md).

## See also

- [Responding to gestures](../../guides/gestures.md#pinching-to-zoom)
