---
type: reference
native: UINotificationFeedbackGenerator
status: partial
---

# `UINotificationFeedbackGenerator`

**`UINotificationFeedbackGenerator`** represents a notification-type haptic feedback generator: the vibration for when something succeeded, needs attention, or failed. The three outcomes have different vibration patterns.

**Inheritance**: `EventTarget` → `NSObject` → [`UIFeedbackGenerator`](ui-feedback-generator.md) → `UINotificationFeedbackGenerator`

In the simulator, or when the user has turned off haptic feedback, calls do not throw but there is no vibration; see [When there is no vibration](ui-feedback-generator.md#when-there-is-no-vibration).

## Constructor

It cannot be created with `new`; use [`UINotificationFeedbackGenerator.feedbackGeneratorForView()`](ui-notification-feedback-generator/feedbackgeneratorforview.md). Using `new` throws `TypeError`, and the error message names the static method to use.

## Static methods

[`UINotificationFeedbackGenerator.feedbackGeneratorForView()`](ui-notification-feedback-generator/feedbackgeneratorforview.md)

Creates a generator bound to a view.

## Instance methods

Also inherits [`prepare()`](ui-feedback-generator/prepare.md) from [`UIFeedbackGenerator`](ui-feedback-generator.md).

| Method | Description |
| --- | --- |
| [`notificationOccurred()`](ui-notification-feedback-generator/notificationoccurred.md) | Vibrates with the pattern for one of success, warning, and error |

## Examples

```js
const page = new UIViewController();
const alarm = UINotificationFeedbackGenerator.feedbackGeneratorForView(page.view);
alarm.notificationOccurred('error');
```

**Effect**: The phone vibrates with the pattern the system defines for "error", which differs from the pattern for "success". **The feel of the vibration is not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UINotificationFeedbackGenerator feedbackGeneratorForView:view]` | `UINotificationFeedbackGenerator.feedbackGeneratorForView(view)` |
| `[generator notificationOccurred:UINotificationFeedbackTypeSuccess]` | `generator.notificationOccurred('success')` |

## See also

- [Making the phone vibrate](../guides/haptics.md)
- [`UIFeedbackGenerator`](ui-feedback-generator.md): the base class
