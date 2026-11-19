# Handling touches on controls

This guide covers how to respond to touches with the control events of [`UIControl`](../api/ui-control.md): responding to taps, changing the appearance while pressed, telling where the finger was lifted, disabling, simulating taps in code, and making your own tappable area. The details of each property, method, and event are on the [`UIControl`](../api/ui-control.md) reference page.

## Recommended approach

- **Choose the tap event by control.** For buttons, listen for [`click`](../api/ui-control/click-event.md). A `UIControl` created directly doesn't fire `click` (verified by testing); listen for [`touchupinside`](../api/ui-control/touchupinside-event.md). On a button, pick one of the two events; listening for both makes one tap run your code twice.
- **If you change the appearance on press, restore it in all three ending events.** Change it in [`touchdown`](../api/ui-control/touchdown-event.md), and restore it in `touchupinside`, [`touchupoutside`](../api/ui-control/touchupoutside-event.md), and [`touchcancel`](../api/ui-control/touchcancel-event.md). A touch ends with one of these three; if you restore in only one, the appearance stays pressed when the finger slides out and lifts.
- **Don't read `isHighlighted` in a callback to tell whether the finger is down.** Callbacks run after the touch, so you read the value at the moment the callback runs; see [When callbacks run](../api/ui-control.md#when-callbacks-run).
- **To simulate user actions, use [`sendActionsForControlEvents()`](../api/ui-control/sendactionsforcontrolevents.md), not `dispatchEvent()`.** The former goes through the same path as a real touch, and a button's `click` fires along with it.

Only the events below are used day to day. The rest describe the details of finger dragging and are for implementing interactions such as "press and drag" yourself.

| What you want to do | Event to listen for |
| --- | --- |
| Run code after a button is tapped | `click` |
| Run code after a directly created `UIControl` is tapped | `touchupinside` |
| Change the appearance as soon as the finger touches down | `touchdown`, restoring in `touchupinside`, `touchupoutside`, and `touchcancel` |
| The value of a control such as a switch or slider changed | [`change`](../api/ui-control/change-event.md) |
| The text of a text field changed | [`input`](../api/ui-control/input-event.md) |
| A text field started editing, ended editing, or the user pressed Return | [`focus`](../api/ui-control/focus-event.md), [`blur`](../api/ui-control/blur-event.md), [`return`](../api/ui-control/return-event.md) |

## First example

Starting from a blank app, place a green tappable area in the center of the screen. It fades while pressed, and each tap increments a counter.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Create the control. It displays nothing by itself; set the background color and corner radius with view properties
  const card = new UIControl();
  card.backgroundColor = 'systemGreen';
  card.layer.cornerRadius = 10;

  // 2. Put a line of text in the control. The text doesn't receive touches; card handles them
  const label = new UILabel();
  label.text = 'Tapped 0 times';
  label.textColor = 'white';
  label.isUserInteractionEnabled = false;
  card.addSubview(label);

  // 3. Fade when the finger touches down
  card.addEventListener('touchdown', () => {
    card.alpha = 0.6;
  });

  // 4. Finger lifted inside the control: restore the appearance and increment the count
  let count = 0;
  card.addEventListener('touchupinside', () => {
    card.alpha = 1;
    count += 1;
    label.text = 'Tapped ' + count + ' times';
    console.log('Tap', count);
  });

  // 5. Finger slid outside the control and lifted, or the system canceled the touch: only restore the appearance
  card.addEventListener('touchupoutside', () => {
    card.alpha = 1;
  });
  card.addEventListener('touchcancel', () => {
    card.alpha = 1;
  });

  // 6. Place it on the view controller, 220 pt wide and 52 pt tall, centered
  card.translatesAutoresizingMaskIntoConstraints = false;
  label.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(card);
  NSLayoutConstraint.activateConstraints([
    card.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    card.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
    card.widthAnchor.constraintEqualToConstant(220),
    card.heightAnchor.constraintEqualToConstant(52),
    label.centerXAnchor.constraintEqualToAnchor(card.centerXAnchor),
    label.centerYAnchor.constraintEqualToAnchor(card.centerYAnchor),
  ]);
});
```

**Effect**

- A green rounded rectangle appears in the center of the screen, with white "Tapped 0 times" in the middle.
- The rectangle fades while the finger is held on it and is restored on release.
- When the finger lifts on the rectangle, the text changes to "Tapped 1 times", and the console prints `Tap 1`.
- When the finger touches down, slides outside the rectangle, and then lifts, the text doesn't change and nothing is printed.

This code hasn't been run as a whole in the simulator. Creating the `UIControl`, its background color, corner radius, constraints, `touchdown`, and `touchupinside` have been run in the acceptance tests, and with a real tap those two events fire in order. **Firing of `touchupoutside` and `touchcancel`, and `card` receiving touches that land on the text, are not verified in the simulator.**

The sections below reuse `card`, `label`, and `page` from here. Sections that use buttons and text fields create their own. To try a section on its own, write these lines first:

```js
const page = new UIViewController();
const card = new UIControl();
page.view.addSubview(card);
const label = new UILabel();
label.isUserInteractionEnabled = false;
card.addSubview(label);
```

## Running code after a tap

For buttons, listen for `click`:

```js
const button = UIButton.buttonWithType('system');
button.setTitle('Submit', { forState: ['normal'] });
button.addEventListener('click', () => {
  console.log('Submit');
});
```

**Effect**: each time the user taps the button, the console prints `Submit` once. The button still needs to be added to the view controller and positioned; for how, see [Building a button](buttons.md).

For a directly created `UIControl`, listen for `touchupinside`:

```js
card.addEventListener('touchupinside', () => {
  console.log('Tapped card');
});
```

**Effect**: when the finger lifts within `card`, the console prints `Tapped card`.

> **Note:** A directly created `UIControl` doesn't fire `click` when tapped (verified by testing). Listening for that event on it means the callback never runs, and nothing reports an error.

## Reacting immediately on press

`touchdown` fires as soon as the finger touches the screen, earlier than the release.

```js
card.addEventListener('touchdown', () => {
  card.backgroundColor = 'systemTeal';
});
card.addEventListener('touchupinside', () => {
  card.backgroundColor = 'systemGreen';
});
```

**Effect**: when the finger touches down, the background turns teal. When the finger lifts inside the control, the background turns green again. **The color change is not verified in the simulator.**

The finger may also lift outside the control, or the system may cancel the touch. To restore the appearance in every case, also listen for `touchupoutside` and `touchcancel`; see step 5 of the [first example](#first-example).

## Telling a release inside from a release after sliding out

```js
card.addEventListener('touchupinside', () => {
  console.log('Confirm');
});
card.addEventListener('touchupoutside', () => {
  console.log('Abandon');
});
```

**Effect**

- When the finger touches down and lifts within the control, prints `Confirm`.
- When the finger touches down, slides outside the control, and then lifts, prints `Abandon`. **Not verified in the simulator.**

One touch fires only one of these two events.

## Changing the appearance as the finger slides out and back in

```js
card.addEventListener('touchdragexit', () => {
  card.alpha = 1;
});
card.addEventListener('touchdragenter', () => {
  card.alpha = 0.6;
});
```

**Effect**

- When the finger is held and slides out across the control's boundary, the control becomes opaque again. [`touchdragexit`](../api/ui-control/touchdragexit-event.md) fires only once per boundary crossing (verified by testing).
- When the finger slides back into the control without lifting, the control fades again. **[`touchdragenter`](../api/ui-control/touchdragenter-event.md) is not verified in the simulator.**

## Reading the finger's position

The nine events starting with `touch` carry the finger's position, in the control's own coordinate system.

```js
card.addEventListener('touchupinside', (e) => {
  const { location, tapCount } = /** @type {UIControlTouchEvent} */ (e);
  if (location !== null) {
    console.log(location.x, location.y, tapCount);
  }
});
```

**Effect**: when the finger lifts on `card`, the console prints the finger's x and y coordinates within `card` and the tap count.

Events dispatched from code have no finger, and `location` is `null`, so check before reading. For details, see [Touch location](../api/ui-control.md#touch-location).

## Disabling a control

```js
card.isEnabled = false;
```

**Effect**: `card.state` becomes `['disabled']`. The control no longer receives touches and fires no control events. Set it back to `true` to restore. **"Fires no events" is not verified in the simulator.**

A directly created `UIControl` doesn't change its appearance when disabled. To make it look disabled, change the appearance yourself:

```js
card.isEnabled = false;
card.alpha = 0.4;
```

**Effect**: `card` becomes semi-transparent.

Buttons handle their own disabled appearance; see [Building a button](buttons.md#disabling-a-button).

## Responding only once

```js
card.addEventListener('touchupinside', () => {
  console.log('Printed only once');
}, { once: true });
```

**Effect**: the first tap prints `Printed only once`. Later taps print nothing.

The listener is removed before the callback runs.

## Removing a listener

Pass the function used at registration to [`removeEventListener()`](../api/ui-control/removeeventlistener.md).

```js
const onTap = () => {
  console.log('Tapped');
};
card.addEventListener('touchupinside', onTap);

// No longer wanted later
card.removeEventListener('touchupinside', onTap);
```

**Effect**: after removal, tapping `card` prints nothing.

It must be the same function object. Writing a new arrow function with the same body doesn't remove the original listener.

## Simulating a tap in code

```js
card.addEventListener('touchdown', () => {
  console.log('touchdown');
});
card.addEventListener('touchupinside', () => {
  console.log('touchupinside');
});

card.sendActionsForControlEvents(['touchdown', 'touchupinside']);
console.log('Sent');
```

**Effect**: the console first prints `Sent`, then `touchdown` and `touchupinside`. Both callbacks run only after this code finishes. **The order between `touchdown` and `touchupinside` is not verified in the simulator.**

This method only dispatches events. It doesn't change `isHighlighted`, and there's no pressed effect on screen. For how it differs from `dispatchEvent()`, see [`sendActionsForControlEvents()`](../api/ui-control/sendactionsforcontrolevents.md#differences-from-dispatchevent).

## Don't use timers to wait for events

```js
card.addEventListener('touchupinside', () => {
  console.log('A');
});
card.sendActionsForControlEvents(['touchupinside']);
setTimeout(() => {
  console.log('B');
}, 0);
```

**Effect**: `B` may be printed before `A` (verified by testing).

The order of control events and timer callbacks isn't guaranteed. When you need to wait for an event, continue the subsequent work in the event callback.

## Reading the current state

```js
console.log(card.state);                       // ['normal']

card.isSelected = true;
console.log(card.state);                       // ['selected']

card.isEnabled = false;
console.log(card.state.includes('disabled'));  // true
console.log(card.state.includes('selected'));  // true
```

**Effect**: [`state`](../api/ui-control/state.md) is an array of state names. When none of the three states applies, it's `['normal']`. When both selected and disabled, the array contains both `'selected'` and `'disabled'`.

The order of items in the array isn't guaranteed. Use `includes()` to check a state; don't index into it.

## Making a control that toggles on each tap

The system doesn't toggle the `selected` state automatically. Change [`isSelected`](../api/ui-control/isselected.md) yourself in the tap callback.

```js
card.addEventListener('touchupinside', () => {
  card.isSelected = !card.isSelected;
  card.backgroundColor = card.isSelected ? 'systemGray' : 'systemGreen';
  label.text = card.isSelected ? 'Selected' : 'Not selected';
});
```

**Effect**: one tap turns the background gray and the text to "Selected". Another tap turns it back to green and "Not selected". **This example is not verified in the simulator.**

## Aligning content to the left or right

[`contentHorizontalAlignment`](../api/ui-control/contenthorizontalalignment.md) and [`contentVerticalAlignment`](../api/ui-control/contentverticalalignment.md) determine how the control's content is placed within the control. Content means what the subclass itself displays, such as a button's text and icon.

```js
const wide = UIButton.buttonWithType('system');
wide.setTitle('Left-aligned text', { forState: ['normal'] });
wide.contentHorizontalAlignment = 'leading';

wide.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(wide);
NSLayoutConstraint.activateConstraints([
  wide.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
  wide.topAnchor.constraintEqualToAnchor(page.view.safeAreaLayoutGuide.topAnchor, { constant: 20 }),
  wide.widthAnchor.constraintEqualToConstant(300),
]);
```

**Effect**: the button is 300 pt wide, and the text sits against its left edge. Without this property the text is centered in the button. **The text position is not verified in the simulator.**

These two properties have no visible effect on a directly created `UIControl`, because it displays no content itself. Subviews added with `addSubview()` aren't affected by them; their positions are determined by constraints.

## Listening for text changes in a text field

A text field is a subclass of `UIControl`; it fires four events: [`focus`](../api/ui-control/focus-event.md), [`input`](../api/ui-control/input-event.md), [`blur`](../api/ui-control/blur-event.md), and [`return`](../api/ui-control/return-event.md).

```js
const field = new UITextField();
field.addEventListener('input', () => {
  console.log('Current text:', field.text);
});
```

**Effect**: each time the user types or deletes a character, the console prints the current text. **Not verified in the simulator.**

For creating and positioning a text field and the keyboard, see [`UITextField`](../api/ui-text-field.md).

## Wrapping a tappable area in a function

Turn the approach from the [first example](#first-example) into a function: create a control that fades while pressed, is restored when the finger slides out, and calls the given function when tapped.

```js
/**
 * @param {() => void} onTap runs on tap
 * @returns {UIControl}
 */
function makeTappable(onTap) {
  const control = new UIControl();
  const restore = () => {
    control.alpha = 1;
  };
  control.addEventListener('touchdown', () => {
    control.alpha = 0.6;
  });
  control.addEventListener('touchdragexit', restore);
  control.addEventListener('touchdragenter', () => {
    control.alpha = 0.6;
  });
  control.addEventListener('touchupoutside', restore);
  control.addEventListener('touchcancel', restore);
  control.addEventListener('touchupinside', () => {
    restore();
    onTap();
  });
  return control;
}

const row = makeTappable(() => {
  console.log('Tapped this row');
});
row.backgroundColor = 'secondarySystemBackground';
row.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(row);
NSLayoutConstraint.activateConstraints([
  row.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
  row.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor),
  row.topAnchor.constraintEqualToAnchor(page.view.safeAreaLayoutGuide.topAnchor, { constant: 80 }),
  row.heightAnchor.constraintEqualToConstant(52),
]);
```

**Effect**: a light gray area, as wide as the screen and 52 pt tall, appears near the top of the view controller. It fades while pressed, is restored when the finger slides out, and prints `Tapped this row` when the finger lifts on it. **This example is not verified in the simulator.**

When adding text and icons to this area, set their `isUserInteractionEnabled` to `false` so that the control receives the touches.

## See also

- [`UIControl`](../api/ui-control.md): all properties, methods, events, and states
- [Building a button](buttons.md): button taps, appearance, and disabling
- [`UITextField`](../api/ui-text-field.md): text fields
- [Gesture recognizers](../api/ui-gesture-recognizer.md): making views that aren't controls respond to taps and long presses
- [Auto Layout](../api/auto-layout.md): the constraints used for positioning in the examples
