---
type: reference
native: UIStackView.spacing
---

# `UIStackView`: `spacing` property

The **`spacing`** property is the spacing between two adjacent arranged subviews.

## Value

A number (in [pt](../units.md)), or the string `'system'`.

- Readable and writable.
- The default is `0`.
- Spacing is only added between adjacent items; there is none before the first item or after the last.
- `'system'` means use the system's recommended spacing. It reads back as the string `'system'`; you cannot read the actual number of points. **How large the spacing is on screen is not verified in the simulator.**
- Spacing does not scale with the font size.
- Writing a negative number makes adjacent items overlap. **Not verified in the simulator.**
- Accepts strings that convert to numbers; `'12'` has the same effect as `12`.
- For a custom spacing after one item, use [`setCustomSpacing()`](setcustomspacing.md), which takes precedence over this property.
- No change notification. Only the app's own code can change it.

What `spacing` means depends on [`distribution`](distribution.md):

| `distribution` | What `spacing` means |
| --- | --- |
| `'fill'`, `'fillEqually'`, `'fillProportionally'` | The spacing between adjacent items is exactly this value |
| `'equalSpacing'`, `'equalCentering'` | The spacing between adjacent items is at least this value |

### Invalid values

- Writing a string other than a number or `'system'` does not throw. The console prints a warning `[Nacre] spacing has no value "default"; expected one of: a number / "system", ignored`, and `spacing` keeps its previous value.
- Writing another value that cannot be converted to a number (`undefined`, an object) throws `TypeError: spacing must be a finite number, got undefined`, and `spacing` keeps its previous value.

> **Note:** `spacing` does not accept `'default'`. `'default'` can only be used in [`setCustomSpacing()`](setcustomspacing.md), to remove a custom setting.

## Examples

```js
const row = new UIStackView();
row.spacing = 24;
console.log(row.spacing);

row.spacing = 'system';
console.log(row.spacing);
```

**Result**: Prints `24`, then `system`.

## Corresponding iOS API

`UIStackView.spacing`. `UIStackViewSpacingUseSystem` is written `'system'`.

## See also

- [`setCustomSpacing()`](setcustomspacing.md): the spacing after a single item
- [Enums](../enums.md): why the system's sentinel constants are written as strings
