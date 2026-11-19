---
type: reference
native: UINavigationItem.title
---

# `UINavigationItem`: `title` property

The **`title`** property is the text shown in the center of the navigation bar.

## Value

A string, or `null`.

- Readable and writable.
- The default is the view controller's [`title`](../ui-view-controller/title.md).
- Values that are not strings are converted with `String()`; writing `null` or `undefined` gives `null`.
- When [`titleView`](titleview.md) is set, the center of the navigation bar shows that view instead of this text.
- No event fires when it changes: only code changes it.

It and the view controller's `title` are two separate pieces of data, synced in one direction only: writing the view controller's `title` also changes it; writing it does not change the view controller's `title`; after it is written as `null`, it does not fall back to the view controller's `title`. See [Two ways to set the title](../ui-navigation-item.md#two-ways-to-set-the-title).

## Examples

```js
const p = new UIViewController();

p.title = 'Home';
console.log(p.navigationItem.title);

p.navigationItem.title = 'Changed';
console.log(p.title);
console.log(p.navigationItem.title);

p.navigationItem.title = null;
console.log(p.navigationItem.title);

p.title = 'Home';
console.log(p.navigationItem.title);
```

**Result**: The console prints `Home`, `Home`, `Changed`, `null`, `Home` in order.

## Corresponding iOS API

`UINavigationItem.title`.

## See also

- [`UIViewController.title`](../ui-view-controller/title.md): the recommended way to set the title
- [`backButtonTitle`](backbuttontitle.md): use it when you only want the back button's text to differ
