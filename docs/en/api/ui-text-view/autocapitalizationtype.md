---
type: reference
native: UITextView.autocapitalizationType
---

# `UITextView`: `autocapitalizationType` property

The **`autocapitalizationType`** property determines the rules the system uses for automatic capitalization.

## Value

A string, one of the following:

| Value | Effect |
| --- | --- |
| `'none'` | No automatic capitalization |
| `'words'` | Capitalizes the first letter of each word |
| `'sentences'` | Capitalizes the first letter of each sentence |
| `'allCharacters'` | Capitalizes all letters |

- Readable and writable.
- The default value is `'sentences'`.

### Invalid values

Writing a value that isn't in the table doesn't throw: the console logs a warning listing all valid values, and the property keeps its previous value.

```
[Nacre] autocapitalizationType has no value "x"; expected one of: …, ignored
```
- The effect of each value is **not verified in the simulator**. The acceptance tests verify that values can be written and read back, and that an invalid value leaves the property unchanged and logs a warning.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.autocapitalizationType = 'none';
```

**Effect**: the first letter typed isn't automatically capitalized. **Not verified in the simulator.**

## Corresponding iOS API

`UITextView.autocapitalizationType`. `UITextAutocapitalizationTypeNone` is written `'none'`, and likewise for the others.

## See also

- [`autocapitalizationType` on `UITextField`](../ui-text-field/autocapitalizationtype.md): the property of the same name on text fields
