---
type: reference
native: UIViewController.presentedViewController
---

# `UIViewController`: `presentedViewController` property

The **`presentedViewController`** property is the modal view controller this view controller presented.

## Value

A `UIViewController`, or `null`.

- Read-only; assigning to it throws `TypeError`.
- The default is `null`: nothing is presented.
- Becomes the presented view controller immediately after calling [`presentViewController()`](presentviewcontroller.md); goes back to `null` after [`dismissViewController()`](dismissviewcontroller.md) dismisses it and the animation ends.
- There is no dedicated change event. Changes caused by code are known to that code; when the user drags a modal view controller away, learn about it from [`dismiss`](dismiss-event.md) on the presented view controller.

## Examples

```js
const page = new UIViewController();
const alert = UIAlertController.alertControllerWithTitle('Syncing…', {
  preferredStyle: 'alert',
});

async function show() {
  await page.presentViewController(alert, { animated: true });
  console.log(page.presentedViewController === alert);
}
```

**Effect**: Calling `show()` while `page` is on screen presents the alert, and the console prints `true`.

## Corresponding iOS API

`UIViewController.presentedViewController`.

## See also

- [`presentingViewController`](presentingviewcontroller.md)
