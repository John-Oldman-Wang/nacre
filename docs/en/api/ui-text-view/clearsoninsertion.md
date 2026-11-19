---
type: reference
native: UITextView.clearsOnInsertion
---

# `UITextView`: `clearsOnInsertion` property

The **`clearsOnInsertion`** property indicates whether inserting text first replaces the whole content.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Inserting text replaces the whole content |
| `false` | Text is inserted at the cursor |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its original value is written back; the default value and the effect of each value are **not verified in the simulator**, and usage follows Apple's documentation.
- Values of other types are converted to a boolean by truthiness: `0` is `false`, `'false'` is `true`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.clearsOnInsertion = true;
console.log(input.clearsOnInsertion);
```

**Effect**: the console logs `true`. Inserting text replaces the whole content (**not verified in the simulator**).

## Corresponding iOS API

`UITextView.clearsOnInsertion`.
