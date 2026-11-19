---
type: reference
native: UIViewController.presentingViewController
---

# `UIViewController`: `presentingViewController` property

The **`presentingViewController`** property is the view controller that presented this one.

## Value

A `UIViewController`, or `null`.

- Read-only; assigning to it throws `TypeError`.
- The default is `null`: not presented modally.
- Becomes the presenter when presented, and goes back to `null` after dismissal. There is no dedicated change event; see [`presentedViewController`](presentedviewcontroller.md).

> **Note:** After `a.presentViewController(b)`, `b.presentingViewController` is not necessarily `a`. When `a` is on a navigation stack, it is the `UINavigationController` that `a` is in: the system hands the presentation to the nearest container. Whether it is `a` when `a` is in no container is **not verified in the simulator**.

## Examples

```js
const host = new UIViewController();
const nav = new UINavigationController(host);
const modal = new UIViewController();

async function show() {
  await host.presentViewController(modal, { animated: false });
  console.log(host.presentedViewController === modal);
  console.log(modal.presentingViewController === host);
  console.log(modal.presentingViewController === nav);
}
```

**Result**: Calling `show()` while `nav` is the window's root view controller prints `true`, `false`, `true` in order.

Checking whether a view controller is presented modally:

```js
const sheet = new UIViewController();
if (sheet.presentingViewController) {
  console.log('sheet is being presented modally');
} else {
  console.log('sheet is not presented modally');
}
```

**Result**: Before `sheet` is presented, prints `sheet is not presented modally`. After it is presented, prints `sheet is being presented modally`.

## Corresponding iOS API

`UIViewController.presentingViewController`.

## See also

- [Who presented whom](../ui-view-controller.md#who-presented-whom)
