---
type: reference
native: "-[UIPanGestureRecognizer velocityInView:]"
---

# `UIPanGestureRecognizer`: `velocityInView()` method

The **`velocityInView()`** method returns the finger's current velocity, converted to the coordinate system of a given view.

## Syntax

```
velocityInView(view)
```

### Parameters

**`view`**

A [`UIView`](../ui-view.md) or `null`. `null` means the window's coordinate system.

### Return value

A [`CGPoint`](../structs.md) with a horizontal and a vertical component, in points per second. It's `(0, 0)` when no gesture is in progress.

### Exceptions

**`TypeError`**

`view` is neither a view nor `null`.

## Description

Calling it in the `ended` callback doesn't give you the velocity at the moment of release: by the time the callback runs, the gesture has already ended. Read the release velocity from the `velocity` of the [`ended`](../ui-gesture-recognizer/ended-event.md) event object.

## Examples

```js
const card = new UIView();
const drag = new UIPanGestureRecognizer();
drag.addEventListener('changed', () => {
  const speed = drag.velocityInView(null);
  console.log(speed.x, speed.y);
});
card.addGestureRecognizer(drag);
```

**Effect**: While you drag `card`, the console prints the finger's velocity in the window's coordinate system. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIPanGestureRecognizer velocityInView:]`.

## See also

- [`translationInView()`](translationinview.md)
- [`ended`](../ui-gesture-recognizer/ended-event.md): `velocity` on the event object
