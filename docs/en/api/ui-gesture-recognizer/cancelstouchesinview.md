---
type: reference
native: UIGestureRecognizer.cancelsTouchesInView
---

# `UIGestureRecognizer`: `cancelsTouchesInView` property

The **`cancelsTouchesInView`** property decides whether, once the recognizer recognizes the gesture, the touch the view is handling is canceled.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Once the gesture is recognized, the system cancels the touch the view is handling. For a [control](../ui-control.md), this shows up as [`touchcancel`](../ui-control/touchcancel-event.md) firing instead of [`touchupinside`](../ui-control/touchupinside-event.md) |
| `false` | The view receives the whole touch as usual. Both the recognizer's events and the control's events fire |

- Readable and writable.
- The default is `true`.
- Written values are converted by JS truthiness.
- The effect of both values is **not verified in the simulator**.

One case the system already handles: a parent view has a single-finger, single-tap recognizer, and a subview contains a [`UIButton`](../ui-button.md). Tapping the button then fires only the button's own events, and the parent view's recognizer does not fire (measured).

### Observing changes

No event fires when it changes. Only the app's code changes it, so no notification is needed.

## Examples

```js
const row = new UIView();
const press = new UILongPressGestureRecognizer();
press.cancelsTouchesInView = false;
row.addGestureRecognizer(press);
```

**Effect**: When a control inside `row` is long-pressed, the recognizer fires `began` and the control still fires `touchupinside` as usual. **Not verified in the simulator.**

## Corresponding iOS API

`UIGestureRecognizer.cancelsTouchesInView`.

## See also

- [Recognizers and the view's own touches](../ui-gesture-recognizer.md#recognizers-and-the-views-own-touches)
- [`delaysTouchesBegan`](delaystouchesbegan.md), [`delaysTouchesEnded`](delaystouchesended.md)
