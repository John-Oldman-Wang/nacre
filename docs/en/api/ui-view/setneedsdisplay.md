---
type: reference
native: "-[UIView setNeedsDisplay]"
---

# `UIView`: `setNeedsDisplay()` method

The **`setNeedsDisplay()`** method marks this view as needing to be redrawn.

## Syntax

```
setNeedsDisplay()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Examples

```js
const view = new UIView();
view.setNeedsDisplay();
```

**Effect**: The view redraws its content on the next drawing pass. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIView setNeedsDisplay]`.

## See also

- [`setNeedsDisplayInRect()`](setneedsdisplayinrect.md): redraw only part of it
