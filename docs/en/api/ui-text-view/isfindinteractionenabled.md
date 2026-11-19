---
type: reference
native: UITextView.findInteractionEnabled
---

# `UITextView`: `isFindInteractionEnabled` property

The **`isFindInteractionEnabled`** property indicates whether system find and replace is turned on.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The user can use system find and replace |
| `false` | No find and replace |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its original value is written back; the default value and the effect of each value are **not verified in the simulator**, and usage follows Apple's documentation.
- Values of other types are converted to a boolean by truthiness: `0` is `false`, `'false'` is `true`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.isFindInteractionEnabled = true;
console.log(input.isFindInteractionEnabled);
```

**Effect**: the console logs `true`. The user can use system find and replace (**not verified in the simulator**).

## Corresponding iOS API

`UITextView.findInteractionEnabled`.
