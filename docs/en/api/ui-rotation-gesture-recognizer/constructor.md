---
type: reference
native: "-[UIRotationGestureRecognizer init]"
---

# `UIRotationGestureRecognizer()` constructor

The **`UIRotationGestureRecognizer()`** constructor creates a rotation recognizer, which recognizes two fingers turning around each other.

## Syntax

```
new UIRotationGestureRecognizer()
```

### Parameters

None.

### Return value

A new `UIRotationGestureRecognizer`. [`rotation`](rotation.md) is 0, [`velocity`](velocity.md) is 0, and it is not attached to any view.

### Exceptions

**`TypeError`**

Subclassing with `class X extends UIRotationGestureRecognizer {}` and then calling `new X()` throws `TypeError`. Native classes cannot be subclassed; see [Native classes](../native-classes.md).

## Examples

```js
const card = new UIView();
const twist = new UIRotationGestureRecognizer();
twist.addEventListener('changed', (e) => {
  const { rotation } = /** @type {UIRotationGestureRecognizerEvent} */ (e);
  console.log(rotation);
});
card.addGestureRecognizer(twist);
```

**Effect**: When two fingers turn on `card`, the console prints the angle turned, in radians. **Not verified in the simulator.**

## Corresponding iOS API

`[[UIRotationGestureRecognizer alloc] init]`. Natively, `initWithTarget:action:` registers the callback at the same time; here you create it first and then listen with [`addEventListener()`](../ui-gesture-recognizer/addeventlistener.md).

## See also

- [Responding to gestures](../../guides/gestures.md#rotating-with-two-fingers)
