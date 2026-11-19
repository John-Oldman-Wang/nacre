---
type: reference
native: "-[UIView addGestureRecognizer:]"
---

# `UIView`: `addGestureRecognizer()` method

The **`addGestureRecognizer()`** method adds a gesture recognizer to the view, so that a plain view can respond to gestures such as taps, long presses, and drags.

## Syntax

```
addGestureRecognizer(recognizer)
```

### Parameters

**`recognizer`**

A [`UIGestureRecognizer`](../ui-gesture-recognizer.md).

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

The argument isn't a recognizer: `addGestureRecognizer needs a UIGestureRecognizer`.

## Description

- Once added, the recognizer is kept alive by the view; you don't need to hold it separately.
- A recognizer can be attached to only one view at a time. If it was on another view, it is first removed from that view.
- `UIView` itself doesn't fire tap events. If what you want is a button, use [`UIButton`](../ui-button.md) directly.

## Examples

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
tap.addEventListener('ended', () => {
  console.log('Tapped');
});
card.addGestureRecognizer(tap);
```

**Effect**: Once `card` is on screen, tapping it prints `Tapped` to the console.

## Corresponding iOS API

`-[UIView addGestureRecognizer:]`.

## See also

- [`removeGestureRecognizer()`](removegesturerecognizer.md)
- [Gesture recognizers](../ui-gesture-recognizer.md)
