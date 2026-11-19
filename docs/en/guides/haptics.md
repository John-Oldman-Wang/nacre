# Making the phone vibrate

This guide covers how to use haptic feedback to give a short vibration that accompanies a change in the interface: a button pressed, the selection changed, an operation succeeded or failed. It involves [`UIImpactFeedbackGenerator`](../api/ui-impact-feedback-generator.md), [`UISelectionFeedbackGenerator`](../api/ui-selection-feedback-generator.md), [`UINotificationFeedbackGenerator`](../api/ui-notification-feedback-generator.md), and their base class [`UIFeedbackGenerator`](../api/ui-feedback-generator.md).

Calling these methods in the simulator does not throw, but there is no vibration. The sentences below describing how the vibration feels are all **not verified in the simulator**.

## Recommended approach

**Choose the class by the situation, not by the strength you want.** The system defines a consistent feel for each kind of situation, and users are already familiar with them from other apps. Situations and classes:

| Situation | Which to use |
| --- | --- |
| A button pressed, a card snapping into place, something being dragged hitting a boundary | `UIImpactFeedbackGenerator`, with the strength chosen by the size of the interface element: `'light'` for small ones, `'medium'` for ordinary ones, `'heavy'` for large ones |
| During a drag, the vibration should get stronger with the distance dragged | [`impactOccurredWithIntensity()`](../api/ui-impact-feedback-generator/impactoccurredwithintensity.md) of `UIImpactFeedbackGenerator` |
| A wheel turning one notch, a slider passing a tick, the selected item in a list changing | `UISelectionFeedbackGenerator` |
| A submission succeeded, a payment completed | `UINotificationFeedbackGenerator`, `'success'` |
| An insufficient-balance reminder, a situation needing the user's confirmation | `UINotificationFeedbackGenerator`, `'warning'` |
| A submission failed, a wrong password | `UINotificationFeedbackGenerator`, `'error'` |

**Create a generator once and keep it for reuse.** Create it when building the interface and put it in a variable the event callbacks can reach. The prepared state from [`prepare()`](../api/ui-feedback-generator/prepare.md) belongs to the generator it was called on; creating a new generator for every trigger makes it useless.

**Each vibration should correspond to one change in the interface.** A user who feels a vibration without seeing a change will not understand what happened. Vibrate only once per operation; do not vibrate for things the user did not directly trigger, such as a page finishing loading or a periodic refresh.

**Also show the result of the operation in the interface.** The user may have turned off haptic feedback; see [When there is no vibration](../api/ui-feedback-generator.md#when-there-is-no-vibration).

**Calling `prepare()` is optional.** It only helps when the vibration must be tightly aligned with an action; see [Reducing vibration latency](#reducing-vibration-latency).

## First example

Starting from a blank app, put a button on screen. It vibrates once when pressed, and gives a "success" vibration when released.

```js
/** @type {UIViewController} */
let page;
/** @type {UIButton} */
let button;

application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. A button
  button = UIButton.buttonWithType('system');
  button.setTitle('Submit', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  // 2. Create two generators, both bound to this button
  const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: button });
  const done = UINotificationFeedbackGenerator.feedbackGeneratorForView(button);

  // 3. Vibrate once when pressed
  button.addEventListener('touchdown', () => {
    tap.impactOccurred();
  });

  // 4. Give a "success" vibration when released
  button.addEventListener('touchupinside', () => {
    done.notificationOccurred('success');
  });
});
```

**Effect**

- A text button "Submit" appears near the top left of the screen.
- When the finger presses down, the phone gives one short vibration.
- When released on the button, the phone vibrates with the rhythm the system defines for "success".

This code has not been run as a whole in the simulator. When run in the simulator, the button appears as usual, and neither pressing nor releasing vibrates.

The two generators are created once when building the interface and reused in the two callbacks. The sections below reuse `page` and `button` from here; their code goes inside the `sceneconnect` callback, after `page` and `button` are created.

## Using a different strength

The first argument when creating is the strength; there are five; see [`feedbackGeneratorWithStyle()`](../api/ui-impact-feedback-generator/feedbackgeneratorwithstyle.md):

```js
function lightThenHeavy() {
  const light = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('light', { forView: button });
  const heavy = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('heavy', { forView: button });

  light.impactOccurred();
  heavy.impactOccurred();
}
```

**Effect**: When called, a light vibration, immediately followed by a heavy one.

The strength is fixed at creation and cannot be changed afterward. Create one generator for each strength you use.

## Making the same strength vibrate more weakly

```js
function softHeavy() {
  const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('heavy', { forView: button });
  tap.impactOccurredWithIntensity(0.3);
}
```

**Effect**: One vibration with the feel of `heavy`, at only 30% of full intensity.

## Vibration that follows the drag distance

An `intensity` outside 0 to 1 throws `TypeError` and is not automatically clamped, so clamp computed values first:

```js
function setUpDrag() {
  const pull = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: button });

  /** @param {number} distance The distance dragged, in pt */
  function onDrag(distance) {
    const intensity = Math.min(1, Math.max(0, distance / 200));
    pull.impactOccurredWithIntensity(intensity);
  }

  onDrag(50);
  onDrag(400);
}
```

**Effect**: Two vibrations. The first is at 25% of full intensity, and the second at full intensity: 400 pt computes to 2, which is clamped to 1.

## The selected item in a list changed

```js
function setUpSelection() {
  const tick = UISelectionFeedbackGenerator.feedbackGeneratorForView(page.view);

  /** @param {number} index */
  function onSelect(index) {
    tick.selectionChanged();
    console.log('Selected item ' + index);
  }

  onSelect(2);
}
```

**Effect**: A very light vibration, and the console prints `Selected item 2`.

## Signaling that an operation failed

```js
function showFailure() {
  const alarm = UINotificationFeedbackGenerator.feedbackGeneratorForView(page.view);
  alarm.notificationOccurred('error');
}
```

**Effect**: The phone vibrates with the rhythm the system defines for "failure", which differs from the rhythm for "success".

## Reducing vibration latency

[`prepare()`](../api/ui-feedback-generator/prepare.md) puts the system's vibration hardware into a ready state in advance. Apple's description is that this reduces latency when the vibration is triggered. Call it first when you know a vibration is coming soon, for example preparing when the finger presses down and triggering when it is released:

```js
function setUpPrepared() {
  const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: button });

  button.addEventListener('touchdown', () => {
    tap.prepare();   // Finger pressed: a vibration is likely soon, so prepare first
  });
  button.addEventListener('touchupinside', () => {
    tap.impactOccurred();
  });
}
```

**Effect**: One vibration on release.

It vibrates without calling `prepare()` too; the acceptance tests ran both forms, and neither throws. How much the latency differs with and without it has not been measured; **not verified in the simulator**. According to Apple's description, the ready state lasts only a short time, so call it right before the vibration, not once when building the interface.

## See also

- [`UIFeedbackGenerator`](../api/ui-feedback-generator.md): the base class, and when there is no vibration
- [`UIImpactFeedbackGenerator`](../api/ui-impact-feedback-generator.md), [`UISelectionFeedbackGenerator`](../api/ui-selection-feedback-generator.md), [`UINotificationFeedbackGenerator`](../api/ui-notification-feedback-generator.md)
- [`UIControl`](../api/ui-control.md): `touchdown`, `touchupinside`
