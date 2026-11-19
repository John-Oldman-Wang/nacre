---
type: reference
native: "-[UIView setNeedsDisplayInRect:]"
---

# `UIView`: `setNeedsDisplayInRect()` method

The **`setNeedsDisplayInRect()`** method marks a rectangle within the view as needing to be redrawn.

## Syntax

```
setNeedsDisplayInRect(rect)
```

### Parameters

**`rect`**

A [`CGRect`](../cg-rect.md) or `{ x, y, width, height }`, in the view's own coordinate system, in [pt](../units.md).

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

`rect` isn't an object or is missing fields: same rules as for [structs](../structs.md#plain-objects-can-be-given-when-writing); the message starts with `setNeedsDisplayInRect`.

## Description

The effect is **not verified in the simulator**.

## Examples

```js
const view = new UIView();
view.setNeedsDisplayInRect(new CGRect(0, 0, 50, 50));
```

**Effect**: No visible change. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIView setNeedsDisplayInRect:]`.

## See also

- [`setNeedsDisplay()`](setneedsdisplay.md)
