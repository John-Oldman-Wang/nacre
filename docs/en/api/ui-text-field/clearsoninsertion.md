---
type: reference
native: UITextField.clearsOnInsertion
---

# `UITextField`: `clearsOnInsertion` property

The **`clearsOnInsertion`** property indicates whether inserting text first replaces all the content in the field.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Inserting text replaces all the content |
| `false` | Text is inserted at the cursor |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its value is written back; the default value and the effect of each value are **not verified in the simulator**. For usage, follow Apple's documentation.
- Values of other types are converted to a boolean by truthiness: `0` becomes `false` and `'false'` becomes `true`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const field = new UITextField();
field.clearsOnInsertion = true;
```

**Effect**: When the user types the first character, the previous content is replaced. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.clearsOnInsertion`.

## See also

- [`clearsOnBeginEditing`](clearsonbeginediting.md)
