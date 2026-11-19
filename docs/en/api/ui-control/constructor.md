---
type: reference
native: "-[UIControl init]"
---

# `UIControl()` constructor

The **`UIControl()`** constructor creates a control. A new control displays nothing; use it as a custom tappable area: give it a size and a background color, add text and icons to it, then listen to its [events](../ui-control.md#events).

## Syntax

```
new UIControl()
```

### Parameters

None.

### Return value

A new `UIControl`. Its position is `(0, 0)`, its width and height are 0 pt, and it has no background color. Give it a size and a background color to make it visible.

### Exceptions

**`TypeError`**

Subclassing it with `class MyControl extends UIControl {}` and then calling `new MyControl()` throws `TypeError`. No native class can be subclassed; see [Native classes](../native-classes.md).

## Description

A `UIControl` created directly fires [`touchupinside`](touchupinside-event.md) when tapped, not [`click`](click-event.md) (measured). To respond to taps, listen for `touchupinside`.

For text and icons added to the control, set their `isUserInteractionEnabled` to `false` so the control receives the touches. **The control receiving touches that land on its subviews is not verified in the simulator.**

## Examples

```js
const card = new UIControl();
card.backgroundColor = 'systemGreen';
card.frame = { x: 20, y: 100, width: 200, height: 52 };
card.addEventListener('touchupinside', () => {
  console.log('Tapped card');
});
```

**Effect**: Creates a green area of 200 × 52 pt. After it is added to a view controller's view, lifting a finger on it prints `Tapped card` to the console.

## Corresponding iOS API

`[[UIControl alloc] init]`.

## See also

- [Handling touches on controls](../../guides/control-touches.md): building a tappable area with `UIControl`
- [`UIButton`](../ui-button.md): a control with built-in text and a pressed effect
