---
type: reference
native: UITextView.spellCheckingType
---

# `UITextView`: `spellCheckingType` property

The **`spellCheckingType`** property determines whether the system checks spelling.

## Value

A string, one of the following:

| Value | Effect |
| --- | --- |
| `'default'` | The system decides |
| `'no'` | Misspelled words aren't underlined in red |
| `'yes'` | Underlined in red |

- Readable and writable.
- The default value is `'default'`.

### Invalid values

Writing a value that isn't in the table doesn't throw: the console logs a warning listing all valid values, and the property keeps its previous value.

```
[Nacre] spellCheckingType has no value "x"; expected one of: …, ignored
```
- The effect of each value is **not verified in the simulator**. The acceptance tests verify that values can be written and read back, and that an invalid value leaves the property unchanged and logs a warning.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.spellCheckingType = 'no';
```

**Effect**: misspelled words aren't underlined in red. **Not verified in the simulator.**

## Corresponding iOS API

`UITextView.spellCheckingType`. `UITextSpellCheckingTypeNo` is written `'no'`, and likewise for the others.

## See also

- [`spellCheckingType` on `UITextField`](../ui-text-field/spellcheckingtype.md): the property of the same name on text fields
