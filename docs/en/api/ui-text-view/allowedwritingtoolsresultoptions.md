---
type: reference
native: UITextView.allowedWritingToolsResultOptions
---

# `UITextView`: `allowedWritingToolsResultOptions` property

The **`allowedWritingToolsResultOptions`** property determines which kinds of content Writing Tools can write back into the text view.

## Value

An array of strings, each one of the following:

| Value | Meaning |
| --- | --- |
| `'plainText'` | Plain text |
| `'richText'` | Styled text |
| `'list'` | Lists |
| `'table'` | Tables |
| `'presentationIntent'` | Text with paragraph structure |

- Readable and writable. Reading returns an array of names.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its original value is written back; the default value and the effect of each value are **not verified in the simulator**, and usage follows Apple's documentation.
- There is no change event: only the app's own code changes it.

### Invalid values

If the array contains a name that isn't recognized, the whole assignment has no effect, and the console logs a warning listing all valid values. See [Enums](../enums.md).

## Examples

```js
const input = new UITextView();
input.allowedWritingToolsResultOptions = ['plainText', 'list'];
console.log(input.allowedWritingToolsResultOptions.join(','));
```

**Effect**: the console logs `plainText,list`. **Not verified in the simulator.**

## Corresponding iOS API

`UITextView.allowedWritingToolsResultOptions`. The bitmask is written as an array of names.

## See also

- [`writingToolsBehavior`](writingtoolsbehavior.md)
