---
type: reference
native: UINavigationItem.backButtonTitle
---

# `UINavigationItem`: `backButtonTitle` property

The **`backButtonTitle`** property is the text on the **next** view controller's back button. It changes nothing on this view controller's own navigation bar.

## Value

A string, or `null`.

- Readable and writable.
- The default is `null`; the next view controller's back button uses this view controller's title.
- Values that are not strings are converted with `String()`; writing `null` or `undefined` gives `null`.
- Reading and writing were checked in the acceptance tests; how the text on the button looks on screen is **not verified in the simulator**.
- No event fires when it changes: only code changes it.

To change the text on the button that "goes back from the detail view controller", change the list view controller's `backButtonTitle`.

## Examples

```js
const home = new UIViewController();
home.title = 'Home';
home.navigationItem.backButtonTitle = 'Back';
console.log(home.navigationItem.backButtonTitle);
```

**Result**: The console prints `Back`. The next view controller entered from Home has a back button that says "Back" instead of "Home". The title on Home's own navigation bar is still "Home".

## Corresponding iOS API

`UINavigationItem.backButtonTitle`.

## See also

- [The system adds the back button](../ui-navigation-item.md#the-system-adds-the-back-button)
- [`hidesBackButton`](hidesbackbutton.md)
