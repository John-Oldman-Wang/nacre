---
type: reference
native: UIKeyboardWillChangeFrameNotification
---

# `UIScreen`: `keyboardchange` event

The **`keyboardchange`** event fires when the keyboard's position or size is about to change.

## Syntax

```
screen.addEventListener('keyboardchange', (event) => { })
```

## Event object

[`UIScreenKeyboardEvent`](../ui-screen-keyboard-event.md). Besides `type` and `target` (this screen), it carries three read-only fields:

| Field | Type | Meaning |
| --- | --- | --- |
| [`frame`](../ui-screen-keyboard-event/frame.md) | [`CGRect`](../cg-rect.md) | Where the keyboard is when the animation ends, in screen coordinates, in pt. The keyboard's height is `frame.height` |
| [`previousFrame`](../ui-screen-keyboard-event/previousframe.md) | [`CGRect`](../cg-rect.md) | Where the keyboard is when the animation starts |
| [`duration`](../ui-screen-keyboard-event/duration.md) | number | How long the keyboard animation lasts, in seconds |

Not cancelable. On iPhone the app fills the whole screen, so screen coordinates are the same as coordinates in the window.

## When it fires

- Fires both when the keyboard appears and when it's dismissed, before [`keyboardshow`](keyboardshow-event.md) and [`keyboardhide`](keyboardhide-event.md) respectively (tested).
- Also fires when the keyboard's height changes while it's shown, for example when the user switches input methods or a suggestion bar appears. **This case is not verified in the simulator.**
- If all you care about is how much room the keyboard takes up right now, listening for this one event is enough.

**Dispatched on the spot**: listeners run inside the keyboard's animation. If a listener changes a view's `frame`, or changes constraints and then calls `layoutIfNeeded()`, those changes move along with the keyboard, with the same duration and timing curve, and you don't write an animation yourself (tested).

When JS dismisses the keyboard itself by calling `endEditing()`, the listeners have finished before `endEditing()` returns (tested).

## Examples

```js
const page = new UIViewController();
const bar = new UIView();
bar.frame = new CGRect(0, 800, 390, 56);
page.view.addSubview(bar);
const screen = /** @type {UIWindowScene} */ (application.scenes[0]).screen;
screen.addEventListener('keyboardchange', (event) => {
  const top = Math.min(event.frame.y, screen.bounds.height);
  bar.frame = new CGRect(0, top - 56, 390, 56);
});
```

**Effect**: when the keyboard appears, is dismissed, or changes height, `bar` moves with it and stays on top of the keyboard; when the keyboard is dismissed it returns to the bottom of the screen.

## Corresponding iOS API

`UIKeyboardWillChangeFrameNotification`.

## See also

- [`keyboardLayoutGuide`](../ui-keyboard-layout-guide.md): follow the keyboard with constraints instead of listening for events
- [`UIScreen`](../ui-screen.md)
