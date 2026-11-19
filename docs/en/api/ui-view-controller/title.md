---
type: reference
native: UIViewController.title
---

# `UIViewController`: `title` property

The **`title`** property is the view controller's title. When the view controller is at the top of the navigation stack, it is shown in the center of the navigation bar; when the next view controller is on top, it is shown on the back button. When the view controller is put in a tab bar, the tab the system creates automatically uses it too.

## Value

A string, or `null`.

- Readable and writable.
- The default is `null`. **Not verified in the simulator.**
- Converted with `String()` on write; `5` becomes `'5'`. Writing `null` or `undefined` gives `null`.
- When the view controller is not on a navigation stack, there is no navigation bar and the title is not shown anywhere.
- No event fires when it changes: only the app's own code can change it.

> **Note:** Writing `page.title` also changes [`page.navigationItem.title`](../ui-navigation-item/title.md). The reverse is not true: after writing `page.navigationItem.title`, `page.title` is unchanged. Use only one of the two properties; `page.title` is recommended. See [Two ways to set the title](../ui-navigation-item.md#two-ways-to-set-the-title).

On [`UIAlertController`](../ui-alert-controller.md), this property is the alert's title.

## Examples

```js
const page = new UIViewController();
page.title = 'Settings';
console.log(page.title, page.navigationItem.title);
```

**Result**: The console prints `Settings Settings`. When the view controller is on a navigation stack, "Settings" is shown in the center of the navigation bar; after going from it to the next view controller, the next one's back button also shows "Settings".

## Corresponding iOS API

`UIViewController.title`.

## See also

- [`navigationItem`](navigationitem.md)
- [`tabBarItem`](tabbaritem.md)
