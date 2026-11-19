---
type: reference
native: UITextField.mathExpressionCompletionType
---

# `UITextField`: `mathExpressionCompletionType` property

The **`mathExpressionCompletionType`** property decides whether the result is offered automatically when the user types a math expression followed by an equals sign.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'default'` | The system decides |
| `'no'` | Not offered |
| `'yes'` | The result is offered automatically |

- Readable and writable.
- Writing back the value that was read leaves it unchanged (measured).
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its value is written back; the default value and the effect of each value are **not verified in the simulator**. For usage, follow Apple's documentation.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] mathExpressionCompletionType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const field = new UITextField();
field.mathExpressionCompletionType = 'no';
console.log(field.mathExpressionCompletionType);
```

**Effect**: The console prints `no`. That no result is offered is **not verified in the simulator**.

## Corresponding iOS API

`UITextField.mathExpressionCompletionType`. Values drop the type prefix and start with a lowercase letter: `…TypeNo` is written `'no'`.

## See also

- [The property of the same name on `UITextView`](../ui-text-view/mathexpressioncompletiontype.md)
