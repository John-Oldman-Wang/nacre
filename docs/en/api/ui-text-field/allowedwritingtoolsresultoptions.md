---
type: reference
native: UITextField.allowedWritingToolsResultOptions
---

# `UITextField`: `allowedWritingToolsResultOptions` property

The **`allowedWritingToolsResultOptions`** property decides which kinds of content Writing Tools can write back into the field.

## Value

An array of strings, each one of the following:

| Value | Meaning |
| --- | --- |
| `'plainText'` | Plain text |
| `'richText'` | Styled text |
| `'list'` | Lists |
| `'table'` | Tables |
| `'presentationIntent'` | Text with paragraph structure |

- Readable and writable. Reading it returns an array of names.
- Writing back the value that was read leaves it unchanged (measured).
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its value is written back; the default value and the effect of each value are **not verified in the simulator**. For usage, follow Apple's documentation.
- There is no change event: only the app's own code changes it.

### Invalid values

When the array contains a name that is not recognized, the whole assignment has no effect and the console prints a warning listing all available values; see [Enums](../enums.md).

## Examples

```js
const field = new UITextField();
field.allowedWritingToolsResultOptions = ['plainText'];
console.log(field.allowedWritingToolsResultOptions.join(','));
```

**Effect**: The console prints `plainText`. That Writing Tools writes back only plain text is **not verified in the simulator**.

## Corresponding iOS API

`UITextField.allowedWritingToolsResultOptions`. The bitmask is written as an array of names.

## See also

- [`writingToolsBehavior`](writingtoolsbehavior.md)
