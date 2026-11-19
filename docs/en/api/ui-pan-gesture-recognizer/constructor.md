---
type: reference
native: "-[UIPanGestureRecognizer init]"
---

# `UIPanGestureRecognizer()` constructor

The **`UIPanGestureRecognizer()`** constructor creates a pan recognizer: it recognizes the gesture once a finger touches down and moves a short distance.

## Syntax

```
new UIPanGestureRecognizer()
```

### Parameters

None.

### Return value

A new `UIPanGestureRecognizer`. [`minimumNumberOfTouches`](minimumnumberoftouches.md) is 1, [`maximumNumberOfTouches`](maximumnumberoftouches.md) is 4294967295, and it isn't attached to any view.

### Exceptions

**`TypeError`**

If you subclass it with `class X extends UIPanGestureRecognizer {}` and then call `new X()`, it throws `TypeError`. Native classes can't be subclassed; see [Native classes](../native-classes.md).

## Examples

```js
const card = new UIView();
const drag = new UIPanGestureRecognizer();
drag.addEventListener('changed', (e) => {
  const { translation } = /** @type {UIPanGestureRecognizerEvent} */ (e);
  console.log(translation.x, translation.y);
});
card.addGestureRecognizer(drag);
```

**Effect**: When you press on `card` and move your finger, the console keeps printing the translation accumulated since the gesture began. **Not verified in the simulator.**

## Corresponding iOS API

`[[UIPanGestureRecognizer alloc] init]`. In native code, `initWithTarget:action:` registers the callback at the same time; here you create the recognizer first and then listen with [`addEventListener()`](../ui-gesture-recognizer/addeventlistener.md).

## See also

- [`changed`](../ui-gesture-recognizer/changed-event.md)
- [Responding to gestures](../../guides/gestures.md#dragging-a-view)
