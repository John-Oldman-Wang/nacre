---
type: reference
native: NSAttributedString
status: partial
---

# `NSAttributedString`

**`NSAttributedString`** represents styled text, called an attributed string: a string plus a set of [attributes](#attributed-string-attributes) on each range. Attributes specify which font, which color, whether there is an underline, and how much kerning a range uses. Different ranges of the same string can have different attributes, so one line of text can mix several sizes and colors.

Once created, an `NSAttributedString`'s content can't be changed. To add attributes to a range, append, or replace text, use its subclass [`NSMutableAttributedString`](ns-mutable-attributed-string.md).

An attributed string doesn't display itself. Give it to a label, text field, or button, and they display it:

| Where it is displayed | How |
| --- | --- |
| [`UILabel`](ui-label.md) | [`label.attributedText = text`](ui-label/attributedtext.md) |
| [`UITextField`](ui-text-field.md) | `field.attributedText = text`, `field.attributedPlaceholder = text` |
| [`UITextView`](ui-text-view.md) | `textView.attributedText = text` |
| [`UIButton`](ui-button.md) | [`button.setAttributedTitle(text, { forState: ['normal'] })`](ui-button/setattributedtitle.md) |

Classes used together with attributed strings:

| Class | What it is |
| --- | --- |
| [`NSMutableAttributedString`](ns-mutable-attributed-string.md) | A modifiable attributed string |
| [`NSParagraphStyle`](ns-paragraph-style.md) | Paragraph style: alignment, line spacing, paragraph spacing, indentation. Read-only properties |
| [`NSMutableParagraphStyle`](ns-mutable-paragraph-style.md) | A modifiable paragraph style |
| [`NSShadow`](ns-shadow.md) | A text shadow |
| [`NSTextAttachment`](ns-text-attachment.md) | An attachment: displays an image at the position of one character |

> **Note:** The read and write behavior of this group of classes (creating attributed strings, reading and writing attributes, changing content, measuring sizes, reading and writing on the four kinds of views) has been run in the simulator's acceptance tests (iPhone Air, iOS 27.2). **What they look like on screen hasn't been checked**: every "Effect" marked as not verified in the simulator refers to the visuals, based on Apple's headers and documentation.

`NSAttributedString` doesn't fire events. Its content never changes, so there are no change notifications.

**Inheritance**: `EventTarget` → `NSObject` → `NSAttributedString`

For how to use attributed strings for mixed-style prices, underlines, line spacing, and inline images, see the guide [Displaying styled text](../guides/attributed-text.md).

## Constructor

[`NSAttributedString()`](ns-attributed-string/constructor.md)

Creates an attributed string: empty, plain text without attributes, text with one set of attributes throughout, or a copy of another attributed string.

## Static methods

[`NSAttributedString.attributedStringWithAttachment()`](ns-attributed-string/attributedstringwithattachment.md)

Creates an attributed string containing only one attachment, with length 1. Used to insert an image into text.

## Instance properties

Also inherits the properties of `NSObject`.

| Property | Description |
| --- | --- |
| [`string`](ns-attributed-string/string.md) <small>read-only</small> | The text without attributes |
| [`length`](ns-attributed-string/length.md) <small>read-only</small> | The length, in UTF-16 code units |

## Instance methods

Also inherits the methods of `NSObject`.

Reading attributes:

| Method | Description |
| --- | --- |
| [`attributesAtIndex()`](ns-attributed-string/attributesatindex.md) | All attributes at a position |
| [`attribute()`](ns-attributed-string/attribute.md) | One attribute at a position |
| [`enumerateAttributesInRange()`](ns-attributed-string/enumerateattributesinrange.md) | Iterates run by run, where each run is a contiguous range with the same attributes |

Extracting and comparing:

| Method | Description |
| --- | --- |
| [`attributedSubstringFromRange()`](ns-attributed-string/attributedsubstringfromrange.md) | Extracts a range, attributes included |
| [`isEqualToAttributedString()`](ns-attributed-string/isequaltoattributedstring.md) | Whether the text and the attributes everywhere are the same |
| [`containsAttachmentsInRange()`](ns-attributed-string/containsattachmentsinrange.md) | Whether a range contains attachments |

Measuring:

| Method | Description |
| --- | --- |
| [`size()`](ns-attributed-string/size.md) | How much space it needs laid out on one line |
| [`boundingRectWithSize()`](ns-attributed-string/boundingrectwithsize.md) | How much space it needs laid out within a given size |

Copies:

| Method | Description |
| --- | --- |
| [`copy()`](ns-attributed-string/copy.md) | An unmodifiable copy with the same content |
| [`mutableCopy()`](ns-attributed-string/mutablecopy.md) | A modifiable copy with the same content |

## How ranges are written

When adding attributes to a range, you say which range with an [`NSRange`](ui-text-view/selectedrange.md): where it starts and how long it is. Positions and lengths are in UTF-16 code units, the same unit as JS string indexes, so the number from `'Total ¥128'.indexOf('¥')` can be used directly. An emoji takes two.

```js
const a = new NSRange(3, 4);              // 4 code units starting at index 3
const b = { location: 3, length: 4 };     // Plain objects like this are also accepted when writing
```

A range beyond the length of the text throws `TypeError`, with the range and the text length in the message:

```
TypeError: addAttributes range {8, 9} is out of bounds; the string length is 10
```

## Changing it after handing it over doesn't update the interface

A view takes **the content at the moment of assignment**. If you then change the same `NSMutableAttributedString`, what the view shows doesn't change; assign it again.

Paragraph styles and shadows work the same way: the attributed string holds a copy made at that moment, and changing that `NSMutableParagraphStyle` or `NSShadow` afterward doesn't affect attributed strings already created.

An attributed string read back from a view (such as [`label.attributedText`](ui-label/attributedtext.md)) is an unmodifiable snapshot, and each read may be a different object. To compare the content of two attributed strings, use [`isEqualToAttributedString()`](ns-attributed-string/isequaltoattributedstring.md), not `===`.

## Attributed string attributes

Attributes are written as an object whose keys are attribute names. They read back as an object of the same shape; attributes that aren't present don't appear in it.

| Name | Value | Description |
| --- | --- | --- |
| `font` | [`UIFont`](ui-font.md) | Font. Without it the system uses 12 pt Helvetica |
| `foregroundColor` | [Color](ui-color.md) | Text color. Black without it |
| `backgroundColor` | [Color](ui-color.md) | Background color behind the text. None without it |
| `paragraphStyle` | [`NSParagraphStyle`](ns-paragraph-style.md) | Paragraph style; see [`NSParagraphStyle`](ns-paragraph-style.md) |
| `kern` | Number, [pt](units.md) | Kerning adjustment. Positive values spread characters apart; negative values tighten them |
| `tracking` | Number, [pt](units.md) | Tracking. Unlike `kern`, it turns off ligatures that would be broken apart |
| `ligature` | Integer | Ligatures (such as fi joined into one glyph). `1` uses the font's default ligatures; `0` uses none |
| `underlineStyle` | Array of line style names | Underline; for values, see [Line styles](#line-styles) |
| `underlineColor` | [Color](ui-color.md) | Underline color. Same as the text color without it |
| `strikethroughStyle` | Array of line style names | Strikethrough; for values, see [Line styles](#line-styles) |
| `strikethroughColor` | [Color](ui-color.md) | Strikethrough color. Same as the text color without it |
| `strokeWidth` | Number, percentage of the font size | Stroke width. `0` means no stroke; a positive value strokes without filling, giving outlined text; a negative value both strokes and fills. Outlined text commonly uses `3` |
| `strokeColor` | [Color](ui-color.md) | Stroke color. Same as the text color without it |
| `shadow` | [`NSShadow`](ns-shadow.md) | Shadow |
| `baselineOffset` | Number, [pt](units.md) | How far to raise the text from the baseline. Negative values lower it |
| `link` | String | The link's URL. A [`URL`](url.md) object is also accepted when writing |
| `attachment` | [`NSTextAttachment`](ns-text-attachment.md) | The attachment displayed at this character's position |

Rules for writing attributes:

- **Keys whose value is `undefined` are treated as absent.**
- **A misspelled name throws `TypeError`**, with all valid names listed in the message: `NSAttributedString has no attribute "colour"; expected one of: font / paragraphStyle / …`
- **An invalid color doesn't throw.** An unrecognized color string prints a warning, and that key has no effect while the other keys apply as usual. This is the same rule as for colors elsewhere; see [`UIColor`](ui-color.md). A color value of `null` throws: if you don't want the color, leave the key out.
- **Numbers are converted to numbers.** `kern: '2'` gives 2; values that don't convert throw `TypeError`.
- **Fonts, paragraph styles, shadows, and attachments must be the corresponding classes**, or `TypeError` is thrown, such as `font must be a UIFont, got "Helvetica"`.

Values read back: colors are strings; fonts and attachments are the objects you wrote; paragraph styles and shadows are copies.

### Line styles

The values of `underlineStyle` and `strikethroughStyle` are arrays, with at most one choice from each of three kinds:

| Value | Effect |
| --- | --- |
| `'single'` | One thin line |
| `'thick'` | One thick line |
| `'double'` | Two thin lines |
| `'patternDot'` | Dotted line |
| `'patternDash'` | Dashed line |
| `'patternDashDot'` | Alternating dash and dot |
| `'patternDashDotDot'` | Alternating dash and two dots |
| `'byWord'` | Drawn only under words, not under spaces |

The first three are line styles, the middle four are dash patterns (a solid line when omitted), and the last can be combined with any of the others. An empty array `[]` means no line.

- Two line styles, or two dash patterns: `TypeError: underlineStyle takes at most one of single / thick / double`
- Not an array: `TypeError: underlineStyle must be an array of style names, got "single"`
- An unrecognized name: `TypeError: underlineStyle has no value "wavy"; expected one of: …`

## Examples

### A price line

Starting from a blank app, show a price line on screen: small plain text first, the price in large red text, and the original price in gray with a strikethrough.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const text = new NSMutableAttributedString('Now ', {
    font: UIFont.systemFontOfSize(15),
    foregroundColor: 'label',
  });
  text.appendAttributedString(new NSAttributedString('¥128', {
    font: UIFont.boldSystemFontOfSize(26),
    foregroundColor: 'systemRed',
  }));
  text.appendAttributedString(new NSAttributedString('  ¥199', {
    font: UIFont.systemFontOfSize(13),
    foregroundColor: 'secondaryLabel',
    strikethroughStyle: ['single'],
  }));

  const label = new UILabel();
  label.attributedText = text;

  label.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(label);
  NSLayoutConstraint.activateConstraints([
    label.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    label.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  ]);
});
```

**Effect** (not verified in the simulator)

- A line of text appears in the center of the screen: "Now" in 15 pt plain text, "¥128" in 26 pt red bold, and "¥199" in 13 pt gray with a line through it.
- The bottoms of the three ranges align on the same baseline.

For more patterns, see the guide [Displaying styled text](../guides/attributed-text.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[NSAttributedString alloc] initWithString:@"x" attributes:@{NSFontAttributeName: font}]` | `new NSAttributedString('x', { font })` |
| `[[NSMutableAttributedString alloc] initWithAttributedString:other]` | `new NSMutableAttributedString(other)` |
| `NSForegroundColorAttributeName: UIColor.systemRedColor` | `foregroundColor: 'systemRed'` |
| `NSUnderlineStyleAttributeName: @(NSUnderlineStyleSingle \| NSUnderlineStylePatternDash)` | `underlineStyle: ['single', 'patternDash']` |
| `[text addAttribute:NSKernAttributeName value:@2 range:NSMakeRange(0, 3)]` | `text.addAttribute('kern', { value: 2, range: new NSRange(0, 3) })` |
| `[text setAttributes:attrs range:range]` | `text.setAttributes(attrs, { range })` |
| `[text removeAttribute:NSKernAttributeName range:range]` | `text.removeAttribute('kern', { range })` |
| `[text appendAttributedString:other]` | `text.appendAttributedString(other)` |
| `[text insertAttributedString:other atIndex:0]` | `text.insertAttributedString(other, { atIndex: 0 })` |
| `[text replaceCharactersInRange:range withString:@"x"]` | `text.replaceCharactersInRange(range, { withString: 'x' })` |
| `[text attributesAtIndex:0 effectiveRange:NULL]` | `text.attributesAtIndex(0)` |
| `[text attribute:NSFontAttributeName atIndex:0 effectiveRange:NULL]` | `text.attribute('font', { atIndex: 0 })` |
| `[text enumerateAttributesInRange:range options:0 usingBlock:^…]` | `text.enumerateAttributesInRange(range, (attributes, range) => { … })` |
| `[text boundingRectWithSize:size options:NSStringDrawingUsesLineFragmentOrigin context:nil]` | `text.boundingRectWithSize(size, { options: ['usesLineFragmentOrigin'] })` |
| `CGFLOAT_MAX` | `Number.MAX_VALUE` |
| `[NSTextAttachment textAttachmentWithImage:image]` | `NSTextAttachment.textAttachmentWithImage(image)` |
| `[NSAttributedString attributedStringWithAttachment:attachment]` | `NSAttributedString.attributedStringWithAttachment(attachment)` |
| `style.alignment = NSTextAlignmentCenter` | `style.alignment = 'center'` |
| `label.attributedText = text` | `label.attributedText = text` |
| `[button setAttributedTitle:text forState:UIControlStateNormal]` | `button.setAttributedTitle(text, { forState: ['normal'] })` |

## See also

- [Displaying styled text](../guides/attributed-text.md): styling a range, underlines, line spacing, inline images, measuring
- [`NSMutableAttributedString`](ns-mutable-attributed-string.md): a modifiable attributed string
- [`UILabel`](ui-label.md), [`UITextField`](ui-text-field.md), [`UITextView`](ui-text-view.md), [`UIButton`](ui-button.md): the four views that display attributed strings
- [`UIFont`](ui-font.md): the value of the `font` attribute
- [`UIColor`](ui-color.md): how to write colors, and what happens when they're invalid
- [Structs](structs.md): `CGSize`, `CGRect`
- [Units](units.md)
