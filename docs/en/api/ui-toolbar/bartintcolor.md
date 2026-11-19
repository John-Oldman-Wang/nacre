---
type: reference
native: UIToolbar.barTintColor
---

# `UIToolbar`: `barTintColor` property

The **`barTintColor`** property is the toolbar's own background color.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable.
- Defaults to `null`, meaning the system background is used.
- Writing `null` restores the system background.
- No change event: only the app's own code changes it.

### Invalid values

Writing an invalid color doesn't throw: the console prints a warning and the value stays unchanged. See [Colors](../ui-color.md#invalid-values-warn-instead-of-throwing).

## Examples

```js
const toolbar = new UIToolbar();
toolbar.barTintColor = '#1C1C1E';
```

**Effect**: the bar's background turns dark gray. **Whether this property still changes what's drawn under the iOS 26 interface style is not verified in the simulator.**

## Corresponding iOS API

`UIToolbar.barTintColor`.

## See also

- [`tintColor`](tintcolor.md): the button color
- [`isTranslucent`](istranslucent.md)
