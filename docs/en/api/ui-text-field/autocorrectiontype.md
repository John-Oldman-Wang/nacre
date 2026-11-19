---
type: reference
native: UITextField.autocorrectionType
---

# `UITextField`: `autocorrectionType` property

The **`autocorrectionType`** property decides whether the system autocorrects.

## Value

A string, one of the following:

| Value | Effect |
| --- | --- |
| `'default'` | The system decides based on the content being typed |
| `'no'` | Words the system thinks are misspelled are not replaced automatically |
| `'yes'` | They are replaced automatically |

- Readable and writable.
- The default is `'default'`.
- The effect of each value is **not verified in the simulator**.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] autocorrectionType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const field = new UITextField();
field.autocorrectionType = 'no';
```

**Effect**: What the user types stays as typed; misspelled words are not replaced. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.autocorrectionType`. `UITextAutocorrectionTypeNo` is written `'no'`, and likewise for the rest.

## See also

- [`spellCheckingType`](spellcheckingtype.md)
