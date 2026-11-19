---
type: reference
native: UIViewController.navigationItem
---

# `UIViewController`: `navigationItem` property

The **`navigationItem`** property is this view controller's configuration for the navigation bar: the title, subtitle, back button text, and buttons on the left and right.

## Value

A [`UINavigationItem`](../ui-navigation-item.md).

- Read-only; assigning to it throws `TypeError`. Change the configuration by changing its properties.
- Always has a value, created automatically by the system. There is one per view controller, and every read returns the same object.
- Can be read and written even when the view controller is not on a navigation stack. The settings are kept and shown when the view controller enters a navigation stack and becomes the top.

## Examples

```js
const page = new UIViewController();
page.title = 'Edit';
page.navigationItem.rightBarButtonItems = [new UIBarButtonItem({ title: 'Save' })];
console.log(page.navigationItem === page.navigationItem);
```

**Result**: The console prints `true`. After the view controller is pushed onto a navigation stack, "Save" appears on the right of the navigation bar.

## Corresponding iOS API

`UIViewController.navigationItem`.

## See also

- [`UINavigationItem`](../ui-navigation-item.md)
- [Putting buttons and a title in the navigation bar](../../guides/bar-buttons.md)
