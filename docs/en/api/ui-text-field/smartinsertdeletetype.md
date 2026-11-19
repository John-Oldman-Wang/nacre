---
type: reference
native: UITextField.smartInsertDeleteType
---

# `UITextField`: `smartInsertDeleteType` property

The **`smartInsertDeleteType`** property decides whether spaces on either side of a word are added or removed automatically on paste and delete.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'default'` | The system decides |
| `'no'` | Spaces are not adjusted |
| `'yes'` | Spaces are added or removed automatically |

- Readable and writable.
- All three values can be written and read back (measured).
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its value is written back; the default value and the effect of each value are **not verified in the simulator**. For usage, follow Apple's documentation.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] smartInsertDeleteType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const field = new UITextField();
field.smartInsertDeleteType = 'no';
console.log(field.smartInsertDeleteType);
```

**Effect**: The console prints `no`. That spaces are not adjusted is **not verified in the simulator**.

## Corresponding iOS API

`UITextField.smartInsertDeleteType`. Values drop the type prefix and start with a lowercase letter: `…TypeNo` is written `'no'`.

## See also

- [The property of the same name on `UITextView`](../ui-text-view/smartinsertdeletetype.md)
