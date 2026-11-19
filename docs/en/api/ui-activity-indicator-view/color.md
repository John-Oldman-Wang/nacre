---
type: reference
native: UIActivityIndicatorView.color
---

# `UIActivityIndicatorView`: `color` property

The **`color`** property is the color of the activity indicator.

## Value

A [color](../ui-color.md) string.

- Readable and writable.
- The default is `'secondaryLabel'`, a gray that changes with light and dark mode.
- Reading it always returns a string, never `null`. A valid color you write reads back exactly as written.
- Writing `null` restores the default color; reading afterward returns `'secondaryLabel'`.
- Changing the style doesn't change the color.
- There's no change event. Only the app's own code changes it.
- What the color looks like on screen is **not verified in the simulator**.

### Invalid values

Writing an invalid color doesn't throw. The console prints a warning, and the color keeps its previous value; see [Colors](../ui-color.md#invalid-values-warn-instead-of-throwing).

## Examples

```js
const spinner = new UIActivityIndicatorView();
spinner.color = '#FF3B30';
console.log(spinner.color);
spinner.color = null;
console.log(spinner.color);
```

**Result**: First prints `#FF3B30`, and the indicator is red. After writing `null` it prints `secondaryLabel`, and the indicator returns to the default gray.

For a white indicator on a dark background, write `spinner.color = 'white'`.

## Corresponding iOS API

`UIActivityIndicatorView.color`. In ObjC it's a `UIColor` object; here it's a color string.

## See also

- [Colors](../ui-color.md): how to write color strings
