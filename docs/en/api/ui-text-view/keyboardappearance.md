---
type: reference
native: UITextView.keyboardAppearance
---

# `UITextView`: `keyboardAppearance` property

The **`keyboardAppearance`** property determines whether the keyboard is light or dark.

## Value

A string, one of the following:

| Value | Effect |
| --- | --- |
| `'default'` | Follows the system |
| `'light'` | Light |
| `'dark'` | Dark |
| `'alert'` | The old name for `'dark'`. It can be written, and reads back as `'dark'` |

- Readable and writable.
- The default value is `'default'`.

### Invalid values

Writing a value that isn't in the table doesn't throw: the console logs a warning listing all valid values, and the property keeps its previous value.

```
[Nacre] keyboardAppearance has no value "x"; expected one of: …, ignored
```
- The effect of each value is **not verified in the simulator**. The acceptance tests verify that values can be written and read back, and that an invalid value leaves the property unchanged and logs a warning.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.keyboardAppearance = 'dark';
```

**Effect**: the keyboard is always dark. **Not verified in the simulator.**

## Corresponding iOS API

`UITextView.keyboardAppearance`. `UIKeyboardAppearanceDark` is written `'dark'`.

## See also

- [`keyboardAppearance` on `UITextField`](../ui-text-field/keyboardappearance.md): the property of the same name on text fields
