---
type: reference
native: UINavigationControllerEvent.viewController
---

# `UINavigationControllerEvent`: `viewController` property

The **`viewController`** property is the page about to be shown, or just shown.

## Value

A [`UIViewController`](../ui-view-controller.md).

- Read-only. Assigning to it throws `TypeError`.
- In `beforeshow`, use it to tell which page is about to be shown; don't use `nav.topViewController`.
- In `show`, it is the same object as `nav.topViewController` (tested).
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const home = new UIViewController();
const nav = new UINavigationController(home);
nav.addEventListener('show', (e) => {
  console.log(e.viewController === home ? '回到了首页' : '进入了下一页');
});
```

**Effect**: after each switch, prints whether the page now shown is the home page or another one.

## Corresponding iOS API

The `viewController` parameter of `navigationController:willShowViewController:animated:` and `navigationController:didShowViewController:animated:`.

## See also

- [`UINavigationControllerEvent`](../ui-navigation-controller-event.md)
