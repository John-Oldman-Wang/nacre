---
type: reference
native: "-[UIFeedbackGenerator prepare]"
---

# `UIFeedbackGenerator`: `prepare()` method

The **`prepare()`** method puts the system's vibration hardware into a ready state ahead of time. Apple's description is that doing so reduces the latency when triggering the vibration. All three subclasses have this method.

## Syntax

```
prepare()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

- It doesn't produce a vibration itself.
- It's optional. Vibration works without it; the acceptance tests ran both ways, and neither throws.
- How much latency differs with and without it hasn't been measured; **not verified in the simulator**.
- The prepared state belongs to the generator that called it. If you create a new generator for every trigger, it does nothing for you.
- According to Apple, the ready state lasts only a short time. So call it right before you're about to vibrate, such as when a finger touches down, not once when building the interface.

## Examples

```js
const button = UIButton.buttonWithType('system');
const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: button });

button.addEventListener('touchdown', () => {
  tap.prepare();
});
button.addEventListener('touchupinside', () => {
  tap.impactOccurred();
});
```

**Effect**: Prepares when a finger touches down, and vibrates once on release over the button.

## Corresponding iOS API

`-[UIFeedbackGenerator prepare]`.

## See also

- [Reducing vibration latency](../../guides/haptics.md#reducing-vibration-latency)
