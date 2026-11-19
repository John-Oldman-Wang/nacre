---
type: reference
native: "-[UIImpactFeedbackGenerator impactOccurred]"
---

# `UIImpactFeedbackGenerator`: `impactOccurred()` method

The **`impactOccurred()`** method vibrates once, in the style given at creation, at full intensity.

## Syntax

```
impactOccurred()
```

### Parameters

None.

### Return value

None (`undefined`). There is no notification when the vibration finishes.

### Exceptions

None. In the simulator, or when the user has turned off haptics, it does not throw; there is simply no vibration. See [When there is no vibration](../ui-feedback-generator.md#when-there-is-no-vibration).

## Examples

```js
const page = new UIViewController();
const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: page.view });
tap.impactOccurred();
tap.impactOccurred();
```

**Effect**: two vibrations in a row. A generator can be triggered repeatedly. **The vibration is not verified in the simulator.**

## Corresponding iOS API

`-[UIImpactFeedbackGenerator impactOccurred]`.

## See also

- [`impactOccurredWithIntensity()`](impactoccurredwithintensity.md): a weaker vibration
- [`prepare()`](../ui-feedback-generator/prepare.md): reducing latency
