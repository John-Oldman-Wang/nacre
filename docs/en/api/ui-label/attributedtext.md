---
type: reference
native: UILabel.attributedText
---

# `UILabel`: `attributedText` property

The **`attributedText`** property is the styled text shown by the label. Different runs within an [attributed string](../ns-attributed-string.md) can have different fonts, colors, and underlines.

## Value

An [`NSAttributedString`](../ns-attributed-string.md), or `null`.

- Readable and writable.
- `null` when there is no content.
- After writing, [`text`](text.md) reads as the plain text in it.
- The label takes the content as of the moment of assignment. Changing the same [`NSMutableAttributedString`](../ns-mutable-attributed-string.md) afterward does not change what the label shows; assign it again.
- What you read is an immutable snapshot, and each read may be a different object. Compare content with [`isEqualToAttributedString()`](../ns-attributed-string/isequaltoattributedstring.md), not `===`.

Writing `text` after `attributedText` has been written replaces the text, but **the styles from the original attributed string remain**. For example, if it was underlined, the new text is underlined too. So once a label has shown an attributed string, keep writing `attributedText` to change its content: assign a new attributed string to replace content and styles together. Whether writing `attributedText = null` before writing `text` removes the styles is **not verified in the simulator**.

### Invalid values

**`TypeError`**

- The value written is not an attributed string: `attributedText needs a native object or null, got "plain text"`.
- The value written is some other native object: `attributedText needs a NSAttributedString or null`.

## Examples

### Show underlined text

```js
const label = new UILabel();
label.attributedText = new NSAttributedString('Sale', { underlineStyle: ['single'] });
console.log(label.text);
```

**Effect**: The label shows "Sale" underlined, and the console prints `Sale`. What the underline looks like on screen is **not verified in the simulator**.

### Styles remain when `text` is written afterward

```js
const label = new UILabel();
label.attributedText = new NSAttributedString('Sale', { underlineStyle: ['single'] });
label.text = 'Ended';
const now = label.attributedText;
console.log(now === null ? 'null' : (now.attributesAtIndex(0).underlineStyle || []).join(','));
```

**Result**: The console prints `single`. The text on the label changes to "Ended", and the underline is still there.

## Corresponding iOS API

`UILabel.attributedText`.

## See also

- [`NSAttributedString`](../ns-attributed-string.md): how to create attributed strings and what attributes they have
- [Displaying styled text](../../guides/attributed-text.md)
- [`text`](text.md)
