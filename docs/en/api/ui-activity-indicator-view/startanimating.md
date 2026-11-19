---
type: reference
native: "-[UIActivityIndicatorView startAnimating]"
---

# `UIActivityIndicatorView`: `startAnimating()` method

The **`startAnimating()`** method starts the activity indicator spinning. When [`hidesWhenStopped`](hideswhenstopped.md) is `true`, it also shows the indicator.

## Syntax

```
startAnimating()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

- After the call, [`isAnimating`](isanimating.md) is `true`.
- When `hidesWhenStopped` is `true`, the inherited `isHidden` becomes `false`.
- Calling it while already spinning has no effect.
- The indicator must also be added to a page and have a position before it's visible.

## Examples

```js
const spinner = new UIActivityIndicatorView();
console.log(spinner.isHidden);
spinner.startAnimating();
console.log(spinner.isAnimating, spinner.isHidden);
```

**Result**: First prints `true`; after starting it prints `true false`. What the rotating indicator looks like on screen is **not verified in the simulator**.

## Corresponding iOS API

`-[UIActivityIndicatorView startAnimating]`.

## See also

- [`stopAnimating()`](stopanimating.md)
- [Showing loading and progress](../../guides/loading-and-progress.md): stopping in `finally`
