---
type: reference
native: UINavigationItem.rightBarButtonItems
---

# `UINavigationItem`: `rightBarButtonItems` property

The **`rightBarButtonItems`** property is the buttons on the right of the navigation bar.

## Value

An array of [`UIBarButtonItem`](../ui-bar-button-item.md).

- Readable and writable.
- The default is an empty array. Writing an empty array removes all buttons.
- What you read is a snapshot at that moment. `push`ing into the array does not change the navigation bar; assign the whole array. Each element read is the same object that was put in.
- The first item is rightmost, and the rest are arranged to the left in order. **The order is not verified in the simulator.**
- No event fires when it changes: only code changes it.

### Invalid values

Something in the array is not a `UIBarButtonItem`: throws `TypeError: bar button items only accept UIBarButtonItem`. The existing buttons are unchanged.

## Examples

```js
const page = new UIViewController();
const edit = new UIBarButtonItem({ title: 'Edit' });
const more = UIBarButtonItem.systemItem('action');
page.navigationItem.rightBarButtonItems = [edit, more];

console.log(page.navigationItem.rightBarButtonItems.length);
console.log(page.navigationItem.rightBarButtonItems[0] === edit);

page.navigationItem.rightBarButtonItems = [];
console.log(page.navigationItem.rightBarButtonItems.length);
```

**Result**: The console prints `2`, `true`, `0` in order.

## Corresponding iOS API

`UINavigationItem.rightBarButtonItems`. The single `rightBarButtonItem` is written as an array with one element: `rightBarButtonItems = [a]`.

## See also

- [`leftBarButtonItems`](leftbarbuttonitems.md)
- [`UIBarButtonItem`](../ui-bar-button-item.md)
