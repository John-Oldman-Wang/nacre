---
type: reference
native: UITextField.clearsOnBeginEditing
---

# `UITextField`: `clearsOnBeginEditing` property

The **`clearsOnBeginEditing`** property indicates whether the existing content is cleared each time editing begins.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Clears the existing content each time editing begins |
| `false` | Keeps the existing content |

- Readable and writable.
- The default is `false`. **Not verified in the simulator.**
- The effect of both values is **not verified in the simulator**.
- Values of other types are converted to a boolean by truthiness: `0` becomes `false` and `'false'` becomes `true`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const field = new UITextField();
field.clearsOnBeginEditing = true;
```

**Effect**: Each time the user taps the text field to begin editing, the previous content is cleared. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.clearsOnBeginEditing`.

## See also

- [`clearsOnInsertion`](clearsoninsertion.md)
