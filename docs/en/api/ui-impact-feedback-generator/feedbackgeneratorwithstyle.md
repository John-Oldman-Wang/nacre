---
type: reference
native: "+[UIImpactFeedbackGenerator feedbackGeneratorWithStyle:forView:]"
---

# `UIImpactFeedbackGenerator.feedbackGeneratorWithStyle()` static method

The **`UIImpactFeedbackGenerator.feedbackGeneratorWithStyle()`** static method creates an impact feedback generator. The style is fixed at creation and cannot be changed afterward.

## Syntax

```
UIImpactFeedbackGenerator.feedbackGeneratorWithStyle(style, { forView })
```

### Parameters

**`style`**

The style, one of the strings below. The "Feel" column is the description from Apple's documentation; **the vibrations are not verified in the simulator**:

| Value | Feel |
| --- | --- |
| `'light'` | Light. For small, light UI elements |
| `'medium'` | Medium |
| `'heavy'` | Heavy. For large, heavy UI elements |
| `'soft'` | Dull, like hitting something soft |
| `'rigid'` | Crisp, like hitting something hard |

**`options.forView`**

A [`UIView`](../ui-view.md) or an instance of one of its subclasses. Required; cannot be `null`. It indicates which view the feedback relates to: usually the control that triggers the feedback, or the root view of the view controller when there is no specific control. The acceptance tests always pass views already on screen; whether there is a vibration when the view has not yet been added to the UI is **not verified in the simulator**.

### Return value

A new `UIImpactFeedbackGenerator`. Each call returns a new object.

### Exceptions

**`TypeError`**

- `style` is not recognized: `style has no value "strong"; expected one of: light / medium / heavy / soft / rigid`.
- `forView` is missing: `feedbackGeneratorWithStyle needs { forView }`.
- `forView` is not a view: `forView needs a UIView`.

## Examples

```js
const page = new UIViewController();
const light = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('light', { forView: page.view });
const heavy = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('heavy', { forView: page.view });

light.impactOccurred();
heavy.impactOccurred();
```

**Effect**: a light vibration, followed immediately by a heavy one. **Not verified in the simulator.**

## Corresponding iOS API

`+[UIImpactFeedbackGenerator feedbackGeneratorWithStyle:forView:]`. `UIImpactFeedbackStyleMedium` is written `'medium'`, and likewise for the others. `-initWithStyle:` is marked by Apple as to be deprecated and is not provided.

## See also

- [`impactOccurred()`](impactoccurred.md)
