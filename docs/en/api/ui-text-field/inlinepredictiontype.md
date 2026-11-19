---
type: reference
native: UITextField.inlinePredictionType
---

# `UITextField`: `inlinePredictionType` property

The **`inlinePredictionType`** property decides whether the system's predicted continuation is shown in gray text after the cursor.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'default'` | The system decides |
| `'no'` | Not shown |
| `'yes'` | The predicted continuation is shown |

- Readable and writable.
- Writing back the value that was read leaves it unchanged (measured).
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its value is written back; the default value and the effect of each value are **not verified in the simulator**. For usage, follow Apple's documentation.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] inlinePredictionType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const field = new UITextField();
field.inlinePredictionType = 'no';
console.log(field.inlinePredictionType);
```

**Effect**: The console prints `no`. That nothing is shown is **not verified in the simulator**.

## Corresponding iOS API

`UITextField.inlinePredictionType`. Values drop the type prefix and start with a lowercase letter: `…TypeNo` is written `'no'`.

## See also

- [The property of the same name on `UITextView`](../ui-text-view/inlinepredictiontype.md)
