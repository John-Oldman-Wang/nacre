---
type: reference
native: UIViewController.tabBarController
---

# `UIViewController`: `tabBarController` property

The **`tabBarController`** property is the [`UITabBarController`](../ui-tab-bar-controller.md) this view controller is in.

## Value

A `UITabBarController`, or `null`.

- Read-only; assigning to it throws `TypeError`.
- The default is `null`: the view controller is not in any tab bar controller.
- Points to the tab bar controller after the view controller is put into its `viewControllers`.
- No event fires when it changes: it only changes when the app's code changes the tab bar's view controllers.

## Examples

```js
const home = new UIViewController();
console.log(home.tabBarController);

const tabs = new UITabBarController();
tabs.viewControllers = [home];
console.log(home.tabBarController === tabs);
```

**Result**: The console prints `null`, then `true`. **Not verified in the simulator.**

## Corresponding iOS API

`UIViewController.tabBarController`.

## See also

- [`tabBarItem`](tabbaritem.md)
- [`navigationController`](navigationcontroller.md)
