---
type: reference
native: UITextField.autocapitalizationType
---

# `UITextField`: `autocapitalizationType` property

The **`autocapitalizationType`** property decides the system's automatic capitalization rule.

## Value

A string, one of the following:

| Value | Effect |
| --- | --- |
| `'none'` | No automatic capitalization |
| `'words'` | Capitalizes the first letter of each word |
| `'sentences'` | Capitalizes the first letter of each sentence |
| `'allCharacters'` | Capitalizes all letters |

- Readable and writable.
- The default is `'sentences'`.
- The effect of each value is **not verified in the simulator**.
- Set it to `'none'` for content such as account names, email addresses, and code.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] autocapitalizationType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const field = new UITextField();
field.autocapitalizationType = 'none';
```

**Effect**: The first letter typed is not automatically capitalized. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.autocapitalizationType`. `UITextAutocapitalizationTypeNone` is written `'none'`, and likewise for the rest.

## See also

- [`autocorrectionType`](autocorrectiontype.md)
