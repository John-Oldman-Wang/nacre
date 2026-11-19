---
type: reference
native: UITextView.keyboardType
---

# `UITextView`: `keyboardType` property

The **`keyboardType`** property determines which keyboard appears when the user taps the text view.

## Value

A string. The values are the same as [`keyboardType` on `UITextField`](../ui-text-field/keyboardtype.md), 13 in all; see that page for which keyboard each value brings up.

- Readable and writable.
- The default value is `'default'`.
- It only determines which keyboard appears; it doesn't validate the content.

### Invalid values

Writing a value that isn't in the table doesn't throw: the console logs a warning listing all valid values, and the property keeps its previous value.

```
[Nacre] keyboardType has no value "x"; expected one of: …, ignored
```
- The effect of each value is **not verified in the simulator**. The acceptance tests verify that values can be written and read back, and that an invalid value leaves the property unchanged and logs a warning.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.keyboardType = 'emailAddress';
```

**Effect**: tapping the text view brings up the keyboard for entering email addresses. **Not verified in the simulator.**

## Corresponding iOS API

`UITextView.keyboardType`. `UIKeyboardTypeEmailAddress` is written `'emailAddress'`, and likewise for the others.

## See also

- [`keyboardType` on `UITextField`](../ui-text-field/keyboardtype.md): the property of the same name on text fields
