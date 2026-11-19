---
type: reference
native: UITextField.placeholder
---

# `UITextField`: `placeholder` property

The **`placeholder`** property is the hint shown when the field is empty. It disappears once the user types the first character.

## Value

A string, or `null`.

- Readable and writable.
- The default is `null`, meaning no placeholder.
- Write `null` to remove the placeholder.
- The placeholder's color is **not verified in the simulator**. To change the color, use [`attributedPlaceholder`](attributedplaceholder.md).
- It shares its content with `attributedPlaceholder`: after writing either one, the text read from the other changes to match.
- There is no change event: only the app's own code changes it.

## Examples

```js
const field = new UITextField();
field.placeholder = 'Enter your account';
```

**Effect**: When the field is empty, it shows "Enter your account".

## Corresponding iOS API

`UITextField.placeholder`.

## See also

- [`attributedPlaceholder`](attributedplaceholder.md)
