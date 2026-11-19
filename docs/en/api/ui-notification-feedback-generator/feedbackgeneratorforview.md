---
type: reference
native: "+[UINotificationFeedbackGenerator feedbackGeneratorForView:]"
---

# `UINotificationFeedbackGenerator.feedbackGeneratorForView()` static method

The **`UINotificationFeedbackGenerator.feedbackGeneratorForView()`** static method creates a notification-type generator bound to a view.

## Syntax

```
UINotificationFeedbackGenerator.feedbackGeneratorForView(view)
```

### Parameters

**`view`**

An object of [`UIView`](../ui-view.md) or one of its subclasses; required; cannot be `null`. It says which view this feedback relates to: usually the control that triggered the feedback; when there is no specific control, the view controller's root view. Whether there is vibration when given a view not yet added to the UI is **not verified in the simulator**.

### Return value

A new `UINotificationFeedbackGenerator`. Each call returns a new object.

### Exceptions

**`TypeError`**

- `view` is not a view: `feedbackGeneratorForView needs a UIView`.

## Examples

```js
const button = UIButton.buttonWithType('system');
const done = UINotificationFeedbackGenerator.feedbackGeneratorForView(button);
done.notificationOccurred('success');
```

**Effect**: The phone vibrates with the pattern the system defines for "success". **Not verified in the simulator.**

## Corresponding iOS API

`+[UINotificationFeedbackGenerator feedbackGeneratorForView:]`.

## See also

- [`notificationOccurred()`](notificationoccurred.md)
