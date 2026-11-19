---
type: reference
native: "+[UISelectionFeedbackGenerator feedbackGeneratorForView:]"
---

# `UISelectionFeedbackGenerator.feedbackGeneratorForView()` static method

The **`UISelectionFeedbackGenerator.feedbackGeneratorForView()`** static method creates a selection feedback generator bound to a view.

## Syntax

```
UISelectionFeedbackGenerator.feedbackGeneratorForView(view)
```

### Parameters

**`view`**

A [`UIView`](../ui-view.md) or an instance of one of its subclasses. Required; cannot be `null`. It indicates which view the feedback relates to: usually the control that triggers the feedback, or the root view of the view controller when there is no specific control. Whether there is a vibration when the view has not yet been added to the UI is **not verified in the simulator**.

### Return value

A new `UISelectionFeedbackGenerator`. Each call returns a new object.

### Exceptions

**`TypeError`**

- `view` is not a view: `feedbackGeneratorForView needs a UIView`.

## Examples

```js
const page = new UIViewController();
const tick = UISelectionFeedbackGenerator.feedbackGeneratorForView(page.view);
tick.selectionChanged();
```

**Effect**: a very light vibration. **Not verified in the simulator.**

## Corresponding iOS API

`+[UISelectionFeedbackGenerator feedbackGeneratorForView:]`.

## See also

- [`selectionChanged()`](selectionchanged.md)
