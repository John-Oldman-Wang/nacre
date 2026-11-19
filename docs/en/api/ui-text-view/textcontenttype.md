---
type: reference
native: UITextView.textContentType
---

# `UITextView`: `textContentType` property

The **`textContentType`** property states what kind of content goes here, which the system uses to offer AutoFill.

## Value

A string, or `null`. The values are the same as [`textContentType` on `UITextField`](../ui-text-field/textcontenttype.md), 48 in all.

- Readable and writable.
- The default value is `null`, meaning not configured.
- Writing `null` clears it.

### Invalid values

Writing a value that isn't in the table doesn't throw: the console logs a warning listing all valid values, and the property keeps its previous value.

```
[Nacre] textContentType has no value "x"; expected one of: …, ignored
```
- The effect of each value is **not verified in the simulator**. The acceptance tests verify that values can be written and read back, and that an invalid value leaves the property unchanged and logs a warning.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.textContentType = 'fullStreetAddress';
```

**Effect**: the system may offer saved addresses above the keyboard. **Not verified in the simulator.**

## Corresponding iOS API

`UITextView.textContentType`. `UITextContentTypeFullStreetAddress` is written `'fullStreetAddress'`, and `nil` is written `null`.

## See also

- [`textContentType` on `UITextField`](../ui-text-field/textcontenttype.md): the property of the same name on text fields
