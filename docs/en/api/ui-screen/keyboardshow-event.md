---
type: reference
native: UIKeyboardWillShowNotification
---

# `UIScreen`: `keyboardshow` event

The **`keyboardshow`** event fires when the keyboard is about to appear.

## Syntax

```
screen.addEventListener('keyboardshow', (event) => { })
```

## Event object

`UIScreenKeyboardEvent`. Besides `type` and `target` (this screen), it carries three read-only fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `frame` | [`CGRect`](../cg-rect.md) | Where the keyboard is when the animation ends, in screen coordinates, in pt. The keyboard's height is `frame.height` |
| `previousFrame` | [`CGRect`](../cg-rect.md) | Where the keyboard is when the animation starts |
| `duration` | number | How long the keyboard animation lasts, in seconds |

Not cancelable. On iPhone the app fills the whole screen, so screen coordinates are the same as coordinates in the window.

## When it fires

- Fires when the user taps a text field, or code makes a text field the first responder, and the software keyboard is about to appear.
- [`keyboardchange`](keyboardchange-event.md) fires first, then `keyboardshow` (tested).
- In a simulator connected to a hardware keyboard the software keyboard doesn't appear, so it doesn't fire.

**Dispatched on the spot**: listeners run inside the keyboard's animation. If a listener changes a view's `frame`, or changes constraints and then calls `layoutIfNeeded()`, those changes move along with the keyboard, with the same duration and timing curve, and you don't write an animation yourself (tested).

When JS dismisses the keyboard itself by calling `endEditing()`, the listeners have finished before `endEditing()` returns (tested).

## Examples

```js
const page = new UIViewController();
const bar = new UIView();
bar.frame = new CGRect(0, 800, 390, 56);
page.view.addSubview(bar);
const screen = /** @type {UIWindowScene} */ (application.scenes[0]).screen;
screen.addEventListener('keyboardshow', (e) => {
  const event = /** @type {UIScreenKeyboardEvent} */ (e);
  bar.frame = new CGRect(0, event.frame.y - 56, 390, 56);
});
```

**Effect**: the `bar` at the bottom moves up together with the keyboard and stops on top of it.

## Corresponding iOS API

`UIKeyboardWillShowNotification`.

## See also

- [`keyboardLayoutGuide`](../ui-keyboard-layout-guide.md): follow the keyboard with constraints instead of listening for events
- [`UIScreen`](../ui-screen.md)
