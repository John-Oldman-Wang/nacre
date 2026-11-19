---
type: reference
native: UITextField.smartQuotesType
---

# `UITextField`: `smartQuotesType` property

The **`smartQuotesType`** property decides whether straight quotes the user types are replaced with curly quotes.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'default'` | The system decides |
| `'no'` | Not replaced |
| `'yes'` | Straight quotes are replaced with curly quotes |

- Readable and writable.
- All three values can be written and read back (measured).
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its value is written back; the default value and the effect of each value are **not verified in the simulator**. For usage, follow Apple's documentation.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] smartQuotesType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const field = new UITextField();
field.smartQuotesType = 'no';
console.log(field.smartQuotesType);
```

**Effect**: The console prints `no`. That nothing is replaced is **not verified in the simulator**.

## Corresponding iOS API

`UITextField.smartQuotesType`. Values drop the type prefix and start with a lowercase letter: `…TypeNo` is written `'no'`.

## See also

- [The property of the same name on `UITextView`](../ui-text-view/smartquotestype.md)
