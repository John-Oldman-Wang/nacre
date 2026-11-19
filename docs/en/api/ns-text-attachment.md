---
type: reference
native: NSTextAttachment
status: partial
---

# `NSTextAttachment`

**`NSTextAttachment`** represents an attachment in an attributed string: an image shown in the position of one character.

An attachment must become an attributed string before it can be combined with text: use [`NSAttributedString.attributedStringWithAttachment()`](ns-attributed-string/attributedstringwithattachment.md) to build a one-character attributed string, then splice it into the text.

`NSTextAttachment` fires no events. Its values are changed only by the app's own code, so there are no change notifications.

**Inheritance**: `EventTarget` → `NSObject` → `NSTextAttachment`

## Constructor

[`NSTextAttachment()`](ns-text-attachment/constructor.md)

Creates an empty attachment; set `image` afterward.

## Static methods

[`NSTextAttachment.textAttachmentWithImage()`](ns-text-attachment/textattachmentwithimage.md)

Creates an attachment that shows the given image.

## Instance properties

Also inherits the properties of `NSObject`.

| Property | Description |
| --- | --- |
| [`image`](ns-text-attachment/image.md) | The image shown |
| [`bounds`](ns-text-attachment/bounds.md) | Where the image is drawn and how large |

## Instance methods

`NSTextAttachment` has no instance methods of its own.

## Examples

### Inserting a star into text

```js
const star = UIImage.systemImageNamed('star.fill');
if (star !== null) {
  const attachment = NSTextAttachment.textAttachmentWithImage(star);
  attachment.bounds = new CGRect(0, -3, 18, 18);

  const text = new NSMutableAttributedString('Rating ', { font: UIFont.systemFontOfSize(17) });
  text.appendAttributedString(NSAttributedString.attributedStringWithAttachment(attachment));
  text.appendAttributedString(new NSAttributedString(' 4.8'));

  const label = new UILabel();
  label.attributedText = text;
}
```

**Effect** (not verified in the simulator): an 18 × 18 pt star appears between "Rating" and "4.8", 3 pt below the text baseline.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[NSTextAttachment textAttachmentWithImage:image]` | `NSTextAttachment.textAttachmentWithImage(image)` |
| `[NSAttributedString attributedStringWithAttachment:attachment]` | `NSAttributedString.attributedStringWithAttachment(attachment)` |

## See also

- [`NSAttributedString`](ns-attributed-string.md): the `attachment` attribute
- [`UIImage`](ui-image.md): the image in an attachment
- [Displaying styled text](../guides/attributed-text.md)
