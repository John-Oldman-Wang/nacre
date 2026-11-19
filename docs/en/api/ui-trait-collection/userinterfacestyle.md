---
type: reference
native: UITraitCollection.userInterfaceStyle
---

# `UITraitCollection`: `userInterfaceStyle` property

The **`userInterfaceStyle`** property indicates whether the UI is currently dark or light.

## Value

A string:

| Value | Meaning |
| --- | --- |
| `'light'` | Light |
| `'dark'` | Dark |
| `'unspecified'` | Not specified. Never encountered when reading from `traitCollection` (verified by testing); it only appears on `overrideUserInterfaceStyle` |

- Reading from `traitCollection` was measured to give only `'light'` and `'dark'`, so anything that isn't `'dark'` is light.
- On a scene you read the system setting; on a view you read the appearance the view actually displays, which may have been forced by `overrideUserInterfaceStyle`. See [Forcing dark or light](../ui-trait-collection.md#forcing-dark-or-light-overrideuserinterfacestyle).
- A view not yet added to the UI can also read it; it's the current system setting.

- Read-only. Assigning to it throws `TypeError`.
- It holds the value at the moment `traitCollection` was read and doesn't change afterwards. When the environment changes, views, view controllers, and scenes fire [`traitchange`](../ui-trait-collection.md#the-traitchange-event); read `traitCollection` again for the new value.

## Examples

```js
const view = new UIView();
const dark = view.traitCollection.userInterfaceStyle === 'dark';
console.log(dark ? 'Dark' : 'Light');
```

**Result**: prints `Dark` when the system is dark, and `Light` otherwise.

## Corresponding iOS API

`UITraitCollection.userInterfaceStyle`.

## See also

- [`UITraitCollection`](../ui-trait-collection.md)
- [Supporting Dark Mode](../../guides/dark-mode.md)
