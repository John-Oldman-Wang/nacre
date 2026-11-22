---
type: reference
native: UIScreenKeyboardEvent
---

# `UIScreenKeyboardEvent`

**`UIScreenKeyboardEvent`** represents the on-screen keyboard appearing, hiding, or changing its position or size.

The three keyboard events of [`UIScreen`](ui-screen.md) are this class. It carries the keyboard's position at the start and end of its animation and the animation's duration, so the UI can move along with the keyboard.

**Inheritance**: [`Event`](event.md) → `UIScreenKeyboardEvent`

## Constructor

[`UIScreenKeyboardEvent()`](ui-screen-keyboard-event/constructor.md)

Creates a `UIScreenKeyboardEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`frame`](ui-screen-keyboard-event/frame.md) <small>read-only</small> | The keyboard position when the animation ends |
| [`previousFrame`](ui-screen-keyboard-event/previousframe.md) <small>read-only</small> | The keyboard position when the animation starts |
| [`duration`](ui-screen-keyboard-event/duration.md) <small>read-only</small> | The duration of the keyboard animation |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UIScreen`](ui-screen.md) | [`keyboardshow`](ui-screen/keyboardshow-event.md), [`keyboardhide`](ui-screen/keyboardhide-event.md), [`keyboardchange`](ui-screen/keyboardchange-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect. On iPhone the app fills the whole screen, so screen coordinates equal window coordinates.

## Examples

```js
application.addEventListener('sceneconnect', (connect) => {
  connect.scene.screen.addEventListener('keyboardshow', (e) => {
    console.log(e instanceof UIScreenKeyboardEvent, e.frame.y, e.duration);
  });
});
```

**Effect**: when the keyboard appears, prints `true`, the y of the keyboard's top edge, and the animation duration.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `UIKeyboardWillShowNotification` | `keyboardshow` |
| `UIKeyboardWillHideNotification` | `keyboardhide` |
| `UIKeyboardWillChangeFrameNotification` | `keyboardchange` |
| `userInfo[UIKeyboardFrameEndUserInfoKey]` | `event.frame` |
| `userInfo[UIKeyboardFrameBeginUserInfoKey]` | `event.previousFrame` |
| `userInfo[UIKeyboardAnimationDurationUserInfoKey]` | `event.duration` |

## See also

- [`UIScreen`](ui-screen.md): the object that fires these events
- [`UIKeyboardLayoutGuide`](ui-keyboard-layout-guide.md): keeping the UI clear of the keyboard with constraints instead of code
