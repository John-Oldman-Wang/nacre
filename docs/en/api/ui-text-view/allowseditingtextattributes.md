---
type: reference
native: UITextView.allowsEditingTextAttributes
---

# `UITextView`: `allowsEditingTextAttributes` property

The **`allowsEditingTextAttributes`** property indicates whether the user can change the style of selected text, such as making it bold, from the edit menu.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | After text is selected, the edit menu has options for changing its style |
| `false` | No such options |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its original value is written back; the default value and the effect of each value are **not verified in the simulator**, and usage follows Apple's documentation.
- Values of other types are converted to a boolean by truthiness: `0` is `false`, `'false'` is `true`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.allowsEditingTextAttributes = true;
console.log(input.allowsEditingTextAttributes);
```

**Effect**: the console logs `true`. After text is selected, the edit menu has options for changing its style (**not verified in the simulator**).

## Corresponding iOS API

`UITextView.allowsEditingTextAttributes`.
