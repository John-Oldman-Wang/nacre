---
type: reference
native: UIImpactFeedbackGenerator
status: partial
---

# `UIImpactFeedbackGenerator`

**`UIImpactFeedbackGenerator`** represents an impact feedback generator: the tap of vibration when two things collide, such as a button being pressed, a card snapping into place, or a dragged item hitting a boundary.

The style is fixed at creation and cannot be changed afterward. To use several styles, create one generator for each.

**Inheritance**: `EventTarget` → `NSObject` → [`UIFeedbackGenerator`](ui-feedback-generator.md) → `UIImpactFeedbackGenerator`

In the simulator, or when the user has turned off haptics, calls do not throw but produce no vibration; see [When there is no vibration](ui-feedback-generator.md#when-there-is-no-vibration). For when to use it, see the guide [Making the phone vibrate](../guides/haptics.md).

## Constructor

It cannot be created with `new`. `new UIImpactFeedbackGenerator()` throws `TypeError: Illegal constructor: UIImpactFeedbackGenerator has no public initializer; use UIImpactFeedbackGenerator.feedbackGeneratorWithStyle(style, { forView: view })`.

## Static methods

[`UIImpactFeedbackGenerator.feedbackGeneratorWithStyle()`](ui-impact-feedback-generator/feedbackgeneratorwithstyle.md)

Creates a generator with the given style, bound to a view.

## Instance methods

Also inherits [`prepare()`](ui-feedback-generator/prepare.md) from [`UIFeedbackGenerator`](ui-feedback-generator.md).

| Method | Description |
| --- | --- |
| [`impactOccurred()`](ui-impact-feedback-generator/impactoccurred.md) | Vibrates once, in the style given at creation, at full intensity |
| [`impactOccurredWithIntensity()`](ui-impact-feedback-generator/impactoccurredwithintensity.md) | Vibrates once, at a fraction of full intensity |

## Examples

```js
const button = UIButton.buttonWithType('system');
const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: button });

button.addEventListener('touchdown', () => {
  tap.impactOccurred();
});
```

**Effect**: when a finger presses the button, the phone gives one short vibration. **The vibration is not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UIImpactFeedbackGenerator feedbackGeneratorWithStyle:UIImpactFeedbackStyleMedium forView:view]` | `UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: view })` |
| `[generator impactOccurred]` | `generator.impactOccurred()` |
| `[generator impactOccurredWithIntensity:0.5]` | `generator.impactOccurredWithIntensity(0.5)` |

## See also

- [Making the phone vibrate](../guides/haptics.md)
- [`UIFeedbackGenerator`](ui-feedback-generator.md): the base class
