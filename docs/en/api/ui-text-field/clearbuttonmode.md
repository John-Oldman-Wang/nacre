---
type: reference
native: UITextField.clearButtonMode
---

# `UITextField`: `clearButtonMode` property

The **`clearButtonMode`** property decides when the clear button on the right side of the field is shown. The clear button is a round × button; tapping it clears all the content.

## Value

A string, one of these four:

| Value | When the clear button is shown |
| --- | --- |
| `'never'` | Never |
| `'whileEditing'` | While editing and there is content |
| `'unlessEditing'` | While not editing and there is content |
| `'always'` | Always, whenever there is content |

- Readable and writable.
- The default is `'never'`.
- The effect of each value is **not verified in the simulator**.
- Before the user's tap on the clear button takes effect, [`beforeclear`](beforeclear-event.md) fires and can be canceled.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] clearButtonMode has no value "x"; expected one of: …, ignored
```

## Examples

```js
const field = new UITextField();
field.clearButtonMode = 'whileEditing';
```

**Effect**: While the text field is being edited and has content, a round × button appears on the right. Tapping it clears all the content. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.clearButtonMode`. `UITextFieldViewModeWhileEditing` is written `'whileEditing'`, and likewise for the rest.

## See also

- The [`beforeclear`](beforeclear-event.md) event
- [`rightViewMode`](rightviewmode.md): takes the same values
