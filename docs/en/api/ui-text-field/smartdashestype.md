---
type: reference
native: UITextField.smartDashesType
---

# `UITextField`: `smartDashesType` property

The **`smartDashesType`** property decides whether consecutive hyphens the user types are replaced with a dash.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'default'` | The system decides |
| `'no'` | Not replaced |
| `'yes'` | Consecutive hyphens are replaced with a dash |

- Readable and writable.
- All three values can be written and read back (measured).
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its value is written back; the default value and the effect of each value are **not verified in the simulator**. For usage, follow Apple's documentation.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] smartDashesType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const field = new UITextField();
field.smartDashesType = 'no';
console.log(field.smartDashesType);
```

**Effect**: The console prints `no`. That nothing is replaced is **not verified in the simulator**.

## Corresponding iOS API

`UITextField.smartDashesType`. Values drop the type prefix and start with a lowercase letter: `…TypeNo` is written `'no'`.

## See also

- [The property of the same name on `UITextView`](../ui-text-view/smartdashestype.md)
