---
type: reference
native: "-[UINotificationFeedbackGenerator notificationOccurred:]"
---

# `UINotificationFeedbackGenerator`: `notificationOccurred()` method

The **`notificationOccurred()`** method vibrates with the pattern for one kind of outcome.

## Syntax

```
notificationOccurred(type)
```

### Parameters

**`type`**

The type of outcome, one of the strings below. The three have different vibration patterns; **the feel of the vibration is not verified in the simulator**:

| Value | Meaning | When to use it |
| --- | --- | --- |
| `'success'` | Something completed successfully | Submission succeeded, payment completed |
| `'warning'` | The user needs to pay attention | A low-balance reminder, situations that need the user's confirmation |
| `'error'` | Failure | Submission failed, wrong password |

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `type` is not recognized: `notificationOccurred has no value "info"; expected one of: success / warning / error`.

In the simulator, or when the user has turned off haptic feedback, it does not throw; there is just no vibration.

## Examples

```js
const page = new UIViewController();
const result = UINotificationFeedbackGenerator.feedbackGeneratorForView(page.view);
result.notificationOccurred('warning');
```

**Effect**: The phone vibrates with the pattern the system defines for "needs attention". **Not verified in the simulator.**

## Corresponding iOS API

`-[UINotificationFeedbackGenerator notificationOccurred:]`. `UINotificationFeedbackTypeSuccess` is written `'success'`, and likewise for the rest.

## See also

- [Choosing a class for the situation](../../guides/haptics.md#recommended-approach)
