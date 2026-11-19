---
type: reference
native: NSMutableParagraphStyle
status: partial
---

# `NSMutableParagraphStyle`

**`NSMutableParagraphStyle`** represents a set of paragraph styles that can be changed. It has all the properties of [`NSParagraphStyle`](ns-paragraph-style.md), and they are all writable on it. Once set up, it goes into an [attributed string](ns-attributed-string.md) as the `paragraphStyle` attribute.

What goes into the attributed string is a copy taken at that moment: changing this object afterward doesn't affect attributed strings already created. So set up the style first, then create the attributed string, and finally give it to the view.

`NSMutableParagraphStyle` fires no events. Its values are only changed by the app's own code, so there is no change notification.

**Inheritance**: `EventTarget` → `NSObject` → [`NSParagraphStyle`](ns-paragraph-style.md) → `NSMutableParagraphStyle`

For how to adjust line spacing and alignment, see the guide [Displaying styled text](../guides/attributed-text.md).

## Constructor

[`NSMutableParagraphStyle()`](ns-mutable-paragraph-style/constructor.md)

Creates a mutable paragraph style with all properties at their defaults.

## Instance properties

All readable and writable. The defaults are the same as [`NSParagraphStyle`](ns-paragraph-style.md)'s default style.

| Property | Description |
| --- | --- |
| [`alignment`](ns-mutable-paragraph-style/alignment.md) | Alignment |
| [`lineSpacing`](ns-mutable-paragraph-style/linespacing.md) | Extra space added between lines |
| [`paragraphSpacing`](ns-mutable-paragraph-style/paragraphspacing.md) | Space left after the end of the paragraph |
| [`paragraphSpacingBefore`](ns-mutable-paragraph-style/paragraphspacingbefore.md) | Space left before the start of the paragraph |
| [`firstLineHeadIndent`](ns-mutable-paragraph-style/firstlineheadindent.md) | How far the first line is indented from the left |
| [`headIndent`](ns-mutable-paragraph-style/headindent.md) | How far lines other than the first are indented from the left |
| [`tailIndent`](ns-mutable-paragraph-style/tailindent.md) | The right edge of the lines |
| [`lineBreakMode`](ns-mutable-paragraph-style/linebreakmode.md) | What happens when a line doesn't fit |
| [`minimumLineHeight`](ns-mutable-paragraph-style/minimumlineheight.md) | Lower limit of the line height |
| [`maximumLineHeight`](ns-mutable-paragraph-style/maximumlineheight.md) | Upper limit of the line height |
| [`lineHeightMultiple`](ns-mutable-paragraph-style/lineheightmultiple.md) | Line height as a multiple of the font's natural line height |
| [`baseWritingDirection`](ns-mutable-paragraph-style/basewritingdirection.md) | Which side the paragraph starts from |
| [`hyphenationFactor`](ns-mutable-paragraph-style/hyphenationfactor.md) | How aggressively words are hyphenated |
| [`defaultTabInterval`](ns-mutable-paragraph-style/defaulttabinterval.md) | Default interval between tab stops |
| [`allowsDefaultTighteningForTruncation`](ns-mutable-paragraph-style/allowsdefaulttighteningfortruncation.md) | Whether letter spacing is tightened before truncating |

Rules for invalid values:

- Lengths and multipliers other than `tailIndent` can't be negative: `TypeError: lineSpacing must be a non-negative number`.
- `hyphenationFactor` out of range: `TypeError: hyphenationFactor must be between 0 and 1`.
- Writing a value not in the table to `alignment`, `lineBreakMode`, or `baseWritingDirection` doesn't throw: the property keeps its previous value, and a warning listing the valid values is printed to the console.

## Instance methods

Also inherits `copy()` and `mutableCopy()` from [`NSParagraphStyle`](ns-paragraph-style.md).

| Method | Description |
| --- | --- |
| [`setParagraphStyle()`](ns-mutable-paragraph-style/setparagraphstyle.md) | Copies all property values from another paragraph style |

## Examples

### Centered, with larger line spacing

```js
const style = new NSMutableParagraphStyle();
style.alignment = 'center';
style.lineSpacing = 8;

const label = new UILabel();
label.numberOfLines = 0;
label.attributedText = new NSAttributedString('First line\nSecond line', {
  font: UIFont.systemFontOfSize(17),
  paragraphStyle: style,
});
```

**Effect** (not verified in the simulator): The two lines of text are centered, with 8 pt more space between them than usual.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[NSMutableParagraphStyle alloc] init]` | `new NSMutableParagraphStyle()` |
| `style.alignment = NSTextAlignmentCenter` | `style.alignment = 'center'` |
| `style.lineBreakMode = NSLineBreakByTruncatingTail` | `style.lineBreakMode = 'byTruncatingTail'` |
| `[style setParagraphStyle:other]` | `style.setParagraphStyle(other)` |

## See also

- [`NSParagraphStyle`](ns-paragraph-style.md)
- [`NSAttributedString`](ns-attributed-string.md): the `paragraphStyle` attribute
- [Displaying styled text](../guides/attributed-text.md)
