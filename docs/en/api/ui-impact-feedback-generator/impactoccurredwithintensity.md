---
type: reference
native: "-[UIImpactFeedbackGenerator impactOccurredWithIntensity:]"
---

# `UIImpactFeedbackGenerator`: `impactOccurredWithIntensity()` method

The **`impactOccurredWithIntensity()`** method vibrates once, with the feel of the style given at creation and an intensity that is a fraction of full intensity.

## Syntax

```
impactOccurredWithIntensity(intensity)
```

### Parameters

**`intensity`**

A fraction between 0 and 1, where 1 is the full intensity of this style. Both 0 and 1 are allowed. Any value convertible to a number is accepted, such as `'0.5'`. Out-of-range values are not clamped automatically; clamp computed values yourself first.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- Outside 0 to 1: `intensity must be a number between 0 and 1`.
- Not convertible to a number: `intensity must be a finite number, got "max"`.

## Examples

```js
const page = new UIViewController();
const pull = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('heavy', { forView: page.view });

const distance = 400; // drag distance, in pt
pull.impactOccurredWithIntensity(Math.min(1, Math.max(0, distance / 200)));
```

**Effect**: one vibration with the `heavy` feel. 400 pt computes to 2, which is clamped to 1, so it is at full intensity. **The vibration is not verified in the simulator.**

## Corresponding iOS API

`-[UIImpactFeedbackGenerator impactOccurredWithIntensity:]`.

## See also

- [Vibration that follows the drag distance](../../guides/haptics.md#vibration-that-follows-the-drag-distance)
- [`impactOccurred()`](impactoccurred.md)
