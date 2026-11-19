---
type: reference
native: UIControl
status: partial
---

# `UIControl`

**`UIControl`** represents a control: a view that receives touches and turns the course of a touch into a set of "control events" that it fires. It is the common parent class of all interactive controls: [`UIButton`](ui-button.md) (button), [`UITextField`](ui-text-field.md) (text field), [`UISwitch`](ui-switch.md) (switch), and [`UISlider`](ui-slider.md) (slider) all inherit from it.

A control provides two things:

- **[States](#states)**: normal, finger held down, disabled, selected. Subclasses show a different appearance for each state.
- **[Control events](#events)**: 16 events such as finger down, finger moved out, and finger lifted, listened to with [`addEventListener()`](ui-control/addeventlistener.md).

`UIControl` can also be created directly. A control created directly displays nothing; use it as a custom tappable area: give it a background color, add text and icons to it, then listen to its events. A plain [`UIView`](ui-view.md) does not fire control events; to make a plain view respond to taps, use a [gesture recognizer](ui-gesture-recognizer.md).

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIControl`

For how to build a tappable area with control events and handle press and release, see the guide [Handling touches on controls](../guides/control-touches.md).

## Constructor

[`UIControl()`](ui-control/constructor.md)

Creates a control that displays nothing, for use as a custom tappable area.

## Instance properties

Also inherits the properties of [`UIView`](ui-view.md). Inherited properties commonly used on controls are `backgroundColor`, `alpha`, `layer`, and `isUserInteractionEnabled`.

| Property | Description |
| --- | --- |
| [`isEnabled`](ui-control/isenabled.md) | Whether the control receives touches. When `false`, the control enters the `disabled` state |
| [`isSelected`](ui-control/isselected.md) | Whether the control is in the `selected` state. Only the app's code changes it |
| [`isHighlighted`](ui-control/ishighlighted.md) | Whether the control is in the `highlighted` state. The system sets it to `true` while a finger is held down |
| [`state`](ui-control/state.md) <small>read-only</small> | All current states, as an array of state names |
| [`isTracking`](ui-control/istracking.md) <small>read-only</small> | Whether the control is tracking a touch |
| [`isTouchInside`](ui-control/istouchinside.md) <small>read-only</small> | Whether the touch being tracked is currently within the control's bounds |
| [`contentHorizontalAlignment`](ui-control/contenthorizontalalignment.md) | Horizontal position of the content a subclass displays within the control |
| [`contentVerticalAlignment`](ui-control/contentverticalalignment.md) | Vertical position of the content a subclass displays within the control |

## Instance methods

Also inherits the methods of [`UIView`](ui-view.md), and `dispatchEvent()` from `EventTarget`.

| Method | Description |
| --- | --- |
| [`addEventListener()`](ui-control/addeventlistener.md) | Listens for a control event |
| [`removeEventListener()`](ui-control/removeeventlistener.md) | Removes a listener |
| [`sendActionsForControlEvents()`](ui-control/sendactionsforcontrolevents.md) | Makes the control fire the given events, through the same path as a real touch |

## Events

There are 16 control events in total, listened to with [`addEventListener()`](ui-control/addeventlistener.md). Names are case-sensitive. An event is fired only on the control the listener is registered on; it does not bubble and cannot be canceled.

**Touch events**: fired by all controls. The table below lists them in the order of a touch. The event object carries the [touch location](#touch-location).

| Event | When it fires |
| --- | --- |
| [`touchdown`](ui-control/touchdown-event.md) | A finger presses down on the control |
| [`touchdownrepeat`](ui-control/touchdownrepeat-event.md) | On repeated taps in quick succession, from the second press on |
| [`touchdraginside`](ui-control/touchdraginside-event.md) | A finger held down moves within the control's bounds |
| [`touchdragexit`](ui-control/touchdragexit-event.md) | The moment a finger held down moves from inside the control to outside it |
| [`touchdragoutside`](ui-control/touchdragoutside-event.md) | A finger held down moves outside the control's bounds |
| [`touchdragenter`](ui-control/touchdragenter-event.md) | The moment a finger held down moves from outside the control back inside it |
| [`touchupinside`](ui-control/touchupinside-event.md) | A finger is lifted within the control's bounds |
| [`touchupoutside`](ui-control/touchupoutside-event.md) | A finger is lifted outside the control's bounds |
| [`touchcancel`](ui-control/touchcancel-event.md) | The system canceled the touch; the finger was not lifted normally |

A touch ends with exactly one of `touchupinside`, `touchupoutside`, or `touchcancel`.

**Other events**: fired only by specific subclasses. The event object does not carry the touch location.

| Event | When it fires |
| --- | --- |
| [`click`](ui-control/click-event.md) | The user completed the control's primary action. For a button, that is a tap |
| [`change`](ui-control/change-event.md) | The user changed the control's value. Fired by controls that have a value, such as switches and sliders |
| [`menuaction`](ui-control/menuaction-event.md) | Before the control shows a menu |
| [`focus`](ui-control/focus-event.md) | A text field begins editing |
| [`input`](ui-control/input-event.md) | The user changed a text field's text |
| [`blur`](ui-control/blur-event.md) | A text field ends editing |
| [`return`](ui-control/return-event.md) | The user pressed the Return key on the keyboard |

[`traitchange`](ui-trait-collection.md), which every view has, can also be listened to on a control. Text fields have five additional cancelable events; see [`UITextField`](ui-text-field.md#events).

Listening for any other name does not throw: it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`. Names starting with `@` are reserved for the runtime; listening for them throws `TypeError`.

## States

At any moment a control is in one or more states. Subclasses show a different appearance for each state; for example, a button can have different text for each state.

| State | When the control is in this state | Who changes it |
| --- | --- | --- |
| `normal` | None of the four below applies | Nobody |
| `highlighted` | [`isHighlighted`](ui-control/ishighlighted.md) is `true`: a finger is pressed on the control | The system, automatically. Set to `true` on press and back to `false` on release. The app's code can also write it |
| `disabled` | [`isEnabled`](ui-control/isenabled.md) is `false` | The app's code |
| `selected` | [`isSelected`](ui-control/isselected.md) is `true` | The app's code. The system never changes it automatically |
| `focused` | The control has focus. **Not verified in the simulator.** | The system |

States other than `normal` can hold at the same time, for example "selected and disabled". That is why [`state`](ui-control/state.md) reads as an array.

State changes do not fire events. `isEnabled` and `isSelected` are changed only by the app's code, so no notification is needed. `isHighlighted` is changed by the system during a touch; use `touchdown` and the three ending events to learn when a touch starts and ends.

## Touch location

For the nine events whose names start with `touch`, the event object's type is `UIControlTouchEvent`, which has two more read-only fields than a plain `Event`:

| Field | Type | Meaning |
| --- | --- | --- |
| `location` | [`CGPoint`](structs.md) or `null` | The finger's position, in **this control's own coordinate system**, in [pt](units.md). `null` when there is no real touch |
| `tapCount` | number | The number of consecutive taps, counted in taps. 0 when there is no real touch |

- The callback parameter is declared as `Event`. To read these two fields, cast it with `/** @type {UIControlTouchEvent} */ (e)`.
- Events fired by [`sendActionsForControlEvents()`](ui-control/sendactionsforcontrolevents.md) have no corresponding touch: `location` is `null` and `tapCount` is 0. `null` differs from `(0, 0)`: `(0, 0)` is the control's top-left corner, a real position.
- These two values can only be read from the event object. By the time the callback runs, the touch may already have ended, and the control does not store the touch position. To convert the position to another view's coordinate system, use `convertPoint()` on [`UIView`](ui-view.md).
- The objects of the other seven events do not have these two fields; reading them gives `undefined`, and `'location' in e` is `false`. `focus`, `input`, `blur`, and `return` are text input events and have nothing to do with touch points; `change`, `click`, and `menuaction` do not necessarily come from a touch, since code calling `sendActionsForControlEvents()` also fires them.

## When callbacks run

Callbacks do not run immediately when a touch happens. They are queued to run after the current round of code; for background, see [How the runtime works](how-it-works.md).

This has two consequences:

- **A callback sees the state at the moment it runs, not at the moment the event happened.** Reading `isHighlighted` in a `touchdown` callback gives `true` while the finger is held down; if the finger is lifted quickly after pressing, it may give `false`, because the system has already set it back by the time the callback runs (measured). The event object does not carry the control's state at the moment of the event, only the touch location.
- **The order of control events and timer callbacks is not guaranteed.** If you set a 0 ms timer right after `sendActionsForControlEvents()`, the timer callback may run first (measured). When you need to wait for an event, continue the follow-up work inside the event callback.

An exception thrown in a callback does not affect the control. The exception fires `error` on [`application`](application.md#unhandled-exceptions-dont-terminate-the-app); if no listener cancels it, the console prints a log starting with `Uncaught`. Other callbacks for the same event still run, and the control keeps firing events afterward.

## Examples

### Building your own tappable area

Starting from a blank app, place a green tappable area in the center of the screen. It fades while held down, and each tap adds one to a count.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const card = new UIControl();
  card.backgroundColor = 'systemGreen';
  card.layer.cornerRadius = 10;

  const label = new UILabel();
  label.text = 'Taps: 0';
  label.textColor = 'white';
  label.isUserInteractionEnabled = false;
  card.addSubview(label);

  card.addEventListener('touchdown', () => {
    card.alpha = 0.6;
  });
  let count = 0;
  card.addEventListener('touchupinside', () => {
    card.alpha = 1;
    count += 1;
    label.text = 'Taps: ' + count;
    console.log('Tap', count);
  });
  card.addEventListener('touchupoutside', () => {
    card.alpha = 1;
  });
  card.addEventListener('touchcancel', () => {
    card.alpha = 1;
  });

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

- A green rounded rectangle 220 pt wide and 52 pt tall appears in the center of the screen, with white "Taps: 0" in the middle.
- The rectangle fades while a finger is held on it and recovers on release.
- When the finger is lifted on the rectangle, the text changes to "Taps: 1" and the console prints `Tap 1`.
- When the finger presses, slides outside the rectangle, and is then lifted, the text does not change and the console prints nothing.

This code has not been run as a whole in the simulator. Creating a `UIControl`, its background color, corner radius, constraints, `touchdown`, and `touchupinside` have run in the acceptance tests, and on a real tap these two events fire in that order. **Firing of `touchupoutside` and `touchcancel`, and `card` receiving a touch that lands on the text, are not verified in the simulator.**

### Reading the current state

```js
const control = new UIControl();
console.log(control.state.join(', '));

control.isSelected = true;
control.isEnabled = false;
console.log(control.state.includes('selected'), control.state.includes('disabled'));
```

**Result**: prints `normal` first, then `true true`. When none of the three states holds, the array has the single item `'normal'`; when the control is both selected and disabled, it has two items, in no guaranteed order.

For more patterns, see the guide [Handling touches on controls](../guides/control-touches.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UIControl alloc] init]` | `new UIControl()` |
| `[c addTarget:self action:@selector(tap:) forControlEvents:UIControlEventTouchUpInside]` | `c.addEventListener('touchupinside', fn)` |
| `[c removeTarget:self action:@selector(tap:) forControlEvents:UIControlEventTouchUpInside]` | `c.removeEventListener('touchupinside', fn)` |
| `[c sendActionsForControlEvents:UIControlEventTouchDown \| UIControlEventTouchUpInside]` | `c.sendActionsForControlEvents(['touchdown', 'touchupinside'])` |
| `c.enabled = NO` | `c.isEnabled = false` |
| `c.selected = YES` | `c.isSelected = true` |
| `c.highlighted` | `c.isHighlighted` |
| `c.state & UIControlStateSelected` | `c.state.includes('selected')` |
| `c.tracking` | `c.isTracking` |
| `c.touchInside` | `c.isTouchInside` |
| `c.contentHorizontalAlignment = UIControlContentHorizontalAlignmentLeading` | `c.contentHorizontalAlignment = 'leading'` |
| `c.contentVerticalAlignment = UIControlContentVerticalAlignmentTop` | `c.contentVerticalAlignment = 'top'` |

Event name mapping:

| ObjC | JS |
| --- | --- |
| `UIControlEventTouchDown` and the other eight touch events | The name without the `UIControlEvent` prefix, all lowercase: `'touchdown'`, `'touchupinside'`, … |
| `UIControlEventPrimaryActionTriggered` | `'click'` |
| `UIControlEventValueChanged` | `'change'` |
| `UIControlEventMenuActionTriggered` | `'menuaction'` |
| `UIControlEventEditingDidBegin` | `'focus'` |
| `UIControlEventEditingChanged` | `'input'` |
| `UIControlEventEditingDidEnd` | `'blur'` |
| `UIControlEventEditingDidEndOnExit` | `'return'` |

- State names are the ObjC constants without the `UIControlState` prefix, with the first letter lowercase. The native bitmask is an array of strings in JS.
- The native `addTarget:action:forControlEvents:` is called target-action: you register an object and one of its methods with the control, and the control calls that method when the event happens. In JS, use `addEventListener()` instead.

## Mapping to browser events

This table is only for looking up correspondences, for people familiar with browser events.

| Browser | Control event |
| --- | --- |
| `pointerdown` | `touchdown` |
| `pointermove` | `touchdraginside`, `touchdragoutside`, `touchdragenter`, `touchdragexit` |
| `pointerup` | `touchupinside`, `touchupoutside` |
| `pointercancel` | `touchcancel` |
| `click` | `click` (buttons), `touchupinside` (a `UIControl` created directly) |
| `input`, `focus`, `blur` | Same names, same meaning |
| `clientX`, `clientY` | `location` on events starting with `touch`, in the control's own coordinate system |
| `element.disabled = true` | `control.isEnabled = false` |

## See also

- [Handling touches on controls](../guides/control-touches.md): tappable areas, appearance while pressed, simulated taps, disabling
- [`UIButton`](ui-button.md): the most common control, with text and icons set per state
- [`UITextField`](ui-text-field.md): text field; fires `focus`, `input`, `blur`, and `return`
- [`UISwitch`](ui-switch.md), [`UISlider`](ui-slider.md), [`UIStepper`](ui-stepper.md), [`UISegmentedControl`](ui-segmented-control.md), [`UIPageControl`](ui-page-control.md), [`UIDatePicker`](ui-date-picker.md): controls that fire `change`
- [`UIView`](ui-view.md): the parent class; position, size, background color, `isUserInteractionEnabled`
- [Gesture recognizers](ui-gesture-recognizer.md): make views that are not controls respond to taps and long presses
- [Native classes](native-classes.md): `UIControl` cannot be subclassed, and what to write instead
