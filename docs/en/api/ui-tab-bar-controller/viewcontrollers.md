---
type: reference
native: UITabBarController.viewControllers
---

# `UITabBarController`: `viewControllers` property

The **`viewControllers`** property is the view controllers the tab bar controller manages, in the left-to-right order of the tabs.

## Value

An array of `UIViewController`.

- Readable and writable. Assign directly when you do not need animation; for animation, use [`setViewControllers()`](setviewcontrollers.md).
- Defaults to an empty array. Writing `null` is the same as writing an empty array.
- Reading returns a snapshot at that moment. Pushing into that array does not change the interface; assign the whole array. Each element read back is the same object originally put in.
- The tab bar controller keeps the view controllers in the array, so you do not need to keep them yourself. View controllers that are replaced and not kept by any other variable are reclaimed (verified in the acceptance tests).
- Each tab's appearance comes from the corresponding view controller's [`tabBarItem`](../ui-view-controller/tabbaritem.md).
- No event fires when it changes: only code changes it.

### Invalid values

If the array contains something that is not a view controller, throws `TypeError: viewControllers only accepts UIViewController`. The original view controllers are unchanged.

## Examples

```js
const home = new UIViewController();
const market = new UIViewController();
const tabs = new UITabBarController();
tabs.viewControllers = [home, market];
console.log(tabs.viewControllers.length, tabs.viewControllers[1] === market);
```

**Result**: the console logs `2 true`.

## Corresponding iOS API

`UITabBarController.viewControllers`.

## See also

- [`setViewControllers()`](setviewcontrollers.md)
- [`selectedIndex`](selectedindex.md)
