---
type: reference
native: "+[NSAttributedString attributedStringWithAttachment:attributes:]"
---

# `NSAttributedString.attributedStringWithAttachment()` static method

The **`NSAttributedString.attributedStringWithAttachment()`** static method creates an attributed string containing only one attachment. An attachment has to become an attributed string before it can be joined with text.

## Syntax

```
NSAttributedString.attributedStringWithAttachment(attachment, [{ attributes }])
```

### Parameters

**`attachment`**

An [`NSTextAttachment`](../ns-text-attachment.md).

**`options.attributes`**

Optional. An additional set of [attributes](../ns-attributed-string.md#attributed-string-attributes) on this character. `null` is the same as omitting it.

### Return value

A new `NSAttributedString` of length 1: a placeholder character `'￼'` with the `attachment` attribute.

### Exceptions

**`TypeError`**

- `attachment` isn't an `NSTextAttachment`: `attributedStringWithAttachment attachment must be a NSTextAttachment, got …`.
- Errors in `attributes` are the same as for the [constructor](constructor.md).

## Examples

```js
const star = UIImage.systemImageNamed('star.fill');
if (star !== null) {
  const attachment = NSTextAttachment.textAttachmentWithImage(star);
  const text = NSAttributedString.attributedStringWithAttachment(attachment);
  console.log(text.length, text.attribute('attachment', { atIndex: 0 }) === attachment);
}
```

**Result**: The console prints `1 true`.

## Corresponding iOS API

`+[NSAttributedString attributedStringWithAttachment:]`, `+attributedStringWithAttachment:attributes:`.

## See also

- [`NSTextAttachment`](../ns-text-attachment.md)
- [Displaying styled text](../../guides/attributed-text.md): inserting an image into text
