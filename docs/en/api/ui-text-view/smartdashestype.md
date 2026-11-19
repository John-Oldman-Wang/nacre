---
type: reference
native: UITextView.smartDashesType
---

# `UITextView`: `smartDashesType` property

The **`smartDashesType`** property determines whether consecutive hyphens the user types are replaced with a dash.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'default'` | The system decides |
| `'no'` | Not replaced |
| `'yes'` | Consecutive hyphens are replaced with a dash |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its original value is written back; the default value and the effect of each value are **not verified in the simulator**, and usage follows Apple's documentation.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value that isn't in the table doesn't throw: the console logs a warning listing all valid values, and the property keeps its previous value.

```
[Nacre] smartDashesType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const input = new UITextView();
input.smartDashesType = 'no';
console.log(input.smartDashesType);
```

**Effect**: the console logs `no`. Hyphens aren't replaced (**not verified in the simulator**).

## Corresponding iOS API

`UITextView.smartDashesType`. Values drop the type prefix and lowercase the first letter: `…TypeNo` is written `'no'`.

## See also

- [The property of the same name on `UITextField`](../ui-text-field/smartdashestype.md)
