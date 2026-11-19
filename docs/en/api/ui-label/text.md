---
type: reference
native: UILabel.text
---

# `UILabel`: `text` property

The **`text`** property is the text the label shows. The whole text uses the single font and color given by [`font`](font.md) and [`textColor`](textcolor.md).

## Value

A string, or `null`.

- Readable and writable.
- The default is `null`, meaning no text.
- After writing, the text on screen updates immediately. When positioning with constraints, the label's size is recalculated for the new text; you do not need to refresh the layout manually. The automatic size change is **not verified in the simulator**.
- Values that are not strings are converted with `String()` on write: `label.text = 5` shows "5". `null` and `undefined` mean no text.
- After [`attributedText`](attributedtext.md) has been written, `text` reads as the plain text in the attributed string.

> **Note:** If a label has shown an attributed string (`attributedText` was written) and you then write `text`, the text is replaced, but the styles from the original attributed string remain; for example, the underline is still there. To change the content of such a label, keep writing `attributedText`.

## Examples

### Changing the text

```js
const label = new UILabel();
label.text = 'New title';
```

**Effect**: The text shown by the label changes to "New title".

### Clear the text

```js
const label = new UILabel();
label.text = 'Temporary';
label.text = null;
console.log(label.text);
```

**Effect**: The label shows no text, and the console prints `null`. The effect on screen is **not verified in the simulator**.

## Corresponding iOS API

`UILabel.text`.

## See also

- [`attributedText`](attributedtext.md): text mixing several fonts and colors
- [`font`](font.md), [`textColor`](textcolor.md)
