---
type: reference
native: "-[UIActivityIndicatorView init]"
---

# `UIActivityIndicatorView()` constructor

The **`UIActivityIndicatorView()`** constructor creates an activity indicator. A new indicator is hidden, not spinning, and its `frame` is 0 × 0.

## Syntax

```
new UIActivityIndicatorView()
```

### Parameters

None.

### Return value

A new `UIActivityIndicatorView`:

- [`activityIndicatorViewStyle`](activityindicatorviewstyle.md) is `'medium'`.
- [`isAnimating`](isanimating.md) is `false` and [`hidesWhenStopped`](hideswhenstopped.md) is `true`, so `isHidden` is `true`.
- [`color`](color.md) is `'secondaryLabel'`.
- `frame` has width 0 and height 0. The size it wants (`intrinsicContentSize`) is 20 × 20 [pt](../units.md).

When positioning with Auto Layout, you only need to constrain its position; it takes its wanted size automatically. When positioning with `frame`, call `sizeToFit()` once.

### Exceptions

**`TypeError`**

Subclassing this class and calling `new`: `class X extends UIActivityIndicatorView {}` throws at `new X()`. See [Native classes](../native-classes.md).

## Examples

```js
const spinner = new UIActivityIndicatorView();
console.log(spinner.isHidden, spinner.frame.width);
spinner.sizeToFit();
console.log(spinner.frame.width, spinner.frame.height);
```

**Result**: First prints `true 0`; after `sizeToFit()` it prints `20 20`.

## Corresponding iOS API

`-[UIActivityIndicatorView init]`. `initWithActivityIndicatorStyle:` has no corresponding constructor parameter; write `activityIndicatorViewStyle` after creating it.

## See also

- [`startAnimating()`](startanimating.md): starts spinning and shows the indicator
