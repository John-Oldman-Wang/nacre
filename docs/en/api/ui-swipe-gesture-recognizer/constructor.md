---
type: reference
native: "-[UISwipeGestureRecognizer init]"
---

# `UISwipeGestureRecognizer()` constructor

The **`UISwipeGestureRecognizer()`** constructor creates a swipe recognizer: it recognizes the gesture when a single finger moves quickly to the right.

## Syntax

```
new UISwipeGestureRecognizer()
```

### Parameters

None.

### Return value

A new `UISwipeGestureRecognizer`. [`direction`](direction.md) is `['right']`, [`numberOfTouchesRequired`](numberoftouchesrequired.md) is 1, and it isn't attached to any view.

### Exceptions

**`TypeError`**

If you subclass it with `class X extends UISwipeGestureRecognizer {}` and then call `new X()`, it throws `TypeError`. Native classes can't be subclassed; see [Native classes](../native-classes.md).

## Examples

```js
const card = new UIView();
const swipe = new UISwipeGestureRecognizer();
swipe.addEventListener('ended', () => {
  console.log('Swiped right');
});
card.addGestureRecognizer(swipe);
```

**Effect**: When a finger moves quickly to the right across `card`, it prints `Swiped right`. Moving slowly doesn't count as a swipe and prints nothing. **Not verified in the simulator.**

## Corresponding iOS API

`[[UISwipeGestureRecognizer alloc] init]`. In native code, `initWithTarget:action:` registers the callback at the same time; here you create the recognizer first and then listen with [`addEventListener()`](../ui-gesture-recognizer/addeventlistener.md).

## See also

- [`ended`](../ui-gesture-recognizer/ended-event.md): fires when the swipe is recognized
