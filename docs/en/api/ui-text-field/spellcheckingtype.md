---
type: reference
native: UITextField.spellCheckingType
---

# `UITextField`: `spellCheckingType` property

The **`spellCheckingType`** property decides whether the system checks spelling.

## Value

A string, one of the following:

| Value | Effect |
| --- | --- |
| `'default'` | The system decides based on the content being typed |
| `'no'` | Misspelled words are not underlined in red |
| `'yes'` | They are underlined in red |

- Readable and writable.
- The default is `'default'`. **Not verified in the simulator.**
- The effect of each value is **not verified in the simulator**.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] spellCheckingType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const field = new UITextField();
field.spellCheckingType = 'no';
```

**Effect**: Misspelled words are not underlined in red. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.spellCheckingType`. `UITextSpellCheckingTypeNo` is written `'no'`, and likewise for the rest.

## See also

- [`autocorrectionType`](autocorrectiontype.md)
