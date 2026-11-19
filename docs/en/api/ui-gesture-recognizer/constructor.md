---
type: reference
native: "-[UIGestureRecognizer init]"
---

# `UIGestureRecognizer()` constructor

The **`UIGestureRecognizer()`** constructor cannot be called directly. `UIGestureRecognizer` is the parent class of all recognizers and recognizes no gesture by itself; to create a recognizer, use one of its seven subclasses.

## Syntax

```
new UIGestureRecognizer()
```

### Parameters

None.

### Return value

Does not return; always throws.

### Exceptions

**`TypeError`**

Thrown when called directly:

```
Illegal constructor: UIGestureRecognizer is abstract; construct one of its subclasses instead: UITapGestureRecognizer, UILongPressGestureRecognizer, UIPanGestureRecognizer, UIPinchGestureRecognizer, UIRotationGestureRecognizer, UISwipeGestureRecognizer, UIScreenEdgePanGestureRecognizer
```

## Examples

```js
try {
  new UIGestureRecognizer();
} catch (err) {
  console.log(err instanceof TypeError);
}
const tap = new UITapGestureRecognizer();
```

**Result**: Prints `true`. `tap` is a working tap recognizer.

## Corresponding iOS API

`-[UIGestureRecognizer initWithTarget:action:]`. Natively the base class can be created directly, but it recognizes no gesture, so it is not offered here.

## See also

- [`UITapGestureRecognizer()`](../ui-tap-gesture-recognizer/constructor.md), [`UILongPressGestureRecognizer()`](../ui-long-press-gesture-recognizer/constructor.md), [`UIPanGestureRecognizer()`](../ui-pan-gesture-recognizer/constructor.md), [`UIPinchGestureRecognizer()`](../ui-pinch-gesture-recognizer/constructor.md), [`UIRotationGestureRecognizer()`](../ui-rotation-gesture-recognizer/constructor.md), [`UISwipeGestureRecognizer()`](../ui-swipe-gesture-recognizer/constructor.md), [`UIScreenEdgePanGestureRecognizer()`](../ui-screen-edge-pan-gesture-recognizer/constructor.md)
