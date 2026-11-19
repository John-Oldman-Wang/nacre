---
type: reference
native: "-[UIAdaptivePresentationControllerDelegate presentationControllerDidAttemptToDismiss:]"
---

# `UIViewController`: `dismissattempt` event

The **`dismissattempt`** event fires when the user tries to drag a modal sheet down but [`isModalInPresentation`](ismodalinpresentation.md) is `true`, so the sheet does not close. It fires on **the presented view controller**.

## Syntax

```
sheet.addEventListener('dismissattempt', (event) => { })
```

## Event object

`Event`. It has only the two fields `type` and `target`; `target` is the presented view controller.

Not cancelable.

## When it fires

- While `isModalInPresentation` is `true`, once each time the user drags down. Neither [`beforedismiss`](beforedismiss-event.md) nor [`dismiss`](dismiss-event.md) fires.
- Not when the presented view controller is a `UINavigationController`; not on [`UIAlertController`](../ui-alert-controller.md) either.

This is a good moment to tell the user there are unsaved changes.

## Examples

```js
const sheet = new UIViewController();
sheet.isModalInPresentation = true;
sheet.addEventListener('dismissattempt', () => {
  console.log('The user tried to close it, but was stopped');
});
```

**Effect**: After `sheet` is presented, the console prints one line each time the user drags down.

## Corresponding iOS API

`presentationControllerDidAttemptToDismiss:` on `UIAdaptivePresentationControllerDelegate`.

## See also

- [`isModalInPresentation`](ismodalinpresentation.md)
