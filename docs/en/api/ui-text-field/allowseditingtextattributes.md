---
type: reference
native: UITextField.allowsEditingTextAttributes
---

# `UITextField`: `allowsEditingTextAttributes` property

The **`allowsEditingTextAttributes`** property indicates whether the user can change the style of the selected text, such as making it bold, from the edit menu.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | After selecting text, the edit menu has options for changing the style |
| `false` | Those options are absent |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its value is written back; the default value and the effect of each value are **not verified in the simulator**. For usage, follow Apple's documentation.
- Values of other types are converted to a boolean by truthiness: `0` becomes `false` and `'false'` becomes `true`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const field = new UITextField();
field.allowsEditingTextAttributes = true;
```

**Effect**: After selecting text, the edit menu shows Bold, Italic, and Underline. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.allowsEditingTextAttributes`.

## See also

- [`attributedText`](attributedtext.md)
