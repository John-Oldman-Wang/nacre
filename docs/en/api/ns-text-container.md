---
type: reference
native: NSTextContainer
---

# `NSTextContainer`

**`NSTextContainer`** represents the area where text is laid out in a [`UITextView`](ui-text-view.md): how much space each line leaves on the left and right, how many lines at most, and what to do when a line doesn't fit.

Every text view comes with one, obtained from [`textContainer`](ui-text-view/textcontainer.md); each read returns the same object. Changing its properties changes the layout in the text view.

**Inheritance**: `EventTarget` → `NSObject` → `NSTextContainer`

## Constructor

It can't be created with `new`. `new NSTextContainer()` throws `TypeError: Illegal constructor: NSTextContainer is created by the runtime, not by new`. Get it from `textContainer` of a `UITextView`.

## Instance properties

| Property | Description |
| --- | --- |
| [`lineFragmentPadding`](ns-text-container/linefragmentpadding.md) | How much space each line leaves on the left and right |
| [`maximumNumberOfLines`](ns-text-container/maximumnumberoflines.md) | The maximum number of lines |
| [`lineBreakMode`](ns-text-container/linebreakmode.md) | What to do when a line doesn't fit |

## Distance from text to the edges

The distance from the text to the left and right edges of the text view is the sum of two values: the left and right of the `UITextView`'s [`textContainerInset`](ui-text-view/textcontainerinset.md), plus `lineFragmentPadding`. The defaults are 0 plus 5, so in a new text view the text is 5 pt from the left edge. The top and bottom distances are determined only by `textContainerInset`, 8 pt each by default.

## Examples

### Showing at most three lines

```js
const input = new UITextView();
input.isScrollEnabled = false;
input.isEditable = false;
input.textContainer.maximumNumberOfLines = 3;
input.textContainer.lineBreakMode = 'byTruncatingTail';
```

**Effect**: only the first three lines are laid out, and when the third line doesn't fit it ends with an ellipsis (**the ellipsis is not verified in the simulator**). The content of `text` is unchanged; the extra content just isn't shown.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `textView.textContainer` | `input.textContainer` |
| `container.lineFragmentPadding = 0` | `container.lineFragmentPadding = 0` |
| `container.maximumNumberOfLines = 3` | `container.maximumNumberOfLines = 3` |
| `container.lineBreakMode = NSLineBreakByTruncatingTail` | `container.lineBreakMode = 'byTruncatingTail'` |

## See also

- [`UITextView`](ui-text-view.md)
- [Building a multiline text view](../guides/multiline-text.md)
