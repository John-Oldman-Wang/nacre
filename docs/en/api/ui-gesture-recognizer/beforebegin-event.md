---
type: reference
native: "UIGestureRecognizerDelegate gestureRecognizerShouldBegin:"
---

# `UIGestureRecognizer`: `beforebegin` event

The **`beforebegin`** event fires when the system asks this recognizer whether it should begin recognizing a gesture. If a listener calls `preventDefault()`, the gesture does not begin this time.

## Syntax

```
addEventListener('beforebegin', (event) => { })
```

## Event object

The event object's type is `UIGestureRecognizerEvent`. Besides `type` and `target` (this recognizer), it carries two read-only fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `location` | [`CGPoint`](../cg-point.md) or `null` | The position of the gesture at this moment, in the coordinate system of the view the recognizer is attached to, in [pt](../units.md). With several fingers, it is their center point |
| `numberOfTouches` | Number | The number of fingers taking part in the gesture at this moment |

The callback parameter is declared as `Event`; to read these fields, cast the type, as in the example.

Cancelable: `event.cancelable` is `true`. If `preventDefault()` is called, the gesture does not begin this time, and the recognizer fires none of its events such as [`began`](began-event.md) and [`ended`](ended-event.md).

## When it fires

- Fires when the recognizer is about to recognize the gesture, before [`began`](began-event.md) ([`ended`](ended-event.md) for discrete gestures). At most once per gesture (from the iOS definition).
- Fires on the spot. After firing the event, the system waits for all listeners to finish before deciding whether to begin. This differs from the recognizer's other four events: they fire after the fact, once the current JS finishes running.
- When the event has several listeners, the gesture does not begin if any one of them calls `preventDefault()`.
- If a listener throws, the other listeners for the same event still run. The exception fires `error` on [`application`](../application.md#unhandled-exceptions-dont-terminate-the-app). Throwing is not the same as calling `preventDefault()`.
- With no listeners, the system does not ask and the gesture begins as usual. The same holds after the last listener is removed.
- The firing, the effect of `preventDefault()`, and beginning as usual after the listener is removed are all verified in the acceptance suite: the test asks the recognizer whether it should begin, the way the system does, and asserts its answer. Behavior when triggered by a real finger is **not verified with a real finger**.

> **Note**: The system waits while listeners run. In a listener, only make the decision; do nothing time-consuming.

### Only on recognizers you create

Only recognizers the app creates with `new` can listen for `beforebegin`. UIKit's own recognizers, such as a scroll view's [`panGestureRecognizer`](../ui-scroll-view/pangesturerecognizer.md), are managed by the system, which decides itself whether they begin. Listening on one throws `TypeError`, the listener is not added, and the recognizer's behavior does not change:

```
beforebegin is only available on gesture recognizers you create: this one belongs to UIKit (for example a scroll view's built-in pan) and its delegate cannot be replaced
```

## Examples

```js
const sheet = new UIView();
const pan = new UIPanGestureRecognizer();
pan.addEventListener('beforebegin', (event) => {
  const { location } = /** @type {UIGestureRecognizerEvent} */ (event);
  if (location === null || location.y > 44) event.preventDefault();
});
sheet.addGestureRecognizer(pan);
```

**Effect**: the drag begins only if, when it is about to be recognized, the finger is within the top 44 pt of `sheet`; dragging in the lower part makes `pan` fire no events. **Not verified with a real finger.**

## Corresponding iOS API

`gestureRecognizerShouldBegin:` of `UIGestureRecognizerDelegate` returning `NO` corresponds to calling `event.preventDefault()` here. There is no need to set the recognizer's `delegate`; just listen for this event.

## See also

- [`recognizesSimultaneouslyWith`](recognizessimultaneouslywith.md): the other thing the system asks, whether it can recognize at the same time as other recognizers
- [`began`](began-event.md): fires after the gesture begins
- [`requireGestureRecognizerToFail()`](requiregesturerecognizertofail.md): waits until another recognizer fails before recognizing
