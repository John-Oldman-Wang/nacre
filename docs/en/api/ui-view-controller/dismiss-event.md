---
type: reference
native: "-[UIAdaptivePresentationControllerDelegate presentationControllerDidDismiss:]"
---

# `UIViewController`: `dismiss` event

The **`dismiss`** event fires when the user has dragged a modal sheet away and the dismissal is complete. It fires on **the presented view controller**.

## Syntax

```
sheet.addEventListener('dismiss', (event) => { })
```

## Event object

`Event`. It has only the two fields `type` and `target`; `target` is the presented view controller.

Not cancelable.

## When it fires

- After the user drags the sheet down and the dismissal completes, after [`beforedismiss`](beforedismiss-event.md).
- **Not when code calls [`dismissViewController()`](dismissviewcontroller.md)** (verified by testing: none of the three dismissal events was received). For dismissal by code, put cleanup after awaiting the returned Promise.
- Not when the user drags halfway and lets the sheet snap back; the sheet did not close.
- Not when the presented view controller is a `UINavigationController`; not on [`UIAlertController`](../ui-alert-controller.md) either.
- The listener can be registered before the view controller is presented.

## Examples

```js
const sheet = new UIViewController();
sheet.addEventListener('dismiss', (event) => {
  console.log(event.type, event.target === sheet);
});
```

**Effect**: After `sheet` is presented, when the user drags the sheet down, the console prints `dismiss true`.

For sharing one piece of cleanup between both ways of dismissing, see the guide [Presenting a modal page](../../guides/modal-pages.md#organizing-how-a-modal-view-controller-opens-and-closes).

## Corresponding iOS API

`presentationControllerDidDismiss:` on `UIAdaptivePresentationControllerDelegate`.

## See also

- [Dismissal events](../ui-view-controller.md#dismissal-events)
