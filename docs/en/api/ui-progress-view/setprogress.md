---
type: reference
native: "-[UIProgressView setProgress:animated:]"
---

# `UIProgressView`: `setProgress()` method

The **`setProgress()`** method changes the progress bar's progress, optionally with animation.

## Syntax

```
setProgress(progress[, { animated }])
```

### Parameters

**`progress`**

The fraction complete, a number from 0 to 1. Converted with `Number()`. Below 0 is treated as 0, above 1 as 1.

**`options.animated`**

A boolean, optional. When `true`, the filled portion slides to the new position; when omitted, `false`, or `undefined`, it jumps straight there. Passing `null` for the whole options is treated as not passing it. How the animation looks on screen and how long it lasts are **not verified in the simulator**.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

`progress` can't be converted to a finite number (omitted, `NaN`, `Infinity`, `'half'`): `progress must be a finite number, got undefined`. The progress is unchanged.

## Description

With animation, the [`progress`](progress.md) property already has the new value when the call returns, not a value partway through the slide. There is no "animation finished" notification.

Animate when progress moves forward, not when it goes back to 0. If going from 1 back to 0 is animated, the user sees the progress bar run backward.

## Examples

```js
const bar = new UIProgressView();
bar.setProgress(0.8, { animated: true });
console.log(bar.progress);
```

**Result**: The filled portion slides to 80% of the bar. The console prints `0.800000011920929`: `progress` has the new value immediately.

## Corresponding iOS API

`-[UIProgressView setProgress:animated:]`. `animated:` is written as the `animated` option and can be omitted.

## See also

- [`progress`](progress.md): changing the progress without animation
