---
type: reference
native: UITabBarControllerEvent.viewController
---

# `UITabBarControllerEvent`: `viewController` property

The **`viewController`** property is the page the user selected.

## Value

A [`UIViewController`](../ui-view-controller.md), one of the tab bar controller's `viewControllers`.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const home = new UIViewController();
const tabs = new UITabBarController();
tabs.viewControllers = [home, new UIViewController()];
tabs.addEventListener('tabselect', (e) => {
  console.log(e.viewController === home ? '首页' : '别的页');
});
```

**Effect**: when the user taps a tab to switch, prints whether the home page was selected.

## Corresponding iOS API

The `viewController` parameter of `tabBarController:didSelectViewController:`.

## See also

- [`UITabBarControllerEvent`](../ui-tab-bar-controller-event.md)
