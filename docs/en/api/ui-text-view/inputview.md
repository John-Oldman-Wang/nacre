---
type: reference
native: UITextView.inputView
---

# `UITextView`: `inputView` property

The **`inputView`** property is the view that appears instead of the system keyboard when input begins in the text view.

## Value

A [`UIView`](../ui-view.md), or `null`.

- Readable and writable.
- `null` means the system keyboard is used.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its original value is written back; the default value and the effect of each value are **not verified in the simulator**, and usage follows Apple's documentation.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
const pad = new UIView();
pad.frame = new CGRect(0, 0, 0, 260);
input.inputView = pad;
```

**Effect**: tapping the text view brings up this 260 pt tall view at the bottom of the screen instead of the system keyboard. **Not verified in the simulator.**

## Corresponding iOS API

`UITextView.inputView`.

## See also

- [`inputAccessoryView`](inputaccessoryview.md)
