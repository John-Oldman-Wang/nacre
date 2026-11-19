---
type: reference
native: UITextField.leftViewMode
---

# `UITextField`: `leftViewMode` property

The **`leftViewMode`** property decides when [`leftView`](leftview.md) is shown.

## Value

A string, one of these four:

| Value | When it is shown |
| --- | --- |
| `'never'` | Never |
| `'whileEditing'` | While editing |
| `'unlessEditing'` | While not editing |
| `'always'` | Always |

- Readable and writable.
- A written value reads back. (Measured.)
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its value is written back; the default value and the effect of each value are **not verified in the simulator**. For usage, follow Apple's documentation.
- It takes the same values as [`clearButtonMode`](clearbuttonmode.md).
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] leftViewMode has no value "x"; expected one of: …, ignored
```

## Examples

```js
const field = new UITextField();
field.leftView = new UIView();
field.leftViewMode = 'whileEditing';
console.log(field.leftViewMode);
```

**Result**: The console prints `whileEditing`. That the view is shown at the left end of the field while editing is **not verified in the simulator**.

## Corresponding iOS API

`UITextField.leftViewMode`. `UITextFieldViewModeAlways` is written `'always'`, and likewise for the rest.

## See also

- [`leftView`](leftview.md)
