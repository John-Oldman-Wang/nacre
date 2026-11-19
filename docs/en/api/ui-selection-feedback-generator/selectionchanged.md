---
type: reference
native: "-[UISelectionFeedbackGenerator selectionChanged]"
---

# `UISelectionFeedbackGenerator`: `selectionChanged()` method

The **`selectionChanged()`** method vibrates very lightly once to indicate that the selection moved from one item to another.

## Syntax

```
selectionChanged()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None. In the simulator, or when the user has turned off haptics, it does not throw; there is simply no vibration.

## Description

It only produces the vibration and knows nothing about what is selected in the UI. Your code calls it when the selection changes, once per change.

## Examples

```js
const page = new UIViewController();
const tick = UISelectionFeedbackGenerator.feedbackGeneratorForView(page.view);

for (let i = 0; i < 3; i++) {
  tick.selectionChanged();
}
```

**Effect**: three very light vibrations in a row. **The vibration is not verified in the simulator.**

## Corresponding iOS API

`-[UISelectionFeedbackGenerator selectionChanged]`.

## See also

- [When there is no vibration](../ui-feedback-generator.md#when-there-is-no-vibration)
