---
type: reference
native: UITextView.smartInsertDeleteType
---

# `UITextView`: `smartInsertDeleteType` property

The **`smartInsertDeleteType`** property determines whether spaces around words are added or removed automatically on paste and delete.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'default'` | The system decides |
| `'no'` | Spaces aren't adjusted |
| `'yes'` | Spaces are added or removed automatically |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its original value is written back; the default value and the effect of each value are **not verified in the simulator**, and usage follows Apple's documentation.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value that isn't in the table doesn't throw: the console logs a warning listing all valid values, and the property keeps its previous value.

```
[Nacre] smartInsertDeleteType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const input = new UITextView();
input.smartInsertDeleteType = 'no';
console.log(input.smartInsertDeleteType);
```

**Effect**: the console logs `no`. Spaces aren't adjusted (**not verified in the simulator**).

## Corresponding iOS API

`UITextView.smartInsertDeleteType`. Values drop the type prefix and lowercase the first letter: `…TypeNo` is written `'no'`.

## See also

- [The property of the same name on `UITextField`](../ui-text-field/smartinsertdeletetype.md)
