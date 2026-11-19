---
type: reference
native: UINavigationItem.titleView
---

# `UINavigationItem`: `titleView` property

The **`titleView`** property is a view shown in the center of the navigation bar in place of the title text.

## Value

A [`UIView`](../ui-view.md), or `null`.

- Readable and writable.
- The default is `null`; the center of the navigation bar shows [`title`](title.md).
- What you read back is the same object you wrote.
- After it is set, the view controller's `title` is still used: it is still what the next view controller's back button shows.
- How it looks on screen is **not verified in the simulator**.
- No event fires when it changes: only code changes it.

### Invalid values

Writing something that is not a view throws `TypeError: titleView needs a UIView or null`.

## Examples

```js
const page = new UIViewController();
const logo = new UILabel();
logo.text = 'Nacre';
logo.font = UIFont.systemFontOfSize(20, { weight: 'bold' });

page.navigationItem.titleView = logo;
console.log(page.navigationItem.titleView === logo);
```

**Result**: The console prints `true`. The center of the navigation bar shows this [`UILabel`](../ui-label.md) instead of the `title` text. Writing `null` shows `title` again.

## Corresponding iOS API

`UINavigationItem.titleView`.

## See also

- [`customView`](../ui-bar-button-item/customview.md): putting your own views on either side of the navigation bar
