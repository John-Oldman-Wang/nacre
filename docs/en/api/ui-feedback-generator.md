---
type: reference
native: UIFeedbackGenerator
status: partial
---

# `UIFeedbackGenerator`

**`UIFeedbackGenerator`** represents a haptic feedback generator. Haptic feedback is a short vibration the phone makes along with a change in the interface, such as a button press, a switch flip, or an operation succeeding or failing. The strength and rhythm of the vibration are preset by the system; the app only chooses which kind to use and can't specify a waveform for how long or how strongly to vibrate.

`UIFeedbackGenerator` is a base class and can't be used directly. Haptic feedback is provided by its three subclasses, each for one kind of occasion:

| Class | What it represents | Triggering method |
| --- | --- | --- |
| [`UIImpactFeedbackGenerator`](ui-impact-feedback-generator.md) | An impact: two things colliding | [`impactOccurred()`](ui-impact-feedback-generator/impactoccurred.md) |
| [`UISelectionFeedbackGenerator`](ui-selection-feedback-generator.md) | A selection change: moving from one item to another | [`selectionChanged()`](ui-selection-feedback-generator/selectionchanged.md) |
| [`UINotificationFeedbackGenerator`](ui-notification-feedback-generator.md) | A notification: something succeeded, needs attention, or failed | [`notificationOccurred()`](ui-notification-feedback-generator/notificationoccurred.md) |

Generators can only be created with the static methods on the subclasses, and creating one requires a view, indicating which view on screen the feedback relates to. Once created, a generator can be triggered repeatedly. Calling the triggering method produces one vibration. The method has no return value, and there is no "done vibrating" notification.

**Inheritance**: `EventTarget` → `NSObject` → `UIFeedbackGenerator`

For which class to choose for which occasion and when to call `prepare()`, see the guide [Making the phone vibrate](../guides/haptics.md).

## Constructor

It can't be created with `new`. `new UIFeedbackGenerator()` throws `TypeError: Illegal constructor: UIFeedbackGenerator has no public initializer; use one of its subclasses, e.g. UIImpactFeedbackGenerator.feedbackGeneratorWithStyle(style, { forView: view })`.

Create one with the static methods of the three subclasses.

## Instance methods

Also inherits methods from `NSObject`.

| Method | Description |
| --- | --- |
| [`prepare()`](ui-feedback-generator/prepare.md) | Gets the system's vibration hardware ready ahead of time, reducing latency when triggering. Optional |

## When there is no vibration

In the following cases, calling the triggering method doesn't throw; there is simply no vibration:

- **In the simulator.** The simulator has no vibration hardware. Creating generators, calling each method, and the errors for invalid arguments all behave in the simulator as on a device; you just can't feel any vibration.
- **The user turned off haptic feedback in system settings.** The app can't query this setting and doesn't need to: just call as usual. This is **not verified in the simulator**; it comes from iOS's definition.

So haptic feedback can only be a supplement. The result of an operation must also be shown in the interface; don't rely on vibration alone to tell the user.

Sentences on this group of pages describing how the vibration feels (differences in strength and rhythm) are all **not verified in the simulator**: what was checked on a device (iPhone 14) is that the calls execute without errors; the feel itself wasn't recorded.

## Examples

The code below starts from a blank app and places a button on screen. It vibrates once when pressed, and gives a "success" vibration on release.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('Submit', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: button });
  const done = UINotificationFeedbackGenerator.feedbackGeneratorForView(button);

  button.addEventListener('touchdown', () => {
    tap.impactOccurred();
  });
  button.addEventListener('touchupinside', () => {
    done.notificationOccurred('success');
  });
});
```

**Effect**

- A text button "Submit" appears near the top left of the screen.
- When a finger presses it, the phone vibrates briefly once.
- On release over the button, the phone vibrates in the rhythm the system defines for "success".

This code has not been run as a whole in the simulator. In the simulator the button appears as usual, and there is no vibration on press or release.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UIImpactFeedbackGenerator feedbackGeneratorWithStyle:UIImpactFeedbackStyleMedium forView:view]` | `UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: view })` |
| `[UISelectionFeedbackGenerator feedbackGeneratorForView:view]` | `UISelectionFeedbackGenerator.feedbackGeneratorForView(view)` |
| `[[UIImpactFeedbackGenerator alloc] initWithStyle:UIImpactFeedbackStyleMedium]` | No equivalent. Apple has marked this initializer as to be deprecated; use the view-bound form above |
| `[generator prepare]` | `generator.prepare()` |

Comparison with the browser:

| Browser | Nacre |
| --- | --- |
| `navigator.vibrate(200)`, specifying the vibration in milliseconds | No equivalent. You can only choose from the few kinds of vibration the system presets |

## See also

- [Making the phone vibrate](../guides/haptics.md): choosing a class for the occasion, reusing generators, reducing latency
- [`UIImpactFeedbackGenerator`](ui-impact-feedback-generator.md), [`UISelectionFeedbackGenerator`](ui-selection-feedback-generator.md), [`UINotificationFeedbackGenerator`](ui-notification-feedback-generator.md): the three subclasses
- [`UIControl`](ui-control.md): `touchdown` and `touchupinside`, the moments to trigger vibration
