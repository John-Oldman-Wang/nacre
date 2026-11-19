---
type: reference
native: UITextField.secureTextEntry
---

# `UITextField`: `isSecureTextEntry` property

The **`isSecureTextEntry`** property indicates whether the content is shown as dots, for passwords.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Each typed character is shown as a dot. `text` still reads the real content |
| `false` | Displayed normally |

- Readable and writable.
- The default is `false`.
- It can be changed at any time, which is how a "show password" toggle works.
- Showing as dots is **not verified in the simulator**.
- Values of other types are converted to a boolean by truthiness: `0` becomes `false` and `'false'` becomes `true`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const field = new UITextField();
field.isSecureTextEntry = true;
field.textContentType = 'password';
```

**Effect**: Each typed character is shown as a dot. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.secureTextEntry` (the getter is `isSecureTextEntry`).

## See also

- [`textContentType`](textcontenttype.md)
