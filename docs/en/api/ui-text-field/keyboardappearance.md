---
type: reference
native: UITextField.keyboardAppearance
---

# `UITextField`: `keyboardAppearance` property

The **`keyboardAppearance`** property decides whether the keyboard is light or dark.

## Value

A string, one of the following:

| Value | Effect |
| --- | --- |
| `'default'` | Follows the system's current light or dark appearance |
| `'light'` | Always a light keyboard |
| `'dark'` | Always a dark keyboard |
| `'alert'` | The old name for `'dark'`, with the same effect. It can be written, and reads back as `'dark'` |

- Readable and writable.
- The default is `'default'`. **Not verified in the simulator.**
- The effect of each value is **not verified in the simulator**.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] keyboardAppearance has no value "x"; expected one of: …, ignored
```

## Examples

```js
const field = new UITextField();
field.keyboardAppearance = 'alert';
console.log(field.keyboardAppearance);
```

**Effect**: The console prints `dark`. That the keyboard is always dark is **not verified in the simulator**.

## Corresponding iOS API

`UITextField.keyboardAppearance`. `UIKeyboardAppearanceDark` is written `'dark'`.

## See also

- [`keyboardType`](keyboardtype.md)
