---
type: reference
native: UITextView.inlinePredictionType
---

# `UITextView`: `inlinePredictionType` property

The **`inlinePredictionType`** property determines whether the system shows predicted text in gray after the cursor.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'default'` | The system decides |
| `'no'` | Not shown |
| `'yes'` | Predicted text is shown |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its original value is written back; the default value and the effect of each value are **not verified in the simulator**, and usage follows Apple's documentation.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value that isn't in the table doesn't throw: the console logs a warning listing all valid values, and the property keeps its previous value.

```
[Nacre] inlinePredictionType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const input = new UITextView();
input.inlinePredictionType = 'no';
console.log(input.inlinePredictionType);
```

**Effect**: the console logs `no`. Predictions aren't shown (**not verified in the simulator**).

## Corresponding iOS API

`UITextView.inlinePredictionType`. Values drop the type prefix and lowercase the first letter: `…TypeNo` is written `'no'`.

## See also

- [The property of the same name on `UITextField`](../ui-text-field/inlinepredictiontype.md)
