---
type: reference
native: "-[UIGestureRecognizer addTarget:action:]"
---

# `UIGestureRecognizer`: `addEventListener()` method

The **`addEventListener()`** method registers a callback for an event on the recognizer. When the recognizer recognizes a gesture, or the gesture progresses or ends, the event fires and the callback runs.

## Syntax

```
addEventListener(type, callback)
addEventListener(type, callback, { once })
```

### Parameters

**`type`**

The event name, a string: one of [`began`](began-event.md), [`changed`](changed-event.md), [`ended`](ended-event.md), and [`cancelled`](cancelled-event.md). Event names are the phases of the gesture; for which gestures fire which events, see [Events](../ui-gesture-recognizer.md#events).

There are no event names such as `'tap'`, `'longpress'`, or `'swipe'`. For taps and swipes, listen for `'ended'`; for long presses, listen for `'began'`.

Listening for any other name does not throw: it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`.

**`callback`**

The callback function, which receives the event object; see each event page for its type. Passing `null` does nothing.

**`options.once`**

Optional, a boolean. `true` means the callback is removed automatically after running once. Defaults to `false`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

`callback` is neither a function nor `null`: `Failed to execute 'addEventListener': parameter 2 is not of type 'Function'.`

## Description

- The listener goes on the recognizer, not on the view. The recognizer must also be attached to a view with the view's `addGestureRecognizer()` to receive touches. The order of listening and attaching does not matter.
- Registering the same function for the same event name more than once counts only once.
- Callbacks run only after the gesture happens; see [Callbacks cannot read the state as it was](../ui-gesture-recognizer.md#callbacks-cannot-read-the-state-as-it-was).
- An exception thrown in a callback does not affect the recognizer, and the other callbacks for the same event still run. The exception fires `error` on [`application`](../application.md#unhandled-exceptions-dont-terminate-the-app); if no listener cancels it, the console prints a log line starting with `Uncaught`.

## Examples

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
tap.addEventListener('ended', () => {
  console.log('Tapped');
});
card.addGestureRecognizer(tap);
```

**Effect**: Tap `card` once and the console prints `Tapped`.

## Corresponding iOS API

`-[UIGestureRecognizer addTarget:action:]`. Natively, one action method receives every phase of the gesture and tells them apart with `state`; here each phase is an event name.

## See also

- [`removeEventListener()`](removeeventlistener.md)
- [Responding to gestures](../../guides/gestures.md)
