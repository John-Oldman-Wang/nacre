---
type: reference
native: UITextView.textAlignment
---

# `UITextView`: `textAlignment` property

The **`textAlignment`** property determines which side the text aligns to.

## Value

A string, one of the following:

| Value | Effect |
| --- | --- |
| `'left'` | Left-aligned |
| `'center'` | Centered |
| `'right'` | Right-aligned |
| `'justified'` | Justified |
| `'natural'` | Follows the writing direction of the text; left-aligned for Chinese and English |

- Readable and writable.
- The default value is `'natural'`.
- The effect of each value is **not verified in the simulator**. The acceptance tests verify that values can be written and read back, and that an invalid value leaves the property unchanged and logs a warning.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value that isn't in the table doesn't throw: the console logs a warning listing all valid values, and the property keeps its previous value.

```
[Nacre] textAlignment has no value "x"; expected one of: …, ignored
```

## Examples

```js
const input = new UITextView();
input.textAlignment = 'center';
```

**Effect**: each line of text is centered horizontally. **Not verified in the simulator.**

## Corresponding iOS API

`UITextView.textAlignment`. `NSTextAlignmentCenter` is written `'center'`, and likewise for the others.

## See also

- [`font`](font.md)
