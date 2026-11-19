---
type: reference
native: UITextView.returnKeyType
---

# `UITextView`: `returnKeyType` property

The **`returnKeyType`** property determines what the Return key says.

## Value

A string. The values are the same as [`returnKeyType` on `UITextField`](../ui-text-field/returnkeytype.md).

- Readable and writable.
- The default value is `'default'`.
- It changes only the label on the key. In a text view, pressing it still inserts a line break; it doesn't end input and doesn't fire an event.

### Invalid values

Writing a value that isn't in the table doesn't throw: the console logs a warning listing all valid values, and the property keeps its previous value.

```
[Nacre] returnKeyType has no value "x"; expected one of: …, ignored
```
- The effect of each value is **not verified in the simulator**. The acceptance tests verify that values can be written and read back, and that an invalid value leaves the property unchanged and logs a warning.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.returnKeyType = 'send';
```

**Effect**: the Return key says "Send", and pressing it still inserts a line break. **Not verified in the simulator.**

## Corresponding iOS API

`UITextView.returnKeyType`. `UIReturnKeySend` is written `'send'`, and likewise for the others.

## See also

- [`returnKeyType` on `UITextField`](../ui-text-field/returnkeytype.md): the property of the same name on text fields
