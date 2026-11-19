---
type: reference
native: "-[UIActivityIndicatorView stopAnimating]"
---

# `UIActivityIndicatorView`: `stopAnimating()` method

The **`stopAnimating()`** method stops the activity indicator. When [`hidesWhenStopped`](hideswhenstopped.md) is `true`, it also hides the indicator.

## Syntax

```
stopAnimating()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

- After the call, [`isAnimating`](isanimating.md) is `false`.
- When `hidesWhenStopped` is `true`, the inherited `isHidden` becomes `true`; when it's `false`, the indicator stays on screen and stops rotating.
- Calling it while not spinning has no effect.

## Examples

```js
const spinner = new UIActivityIndicatorView();
spinner.startAnimating();
spinner.stopAnimating();
console.log(spinner.isAnimating, spinner.isHidden);
```

**Result**: Prints `false true`.

## Corresponding iOS API

`-[UIActivityIndicatorView stopAnimating]`.

## See also

- [`startAnimating()`](startanimating.md)
