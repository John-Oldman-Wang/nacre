---
type: reference
native: UITextField.inputView
---

# `UITextField`: `inputView` property

The **`inputView`** property is a view shown in place of the system keyboard when the text field begins editing, such as a custom-drawn number pad.

## Value

A [`UIView`](../ui-view.md), or `null`.

- Readable and writable.
- `null` means the system keyboard is used.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its value is written back; the default value and the effect of each value are **not verified in the simulator**. For usage, follow Apple's documentation.
- There is no change event: only the app's own code changes it.

## Examples

```js
const field = new UITextField();
const pad = new UIView();
pad.frame = new CGRect(0, 0, 0, 260);
pad.backgroundColor = 'secondarySystemBackground';
field.inputView = pad;
```

**Effect**: When the text field is tapped, what slides up from the bottom of the screen is this 260 pt tall gray view, not the system keyboard. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.inputView`.

## See also

- [`inputAccessoryView`](inputaccessoryview.md): a view attached above the keyboard
