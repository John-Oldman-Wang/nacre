---
type: reference
native: NSParagraphStyle
status: partial
---

# `NSParagraphStyle`

**`NSParagraphStyle`** represents a set of paragraph styles: alignment, line spacing, paragraph spacing, indentation, and line breaking. It is put into an [attributed string](ns-attributed-string.md) as the `paragraphStyle` attribute and applies to every whole paragraph it covers. A paragraph is the text between two newline characters.

All properties of `NSParagraphStyle` are read-only. To set values, create an [`NSMutableParagraphStyle`](ns-mutable-paragraph-style.md), or call [`mutableCopy()`](ns-paragraph-style/mutablecopy.md).

When a paragraph style is put into an attributed string, a copy taken at that moment is stored. Changing that `NSMutableParagraphStyle` afterward doesn't change attributed strings that have already been created. A paragraph style read back from an attributed string is also a copy.

`NSParagraphStyle` fires no events. Its values never change, so there are no change notifications.

**Inheritance**: `EventTarget` → `NSObject` → `NSParagraphStyle`

For how to adjust line spacing and alignment, see the guide [Displaying styled text](../guides/attributed-text.md).

## Constructor

[`NSParagraphStyle()`](ns-paragraph-style/constructor.md)

Creates a default style, equal to the value of `NSParagraphStyle.defaultParagraphStyle`.

## Static properties

[`NSParagraphStyle.defaultParagraphStyle`](ns-paragraph-style/defaultparagraphstyle.md) <small>read-only</small>

The system's default paragraph style.

## Instance properties

Also inherits the properties of `NSObject`. All are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`alignment`](ns-paragraph-style/alignment.md) <small>read-only</small> | Alignment |
| [`lineSpacing`](ns-paragraph-style/linespacing.md) <small>read-only</small> | Extra distance added between lines |
| [`paragraphSpacing`](ns-paragraph-style/paragraphspacing.md) <small>read-only</small> | Space left after the end of the paragraph |
| [`paragraphSpacingBefore`](ns-paragraph-style/paragraphspacingbefore.md) <small>read-only</small> | Space left before the start of the paragraph |
| [`firstLineHeadIndent`](ns-paragraph-style/firstlineheadindent.md) <small>read-only</small> | How far the first line is indented from the left |
| [`headIndent`](ns-paragraph-style/headindent.md) <small>read-only</small> | How far the lines other than the first are indented from the left |
| [`tailIndent`](ns-paragraph-style/tailindent.md) <small>read-only</small> | The right edge of the lines |
| [`lineBreakMode`](ns-paragraph-style/linebreakmode.md) <small>read-only</small> | What happens when a line doesn't fit |
| [`minimumLineHeight`](ns-paragraph-style/minimumlineheight.md) <small>read-only</small> | The minimum line height |
| [`maximumLineHeight`](ns-paragraph-style/maximumlineheight.md) <small>read-only</small> | The maximum line height |
| [`lineHeightMultiple`](ns-paragraph-style/lineheightmultiple.md) <small>read-only</small> | The line height as a multiple of the font's natural line height |
| [`baseWritingDirection`](ns-paragraph-style/basewritingdirection.md) <small>read-only</small> | The side the paragraph starts from |
| [`hyphenationFactor`](ns-paragraph-style/hyphenationfactor.md) <small>read-only</small> | How aggressively words are hyphenated |
| [`defaultTabInterval`](ns-paragraph-style/defaulttabinterval.md) <small>read-only</small> | The default interval between tab stops |
| [`allowsDefaultTighteningForTruncation`](ns-paragraph-style/allowsdefaulttighteningfortruncation.md) <small>read-only</small> | Whether letter spacing is tightened before truncating |

## Instance methods

| Method | Description |
| --- | --- |
| [`copy()`](ns-paragraph-style/copy.md) | An immutable copy with the same values |
| [`mutableCopy()`](ns-paragraph-style/mutablecopy.md) | A mutable copy with the same values |

## Examples

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.alignment, style.lineSpacing, style.lineBreakMode);
```

**Result**: the console prints `natural 0 byWordWrapping`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `NSParagraphStyle.defaultParagraphStyle` | `NSParagraphStyle.defaultParagraphStyle` |
| `style.alignment = NSTextAlignmentCenter` | `style.alignment = 'center'` (on `NSMutableParagraphStyle`) |
| `[style mutableCopy]` | `style.mutableCopy()` |

## See also

- [`NSMutableParagraphStyle`](ns-mutable-paragraph-style.md): a mutable paragraph style
- [`NSAttributedString`](ns-attributed-string.md): the `paragraphStyle` attribute
- [Displaying styled text](../guides/attributed-text.md)
