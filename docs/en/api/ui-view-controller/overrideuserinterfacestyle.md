---
type: reference
native: UIViewController.overrideUserInterfaceStyle
---

# `UIViewController`: `overrideUserInterfaceStyle` property

The **`overrideUserInterfaceStyle`** property forces this view controller and everything in it to use light or dark, regardless of the system setting.

## Value

A string:

| Value | Effect |
| --- | --- |
| `'unspecified'` | Not forced; follows the enclosing environment |
| `'light'` | Uses light |
| `'dark'` | Uses dark |

- Readable and writable.
- The default is `'unspecified'`.
- After a change, this view controller's [`traitCollection`](traitcollection.md) changes accordingly and [`traitchange`](traitchange-event.md) fires.
- For invalid values and other things to watch for, see [Appearance traits](../ui-trait-collection.md).

## Examples

```js
const page = new UIViewController();
page.view.backgroundColor = 'systemBackground';
page.overrideUserInterfaceStyle = 'dark';
console.log(page.overrideUserInterfaceStyle);
```

**Result**: The console prints `dark`. When the view controller is shown, its background is black whether or not the system is in dark mode.

## Corresponding iOS API

`UIViewController.overrideUserInterfaceStyle`. `UIUserInterfaceStyleDark` is written `'dark'`, and likewise for the rest.

## See also

- [Appearance traits](../ui-trait-collection.md)
