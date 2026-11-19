---
type: reference
native: UINavigationItem.subtitle
---

# `UINavigationItem`: `subtitle` property

The **`subtitle`** property is a line of small text below the navigation bar's title.

## Value

A string, or `null`.

- Readable and writable.
- The default is `null`: no subtitle.
- Values that are not strings are converted with `String()`; writing `null` or `undefined` gives `null`.
- How it looks on screen is **not verified in the simulator**.
- No event fires when it changes: only code changes it.

## Examples

```js
const page = new UIViewController();
page.title = 'Inbox';
page.navigationItem.subtitle = '12 items';
console.log(page.navigationItem.subtitle);
```

**Result**: The console prints `12 items`. While the view controller is at the top of the navigation stack, a line of small text "12 items" appears below the title; **how it looks is not verified in the simulator**. Write `null` to remove it.

## Corresponding iOS API

`UINavigationItem.subtitle` (iOS 26 and later).

## See also

- [`title`](title.md)
