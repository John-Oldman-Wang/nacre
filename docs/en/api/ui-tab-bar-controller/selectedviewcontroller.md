---
type: reference
native: UITabBarController.selectedViewController
---

# `UITabBarController`: `selectedViewController` property

The **`selectedViewController`** property is the selected view controller.

## Value

A `UIViewController`, or `null`.

- Readable and writable. The value written must be one of [`viewControllers`](viewcontrollers.md).
- Defaults to the first view controller; `null` when there are none.
- It and [`selectedIndex`](selectedindex.md) are two ways of writing the same thing; changing one changes the other.
- [`tabselect`](tabselect-event.md) fires when the user changes it. **It does not fire when code changes it** (verified by testing).

### Invalid values

Writing a view controller that is not in `viewControllers` throws `TypeError: selectedViewController must be one of this tab bar controller's viewControllers`.

## Examples

```js
const home = new UIViewController();
const profile = new UIViewController();
const tabs = new UITabBarController();
tabs.viewControllers = [home, profile];

tabs.selectedViewController = profile;
console.log(tabs.selectedIndex);
```

**Result**: the interface switches to the second tab. The console logs `1`.

## Corresponding iOS API

`UITabBarController.selectedViewController`.

## See also

- [`selectedIndex`](selectedindex.md)
