---
type: reference
native: "-[UIGestureRecognizer removeTarget:action:]"
---

# `UIGestureRecognizer`: `removeEventListener()` method

The **`removeEventListener()`** method removes a callback registered with [`addEventListener()`](addeventlistener.md).

## Syntax

```
removeEventListener(type, callback)
```

### Parameters

**`type`**

The event name used when registering.

**`callback`**

The function used when registering. It must be the same function object.

### Return value

None (`undefined`).

### Exceptions

None. For an event name and function that were never registered, it does nothing.

## Description

It removes only one listener; the recognizer stays on the view and keeps recognizing gestures. To take the recognizer off the view, use the view's `removeGestureRecognizer()`; see [`UIView`](../ui-view.md).

## Examples

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
/** @param {Event} e */
function onTap(e) {
  console.log('Tapped');
}
tap.addEventListener('ended', onTap);
card.addGestureRecognizer(tap);

tap.removeEventListener('ended', onTap);
card.removeGestureRecognizer(tap);
console.log(tap.view);
```

**Result**: The console prints `null`. The recognizer is no longer on any view, and tapping `card` no longer triggers it. The recognizer object still works and can be attached to another view.

## Corresponding iOS API

`-[UIGestureRecognizer removeTarget:action:]`.

## See also

- [`addEventListener()`](addeventlistener.md)
