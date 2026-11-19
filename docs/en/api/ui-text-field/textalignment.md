---
type: reference
native: UITextField.textAlignment
---

# `UITextField`: `textAlignment` property

The **`textAlignment`** property decides the horizontal alignment of the text in the field.

## Value

A string, one of the following:

| Value | Effect |
| --- | --- |
| `'left'` | Left-aligned |
| `'center'` | Centered |
| `'right'` | Right-aligned |
| `'justified'` | Justified |
| `'natural'` | Follows the writing direction of the language: left-aligned for Chinese and English, right-aligned for Arabic |

- Readable and writable.
- The default value is **not verified in the simulator**.
- The effect of each value is **not verified in the simulator**.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] textAlignment has no value "x"; expected one of: …, ignored
```

## Examples

```js
const field = new UITextField();
field.textAlignment = 'center';
```

**Effect**: The text in the field is centered horizontally. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.textAlignment`. `NSTextAlignmentCenter` is written `'center'`, and likewise for the rest.

## See also

- [`font`](font.md)
