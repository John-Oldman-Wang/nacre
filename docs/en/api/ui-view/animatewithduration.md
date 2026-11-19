---
type: reference
native: "+[UIView animateWithDuration:delay:usingSpringWithDamping:initialSpringVelocity:options:animations:completion:]"
---

# `UIView.animateWithDuration()` static method

The **`UIView.animateWithDuration()`** static method changes view properties with animation: put the code that changes properties in the `animations` function, and the changes take effect gradually over `duration` seconds.

## Syntax

```
UIView.animateWithDuration(duration, { animations[, delay][, options][, usingSpringWithDamping, initialSpringVelocity] })
```

### Parameters

**`duration`**

Length of the animation, in seconds. `0` means no animation; the changes take effect immediately.

**`options.animations`**

A function, required. Change view properties inside it. It takes no arguments, and its return value is ignored.

Animatable properties are `alpha`, `frame`, `bounds`, `center`, `transform`, and `backgroundColor`. After changing constraints, call [`layoutIfNeeded()`](layoutifneeded.md) in here and the constraint changes are animated too.

**`options.delay`**

How long to wait before starting, in seconds. Optional; defaults to 0.

**`options.options`**

The timing curve and other options, an array of strings. Optional; defaults to `['curveEaseInOut']`.

| Value | Effect |
| --- | --- |
| `'curveEaseInOut'` | Slow at the start and end, fast in the middle. Default |
| `'curveEaseIn'` | Slow at the start, then speeds up |
| `'curveEaseOut'` | Fast at the start, slows down at the end |
| `'curveLinear'` | Constant speed throughout |
| `'allowUserInteraction'` | The view responds to touches normally during the animation. Without it, an animating view doesn't respond to touches |
| `'beginFromCurrentState'` | If the view is in the middle of another animation, starts from how it looks on screen right now |
| `'repeat'` | Repeats forever. The returned Promise never fulfills |
| `'autoreverse'` | Plays backward after reaching the end. Use together with `'repeat'` |
| `'layoutSubviews'` | Lays out subviews again during the animation |
| `'allowAnimatedContent'` | Redraws content on every frame during the animation |
| `'overrideInheritedDuration'` | When nested inside another animation, uses its own duration rather than the outer one's |
| `'overrideInheritedCurve'` | When nested inside another animation, uses its own timing curve |
| `'overrideInheritedOptions'` | When nested inside another animation, inherits none of the outer options |

Pick one of the four `curve…` values; the others can be combined. How each value looks on screen is **not verified in the simulator**; the meanings come from Apple's documentation.

**`options.usingSpringWithDamping`**

Spring damping, a ratio from 0 to 1: 1 means no bounce, and smaller values bounce more. Passing it makes this a spring animation, and it must be passed together with `initialSpringVelocity`.

**`options.initialSpringVelocity`**

Initial spring velocity, in "multiples of the full distance per second". Usually 0. Must be passed together with `usingSpringWithDamping`.

### Return value

A `Promise<boolean>` that fulfills when the animation ends:

- `true`: the animation finished. It also fulfills when `duration` is 0, with `true` (measured).
- `false`: the animation was interrupted partway. Measured: starting another animation on the same property fulfills the previous one with `false`.
- With `'repeat'`, it never fulfills.

### Exceptions

**`TypeError`**

| Situation | Error |
| --- | --- |
| `options` not given, or `animations` isn't a function | `UIView.animateWithDuration: animations must be a function` |
| `duration` doesn't convert to a finite number | `duration must be a finite number, got "abc"` |
| `duration` is negative | `duration must be a non-negative number` |
| `options.options` isn't an array | `options must be an array of option names` |
| `options.options` contains an unrecognized name | `options has no value "bounce"; expected one of: …` |
| Only one of the two spring parameters is given | `usingSpringWithDamping and initialSpringVelocity must be given together` |

On error, `animations` isn't run and the animation doesn't start.

An exception thrown inside `animations` propagates unchanged to the caller and can be caught with `try` / `catch`. In that case no Promise is returned, and the changes already made take effect as usual.

## Description

`animations` runs at a different time from other callbacks:

- **It runs right there during this call, exactly once.** By the time the call returns it has finished, and properties written in it read back immediately (measured: when the call returns, `alpha` already reads as the new value). The change on screen happens over the following `duration` seconds.
- It can call any API.
- It can call `animateWithDuration()` and [`performWithoutAnimation()`](performwithoutanimation.md) again. Measured: when nested, the order is outer start → inner → outer end → call returns.

## Examples

```js
const card = new UIView();
card.frame = new CGRect(40, 120, 200, 120);
card.backgroundColor = 'systemIndigo';

async function dismissCard() {
  const finished = await UIView.animateWithDuration(0.3, {
    animations() { card.alpha = 0; },
  });
  if (finished) card.removeFromSuperview();
}
dismissCard();
```

**Effect**: The card fades out over 0.3 seconds, and after the fade ends it is removed from the view hierarchy.

```js
const dot = new UIView();
UIView.animateWithDuration(0.5, {
  usingSpringWithDamping: 0.6,
  initialSpringVelocity: 0,
  animations() { dot.transform = CGAffineTransform.scale(1.5); },
});
```

**Effect**: The square grows to 1.5×, overshoots a little and comes back, and settles after a few oscillations. **How it looks on screen is not verified in the simulator.**

## Corresponding iOS API

The four ObjC `animateWithDuration:…` methods are a single method in JS, and the `completion:` parameter is replaced by the returned Promise.

| ObjC | JS |
| --- | --- |
| `[UIView animateWithDuration:0.3 animations:^{ view.alpha = 0; }]` | `UIView.animateWithDuration(0.3, { animations() { view.alpha = 0; } })` |
| `[UIView animateWithDuration:0.3 animations:^{ … } completion:^(BOOL finished) { … }]` | `const finished = await UIView.animateWithDuration(0.3, { animations() { … } })` |
| `[UIView animateWithDuration:0.3 delay:0.1 options:UIViewAnimationOptionCurveEaseOut animations:^{ … } completion:nil]` | `UIView.animateWithDuration(0.3, { delay: 0.1, options: ['curveEaseOut'], animations() { … } })` |
| `[UIView animateWithDuration:0.5 delay:0 usingSpringWithDamping:0.6 initialSpringVelocity:0 options:0 animations:^{ … } completion:nil]` | `UIView.animateWithDuration(0.5, { usingSpringWithDamping: 0.6, initialSpringVelocity: 0, animations() { … } })` |

## See also

- [Animating views](../../guides/view-animations.md)
- [`performWithoutAnimation()`](performwithoutanimation.md)
- [Core Animation](../ca-animation.md): animate layers directly, with keyframes, motion along a path, and animation groups
