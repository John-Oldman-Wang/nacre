---
type: reference
native: UIViewController.navigationController
---

# `UIViewController`: `navigationController` property

The **`navigationController`** property is the navigation controller this view controller is in. A "navigation stack" is a stack of view controllers managed by [`UINavigationController`](../ui-navigation-controller.md): a pushed view controller slides in from the right, and going back pops it.

## Value

A [`UINavigationController`](../ui-navigation-controller.md), or `null`.

- Read-only; assigning to it throws `TypeError`.
- The default is `null`: the view controller is not on any navigation stack.
- After the view controller is pushed onto a navigation stack, it points to that navigation controller; after it is popped, it goes back to `null`.
- It fires no event of its own when it changes. Learn when it changes from the navigation controller's [`beforeshow`](../ui-navigation-controller/beforeshow-event.md) and [`show`](../ui-navigation-controller/show-event.md) events.

## Examples

```js
const detail = new UIViewController();
console.log(detail.navigationController);

const nav = new UINavigationController(detail);
console.log(detail.navigationController === nav);
console.log(detail.parentViewController === nav);
```

**Result**: The console prints `null`, `true`, `true` in order. Nothing changes on screen, because `nav` is not shown.

The type is "possibly `null`", so check it before use:

```js
const page = new UIViewController();
const stack = page.navigationController;
if (stack) {
  stack.popViewController({ animated: true });
}
```

**Effect**: When `page` is on a navigation stack, goes back to the previous view controller. Otherwise does nothing.

## Corresponding iOS API

`UIViewController.navigationController`.

## See also

- [`parentViewController`](parentviewcontroller.md)
- [`UINavigationController`](../ui-navigation-controller.md): push, pop, back button
