---
type: reference
native: UITextView.textColor
---

# `UITextView`: `textColor` property

The **`textColor`** property is the color of the text.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable.
- The default value is `'label'`.
- After writing `null`, it reads as `null`.
- How values look on screen is **not verified in the simulator**.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing an unrecognized color string doesn't throw: the console logs a warning and the previous color is kept. See [Colors](../ui-color.md#invalid-values-warn-instead-of-throwing).

## Examples

```js
const input = new UITextView();
input.textColor = 'systemBlue';
console.log(input.textColor);
```

**Effect**: the console logs `systemBlue`. The text is blue.

## Corresponding iOS API

`UITextView.textColor`. `UIColor.labelColor` is written `'label'`.

## See also

- [Colors](../ui-color.md)
