---
type: reference
native: UITabBarController.selectedIndex
---

# `UITabBarController`: `selectedIndex` property

The **`selectedIndex`** property is the position of the selected tab, counting from 0.

## Value

An integer.

- Readable and writable.
- Defaults to `0` when there are view controllers, and `-1` when there are none. It is also `-1` when the user selects the system's "More" tab.
- It and [`selectedViewController`](selectedviewcontroller.md) are two ways of writing the same thing; changing one changes the other.
- [`tabselect`](tabselect-event.md) fires when the user changes it. **It does not fire when code changes it** (verified by testing).

### Invalid values

Out of range: throws `TypeError: selectedIndex 3 is out of range; there are 3 view controllers`.

## Examples

```js
const home = new UIViewController();
const profile = new UIViewController();
const tabs = new UITabBarController();
tabs.viewControllers = [home, profile];

tabs.selectedIndex = 1;
console.log(tabs.selectedViewController === profile);
```

**Effect**: the interface switches to the second tab. The console logs `true`.

## Corresponding iOS API

`UITabBarController.selectedIndex`. The native `NSNotFound` is `-1` here.

## See also

- [`selectedViewController`](selectedviewcontroller.md)
- [Knowing when the selection changes](../ui-tab-bar-controller.md#knowing-when-the-selection-changes)
