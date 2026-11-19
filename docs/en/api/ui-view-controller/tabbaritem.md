---
type: reference
native: UIViewController.tabBarItem
---

# `UIViewController`: `tabBarItem` property

The **`tabBarItem`** property is this view controller's item in the bottom tab bar: title, icon, and badge.

## Value

A [`UITabBarItem`](../ui-tab-bar-item.md).

- Readable and writable.
- The default is one the system creates automatically: its title is the view controller's [`title`](title.md), and it has no icon.
- Writing `null` does not clear it; it makes the system create a new one automatically. So reading it never gives `null`.
- Can be set even when the view controller is not in a tab bar; it shows once the view controller is put into a [`UITabBarController`](../ui-tab-bar-controller.md).
- No event fires when it changes: only the app's own code can change it.

### Invalid values

Writing something that is not a `UITabBarItem` throws `TypeError: tabBarItem needs a UITabBarItem or null`.

## Examples

```js
const home = new UIViewController();
home.tabBarItem = new UITabBarItem({
  title: 'Home',
  image: UIImage.systemImageNamed('house'),
});
home.tabBarItem.badgeValue = '3';
console.log(home.tabBarItem.title);
```

**Result**: The console prints `Home`. After the view controller is put into a tab bar, its item shows a house icon, "Home", and a badge of 3.

## Corresponding iOS API

`UIViewController.tabBarItem`.

## See also

- [`UITabBarItem`](../ui-tab-bar-item.md)
- [`tabBarController`](tabbarcontroller.md)
