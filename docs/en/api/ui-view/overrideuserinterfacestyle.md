---
type: reference
native: UIView.overrideUserInterfaceStyle
---

# `UIView`: `overrideUserInterfaceStyle` property

The **`overrideUserInterfaceStyle`** property forces this view and its subviews to use light or dark appearance, regardless of the system setting.

## Value

A string, one of the following three:

| Value | Effect |
| --- | --- |
| `'unspecified'` | Follows the enclosing view |
| `'light'` | Forces light |
| `'dark'` | Forces dark |

- Readable and writable.
- The default is `'unspecified'`.
- After you write it, this property reads back the new value immediately, but [`traitCollection`](traitcollection.md) updates later and fires [`traitchange`](traitchange-event.md) when it does. Put code that depends on the new value in the `traitchange` callback, not on the line after the assignment. See [The override doesn't take effect immediately](../ui-trait-collection.md#forcing-doesnt-take-effect-immediately).
- For a view not in a window, the override isn't reflected in `traitCollection`. See [Traits](../ui-trait-collection.md#forcing-doesnt-take-effect-immediately).

### Invalid values

Writing a value not in the table doesn't throw. A warning is logged, `[Nacre] overrideUserInterfaceStyle has no value "night"; expected one of: unspecified / light / dark, ignored`, and the property keeps its previous value.

## Examples

```js
const card = new UIView();
card.backgroundColor = 'systemBackground';
card.overrideUserInterfaceStyle = 'dark';
```

**Effect**: `card` and the views inside it display in dark mode, and `systemBackground` appears dark.

## Corresponding iOS API

`UIView.overrideUserInterfaceStyle`. `UIUserInterfaceStyleDark` is written `'dark'`.

## See also

- [Traits](../ui-trait-collection.md)
- [`traitCollection`](traitcollection.md)
