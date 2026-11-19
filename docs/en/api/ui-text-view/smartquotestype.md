---
type: reference
native: UITextView.smartQuotesType
---

# `UITextView`: `smartQuotesType` property

The **`smartQuotesType`** property determines whether straight quotes the user types are replaced with curly quotes.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'default'` | The system decides |
| `'no'` | Not replaced |
| `'yes'` | Straight quotes are replaced with curly quotes |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its original value is written back; the default value and the effect of each value are **not verified in the simulator**, and usage follows Apple's documentation.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value that isn't in the table doesn't throw: the console logs a warning listing all valid values, and the property keeps its previous value.

```
[Nacre] smartQuotesType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const input = new UITextView();
input.smartQuotesType = 'no';
console.log(input.smartQuotesType);
```

**Effect**: the console logs `no`. Quotes aren't replaced (**not verified in the simulator**).

## Corresponding iOS API

`UITextView.smartQuotesType`. Values drop the type prefix and lowercase the first letter: `…TypeNo` is written `'no'`.

## See also

- [The property of the same name on `UITextField`](../ui-text-field/smartquotestype.md)
