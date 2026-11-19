---
type: reference
native: "-[UITapGestureRecognizer init]"
---

# `UITapGestureRecognizer()` constructor

The **`UITapGestureRecognizer()`** constructor creates a tap recognizer that recognizes a single tap with one finger.

## Syntax

```
new UITapGestureRecognizer()
```

### Parameters

None.

### Return value

The new `UITapGestureRecognizer`. [`numberOfTapsRequired`](numberoftapsrequired.md) is 1, [`numberOfTouchesRequired`](numberoftouchesrequired.md) is 1, and it is not added to any view.

### Exceptions

**`TypeError`**

After subclassing with `class X extends UITapGestureRecognizer {}`, `new X()` throws `TypeError`. No native class can be subclassed; see [Native classes](../native-classes.md).

## Examples

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
tap.addEventListener('ended', () => {
  console.log('Tapped');
});
card.addGestureRecognizer(tap);
```

**Effect**: Tapping `card` once prints `Tapped` to the console.

## Corresponding iOS API

`[[UITapGestureRecognizer alloc] init]`. Native code registers the callback at the same time with `initWithTarget:action:`; here you create it first and then listen with [`addEventListener()`](../ui-gesture-recognizer/addeventlistener.md).

## See also

- [`ended`](../ui-gesture-recognizer/ended-event.md): fires when the tap is recognized
