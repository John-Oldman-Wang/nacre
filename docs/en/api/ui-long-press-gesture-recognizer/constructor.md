---
type: reference
native: "-[UILongPressGestureRecognizer init]"
---

# `UILongPressGestureRecognizer()` constructor

The **`UILongPressGestureRecognizer()`** constructor creates a long-press recognizer: it recognizes the gesture when a single finger is held down for 0.5 seconds.

## Syntax

```
new UILongPressGestureRecognizer()
```

### Parameters

None.

### Return value

A new `UILongPressGestureRecognizer`. [`minimumPressDuration`](minimumpressduration.md) is 0.5 seconds, [`allowableMovement`](allowablemovement.md) is 10 pt, and it isn't attached to any view.

### Exceptions

**`TypeError`**

If you subclass it with `class X extends UILongPressGestureRecognizer {}` and then call `new X()`, it throws `TypeError`. Native classes can't be subclassed; see [Native classes](../native-classes.md).

## Examples

```js
const card = new UIView();
const press = new UILongPressGestureRecognizer();
press.addEventListener('began', () => {
  console.log('Pressed');
});
card.addGestureRecognizer(press);
```

**Effect**: Hold `card` for 0.5 seconds and the console prints `Pressed`.

## Corresponding iOS API

`[[UILongPressGestureRecognizer alloc] init]`. In native code, `initWithTarget:action:` registers the callback at the same time; here you create the recognizer first and then listen with [`addEventListener()`](../ui-gesture-recognizer/addeventlistener.md).

## See also

- [`began`](../ui-gesture-recognizer/began-event.md): fires when the long press is recognized
