---
type: reference
native: UINavigationItem.leftBarButtonItems
---

# `UINavigationItem`: `leftBarButtonItems` property

The **`leftBarButtonItems`** property is the buttons on the left of the navigation bar.

## Value

An array of [`UIBarButtonItem`](../ui-bar-button-item.md).

- Readable and writable.
- The default is an empty array.
- What you read is a snapshot at that moment. `push`ing into the array does not change the navigation bar; assign the whole array. Each element read is the same object that was put in.
- The first item is leftmost, and the rest are arranged to the right in order. **The order is not verified in the simulator.**
- When there are buttons, the back button is not shown and swipe back is unavailable; see [Left buttons and going back](../ui-navigation-item.md#left-buttons-and-going-back). **Not verified in the simulator.**
- No event fires when it changes: only code changes it.

Left buttons suit cases with no previous view controller, such as "Cancel" in the top left of a modally presented view controller. For view controllers on a navigation stack, prefer putting buttons on the right.

### Invalid values

Something in the array is not a `UIBarButtonItem`: throws `TypeError: bar button items only accept UIBarButtonItem`. The existing buttons are unchanged.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
const page = new UIViewController();
const back = new UIBarButtonItem({ title: 'Cancel' });
back.addEventListener('click', () => {
  nav.popViewController({ animated: true });
});
page.navigationItem.leftBarButtonItems = [back];
nav.pushViewController(page, { animated: false });
```

**Effect**: The left of the navigation bar shows "Cancel", with no system back button. Tapping "Cancel" goes back to the previous view controller. **Not verified in the simulator.**

## Corresponding iOS API

`UINavigationItem.leftBarButtonItems`. The single `leftBarButtonItem` is written as an array with one element.

## See also

- [`rightBarButtonItems`](rightbarbuttonitems.md)
- [`hidesBackButton`](hidesbackbutton.md)
