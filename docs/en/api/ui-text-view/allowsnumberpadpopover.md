---
type: reference
native: UITextView.allowsNumberPadPopover
---

# `UITextView`: `allowsNumberPadPopover` property

The **`allowsNumberPadPopover`** property indicates whether the number pad can be shown as a small panel floating beside the text view. Apple's documentation describes this property as being for iPad.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The number pad may be shown as a popover |
| `false` | Not allowed |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its original value is written back; the default value and the effect of each value are **not verified in the simulator**, and usage follows Apple's documentation.
- Values of other types are converted to a boolean by truthiness: `0` is `false`, `'false'` is `true`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.allowsNumberPadPopover = true;
console.log(input.allowsNumberPadPopover);
```

**Effect**: the console logs `true`. The number pad may be shown as a popover (**not verified in the simulator**).

## Corresponding iOS API

`UITextView.allowsNumberPadPopover`.
