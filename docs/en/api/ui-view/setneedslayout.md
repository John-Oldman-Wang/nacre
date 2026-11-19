---
type: reference
native: "-[UIView setNeedsLayout]"
---

# `UIView`: `setNeedsLayout()` method

The **`setNeedsLayout()`** method marks this view as needing layout. Layout happens later, not immediately.

## Syntax

```
setNeedsLayout()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

The system doesn't lay out again immediately after every property change. It sets a flag and handles all of them together later. In everyday code you only need [`layoutIfNeeded()`](layoutifneeded.md).

## Examples

```js
const stack = new UIStackView([new UIView()]);
stack.frame = new CGRect(0, 0, 200, 100);
stack.layoutIfNeeded();
stack.isLayoutMarginsRelativeArrangement = true;
stack.setNeedsLayout();
stack.layoutIfNeeded();
```

**Effect**: The arranged subviews are inset by the layout margins. When the container isn't in a window and has already been laid out once, after toggling the margins switch you must call `setNeedsLayout()` and then `layoutIfNeeded()` for the arranged subviews' positions to update (verified by testing).

## Corresponding iOS API

`-[UIView setNeedsLayout]`.

## See also

- [`layoutIfNeeded()`](layoutifneeded.md)
