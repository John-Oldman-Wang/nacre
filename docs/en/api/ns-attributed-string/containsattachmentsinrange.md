---
type: reference
native: "-[NSAttributedString containsAttachmentsInRange:]"
---

# `NSAttributedString`: `containsAttachmentsInRange()` method

The **`containsAttachmentsInRange()`** method determines whether a range of text contains attachments.

## Syntax

```
containsAttachmentsInRange(range)
```

### Parameters

**`range`**

The range to check, an [`NSRange`](../ns-attributed-string.md#how-ranges-are-written) or `{ location, length }`.

### Return value

A boolean: `true` if the range contains an attachment, otherwise `false`.

### Exceptions

**`TypeError`**

`range` is out of bounds: `containsAttachmentsInRange range {8, 9} is out of bounds; the string length is 10`.

## Examples

```js
const text = new NSMutableAttributedString('Rating ');
text.appendAttributedString(NSAttributedString.attributedStringWithAttachment(new NSTextAttachment()));
console.log(text.containsAttachmentsInRange(new NSRange(0, 3)));
console.log(text.containsAttachmentsInRange(new NSRange(0, text.length)));
```

**Result**: It prints `false`, then `true`. **Not verified in the simulator.**

## Corresponding iOS API

`-[NSAttributedString containsAttachmentsInRange:]`.

## See also

- [`NSTextAttachment`](../ns-text-attachment.md)
