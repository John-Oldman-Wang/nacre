---
type: reference
native: UIViewController.modalInPresentation
---

# `UIViewController`: `isModalInPresentation` property

The **`isModalInPresentation`** property determines whether the user can drag this modal view controller down to dismiss it.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `false` | A sheet-style modal view controller can be dragged down by the user |
| `true` | The user cannot drag it away; only code can dismiss it with [`dismissViewController()`](dismissviewcontroller.md). When the user tries to drag it, [`dismissattempt`](dismissattempt-event.md) fires; neither `beforedismiss` nor `dismiss` fires |

- Readable and writable.
- The default is `false`.
- Converted with `Boolean()` on write.
- Can be changed at any time after the view controller is presented, for example set to `true` after a form is edited and back to `false` after it is saved. Measured: after changing it to `true` once presented, dragging only produces `dismissattempt`.
- No event fires when it changes: only the app's own code can change it.

## Examples

```js
const sheet = new UIViewController();
sheet.isModalInPresentation = true;
sheet.addEventListener('dismissattempt', () => {
  console.log('The user tried to close it, but was stopped');
});
```

**Effect**: After `sheet` is presented, each time the user drags down, the sheet does not close and the console prints one line.

## Corresponding iOS API

`UIViewController.modalInPresentation`. In JS it is named `isModalInPresentation`. It also replaces the synchronous `presentationControllerShouldDismiss:` callback: whether dismissal is allowed is declared in advance, not decided synchronously in a callback.

## See also

- [`dismissattempt`](dismissattempt-event.md)
