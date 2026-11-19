---
type: reference
native: UITraitCollection.preferredContentSizeCategory
---

# `UITraitCollection`: `preferredContentSizeCategory` property

The **`preferredContentSizeCategory`** property is the text size the user chose in Settings.

## Value

A string, from smallest to largest:

| Value | Meaning |
| --- | --- |
| `'extraSmall'`, `'small'`, `'medium'` | Three levels smaller than the default |
| `'large'` | The default |
| `'extraLarge'`, `'extraExtraLarge'`, `'extraExtraExtraLarge'` | Three levels larger than the default |
| `'accessibilityMedium'`, `'accessibilityLarge'`, `'accessibilityExtraLarge'`, `'accessibilityExtraExtraLarge'`, `'accessibilityExtraExtraExtraLarge'` | Five even larger levels available only under Accessibility |
| `'unspecified'` | Not specified |

- When the user changes the text size while the app is running, views, view controllers, and scenes fire `traitchange`; this has been checked in the simulator.
- The largest level switched to in the simulator was `extraExtraLarge`. The levels starting with `accessibility` are **not verified in the simulator**.
- To change the text size in the simulator, run `xcrun simctl ui booted content_size extra-extra-large` in Terminal.

- Read-only. Assigning to it throws `TypeError`.
- It holds the value at the moment `traitCollection` was read and doesn't change afterwards. When the environment changes, views, view controllers, and scenes fire [`traitchange`](../ui-trait-collection.md#the-traitchange-event); read `traitCollection` again for the new value.

## Examples

```js
const view = new UIView();
const size = view.traitCollection.preferredContentSizeCategory;
const large = size.startsWith('accessibility');
console.log(size, large ? 'Use a single-column layout' : 'Use a two-column layout');
```

**Result**: when the user hasn't changed the text size, prints `large Use a two-column layout`.

## Corresponding iOS API

`UITraitCollection.preferredContentSizeCategory`.

## See also

- [`UITraitCollection`](../ui-trait-collection.md)
- [`UIFont.preferredFontForTextStyle()`](../ui-font/preferredfontfortextstyle.md): getting font sizes based on this setting
