---
type: reference
native: "-[UIView layoutIfNeeded]"
---

# `UIView`: `layoutIfNeeded()` method

The **`layoutIfNeeded()`** method immediately performs any pending layout for this view and its descendants.

## Syntax

```
layoutIfNeeded()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

- Constraints don't take effect immediately. The system computes them once, after the current JS finishes running and before the next screen refresh. Call this method before reading `frame` right after activating constraints or changing `constant`.
- Call it on a **common ancestor**. Calling it on the view controller's root view `page.view` is recommended, so that the `frame` of every view in the view controller is up to date.
- Code that only sets up the interface and doesn't read `frame` afterward doesn't need it.
- Calling it inside the `animations` of [`UIView.animateWithDuration()`](animatewithduration.md) applies constraint changes with animation.

## Examples

```js
const page = new UIView();
const banner = new UIView();
banner.translatesAutoresizingMaskIntoConstraints = false;
page.addSubview(banner);
NSLayoutConstraint.activateConstraints([
  banner.widthAnchor.constraintEqualToConstant(200),
  banner.heightAnchor.constraintEqualToConstant(60),
]);

page.layoutIfNeeded();
console.log(banner.frame.width, banner.frame.height);
```

**Result**: Logs `200 60`. Reading `frame` without calling `layoutIfNeeded()` returns the result of the previous layout pass.

## Corresponding iOS API

`-[UIView layoutIfNeeded]`.

## See also

- [`setNeedsLayout()`](setneedslayout.md)
- [When constraints are resolved](../auto-layout.md#when-constraints-are-resolved)
- [Animating constraint changes](../../guides/view-animations.md#animating-constraint-changes)
