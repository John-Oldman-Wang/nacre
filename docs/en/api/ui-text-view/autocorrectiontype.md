---
type: reference
native: UITextView.autocorrectionType
---

# `UITextView`: `autocorrectionType` property

The **`autocorrectionType`** property determines whether the system autocorrects text.

## Value

A string, one of the following:

| Value | Effect |
| --- | --- |
| `'default'` | The system decides |
| `'no'` | Misspelled words aren't replaced automatically |
| `'yes'` | Replaced automatically |

- Readable and writable.
- The default value is `'default'`.

### Invalid values

Writing a value that isn't in the table doesn't throw: the console logs a warning listing all valid values, and the property keeps its previous value.

```
[Nacre] autocorrectionType has no value "x"; expected one of: …, ignored
```
- The effect of each value is **not verified in the simulator**. The acceptance tests verify that values can be written and read back, and that an invalid value leaves the property unchanged and logs a warning.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.autocorrectionType = 'no';
```

**Effect**: misspelled words aren't replaced. **Not verified in the simulator.**

## Corresponding iOS API

`UITextView.autocorrectionType`. `UITextAutocorrectionTypeNo` is written `'no'`, and likewise for the others.

## See also

- [`autocorrectionType` on `UITextField`](../ui-text-field/autocorrectiontype.md): the property of the same name on text fields
