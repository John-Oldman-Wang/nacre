---
type: reference
native: UIToolbar.tintColor
---

# `UIToolbar`: `tintColor` property

The **`tintColor`** property is the color of the text and icons of the buttons on the toolbar.

## Value

A [color](../ui-color.md) string.

- Readable and writable.
- Always has a value when read. If never set, it's the color inherited from the enclosing view.
- Writing `null` restores the inherited color.
- Applies to all buttons on the toolbar.
- No change event: only the app's own code changes it.

### Invalid values

Writing an invalid color doesn't throw: the console prints a warning and the value stays unchanged. See [Colors](../ui-color.md#invalid-values-warn-instead-of-throwing).

## Examples

```js
const toolbar = new UIToolbar();
toolbar.items = [UIBarButtonItem.systemItem('add')];
toolbar.tintColor = 'systemRed';
```

**Effect**: the plus turns red. **Not verified in the simulator.**

## Corresponding iOS API

`UIToolbar.tintColor`. Colors are written as strings; see [Colors](../ui-color.md).

## See also

- [`barTintColor`](bartintcolor.md): the bar's own background color
