---
type: reference
native: "-[UIAdaptivePresentationControllerDelegate presentationControllerWillDismiss:]"
---

# `UIViewController`: `beforedismiss` event

The **`beforedismiss`** event fires when the user drags a modal sheet down and the sheet is about to close. It fires on **the presented view controller**.

## Syntax

```
sheet.addEventListener('beforedismiss', (event) => { })
```

## Event object

`Event`. It has only the two fields `type` and `target`; `target` is the presented view controller.

Not cancelable; `preventDefault()` has no effect. To stop the user from dismissing, use [`isModalInPresentation`](ismodalinpresentation.md).

## When it fires

- When the user drags the sheet away, followed by [`dismiss`](dismiss-event.md) (order verified by testing).
- Not when code calls [`dismissViewController()`](dismissviewcontroller.md).
- Not when `isModalInPresentation` is `true`; [`dismissattempt`](dismissattempt-event.md) fires instead.
- Whether it fires when the user drags halfway and lets the sheet snap back is **not verified in the simulator**. So put cleanup in `dismiss`, not here.
- Not when the presented view controller is a `UINavigationController`; not on [`UIAlertController`](../ui-alert-controller.md) either.
- The listener can be registered before the view controller is presented.

## Examples

```js
const sheet = new UIViewController();
sheet.addEventListener('beforedismiss', () => {
  console.log('About to close');
});
sheet.addEventListener('dismiss', () => {
  console.log('Closed');
});
```

**Effect**: After `sheet` is presented, when the user drags the sheet down, the console prints `About to close`, then `Closed`.

## Corresponding iOS API

`presentationControllerWillDismiss:` on `UIAdaptivePresentationControllerDelegate`. Natively it is on `vc.presentationController.delegate`; here it is an event on the presented view controller itself.

## See also

- [Dismissal events](../ui-view-controller.md#dismissal-events)
