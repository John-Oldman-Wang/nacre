---
type: reference
native: "-[UIPanGestureRecognizer translationInView:]"
---

# `UIPanGestureRecognizer`: `translationInView()` method

The **`translationInView()`** method returns how far the finger has moved since the gesture began, converted to the coordinate system of a given view.

## Syntax

```
translationInView(view)
```

### Parameters

**`view`**

A [`UIView`](../ui-view.md) or `null`. The translation is converted to this view's coordinate system. `null` means the window's coordinate system.

### Return value

A [`CGPoint`](../structs.md), in [points (pt)](../units.md). Positive `x` is to the right and positive `y` is downward. It's `(0, 0)` when no gesture is in progress.

### Exceptions

**`TypeError`**

`view` is neither a view nor `null`: `translationInView needs a UIView or null`

## Description

Called in an event callback, it returns the value at the moment the callback runs, not at the moment the event occurred. The translation at the moment the event occurred is in the event object's `translation`, in the coordinate system of the view the recognizer is attached to; see [`changed`](../ui-gesture-recognizer/changed-event.md).

Call it only when you need a different coordinate system. For example, if the dragged view has a scale or rotation `transform`, the translation in the event differs from the translation in the superview's coordinate system; in that case, call `translationInView(superview)`.

## Examples

```js
const page = new UIView();
const card = new UIView();
page.addSubview(card);
const drag = new UIPanGestureRecognizer();
drag.addEventListener('changed', () => {
  const moved = drag.translationInView(page);
  console.log(moved.x, moved.y);
});
card.addGestureRecognizer(drag);
```

**Effect**: While you drag `card`, the console prints the accumulated translation in `page`'s coordinate system. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIPanGestureRecognizer translationInView:]`.

## See also

- [`setTranslation()`](settranslation.md): reset the translation to zero or set it to another value
- [`velocityInView()`](velocityinview.md)
