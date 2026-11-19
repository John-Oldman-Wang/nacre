---
type: reference
native: UILabel
status: partial
---

# `UILabel`

**`UILabel`** represents a piece of read-only text on screen, called a label. Titles, descriptions, and the text of each row in a list are all shown by labels. Users can see the text on a label but cannot edit, select, or copy it.

A label shows one piece of text. When set with [`text`](ui-label/text.md), the whole text uses one font and one color; to make a few characters bold or a different color, set an [attributed string](ns-attributed-string.md) with [`attributedText`](ui-label/attributedtext.md). Text can mix Chinese and English; the labels in the acceptance UI show mixed Chinese and English text. Whether emoji display correctly is **not verified in the simulator**.

After changing `text`, `font`, or another property, the text on screen updates automatically; you do not need to call any refresh method.

`UILabel` fires no events of its own. Its properties are only changed by the app's code, so there are no change notifications.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UILabel`

For using labels to show titles and multi-line descriptions and to measure text, see the guide [Displaying text](../guides/labels.md).

## Constructor

[`UILabel()`](ui-label/constructor.md)

Creates a label with no text and a width and height of 0.

## Instance properties

Also inherits the properties of [`UIView`](ui-view.md). The inherited properties commonly used on labels are `frame`, `backgroundColor`, `isHidden`, and `intrinsicContentSize`. On labels, `isUserInteractionEnabled` defaults to `false`, unlike plain views; see [Touch](#touch).

Text and appearance:

| Property | Description |
| --- | --- |
| [`text`](ui-label/text.md) | The text shown |
| [`attributedText`](ui-label/attributedtext.md) | Styled text; one piece can mix several fonts and colors |
| [`font`](ui-label/font.md) | The font, including size and weight |
| [`textColor`](ui-label/textcolor.md) | The text color |
| [`textAlignment`](ui-label/textalignment.md) | The horizontal alignment of the text within the label's width |

Line count and truncation:

| Property | Description |
| --- | --- |
| [`numberOfLines`](ui-label/numberoflines.md) | The maximum number of lines. `0` means no limit |
| [`lineBreakMode`](ui-label/linebreakmode.md) | What happens when the text does not fit |
| [`preferredMaxLayoutWidth`](ui-label/preferredmaxlayoutwidth.md) | The wrapping width used to calculate a multi-line label's intrinsic size |

Automatic font shrinking:

| Property | Description |
| --- | --- |
| [`adjustsFontSizeToFitWidth`](ui-label/adjustsfontsizetofitwidth.md) | Whether the font size shrinks when the text does not fit |
| [`minimumScaleFactor`](ui-label/minimumscalefactor.md) | The smallest fraction of the original font size it can shrink to |
| [`baselineAdjustment`](ui-label/baselineadjustment.md) | How the text is placed vertically after the font size shrinks |

Shadow and state:

| Property | Description |
| --- | --- |
| [`shadowColor`](ui-label/shadowcolor.md) | The color of the text shadow |
| [`shadowOffset`](ui-label/shadowoffset.md) | The offset of the text shadow from the text |
| [`isEnabled`](ui-label/isenabled.md) | Whether it is drawn as enabled |
| [`isHighlighted`](ui-label/ishighlighted.md) | Whether it is in the highlighted state |
| [`highlightedTextColor`](ui-label/highlightedtextcolor.md) | The text color in the highlighted state |

## Instance methods

`UILabel` declares no methods of its own. Measure text with the methods inherited from [`UIView`](ui-view.md); on a label they mean the following:

| Member | What it returns on a label |
| --- | --- |
| `intrinsicContentSize` | A read-only `CGSize`, in [pt](units.md). The text's [intrinsic size](#intrinsic-size). Read synchronously |
| `sizeThatFits(size)` | A `CGSize`, in [pt](units.md). The size the text needs when its width does not exceed `size.width`, limited by `numberOfLines`. Returns synchronously and does not change the label |
| `sizeToFit()` | No return value. Resizes the label to just fit the text, keeping its position |

The `size` of `sizeThatFits(size)` can be a `CGSize` or `{ width, height }`. A missing field throws `TypeError: sizeThatFits is missing width, or it is not a finite number`.

Neither of the two measuring members changes the label. The label does not need to be added to a page first; you can measure it right after creating it.

## When the text does not fit

**By default a label shows only one line.** When the text is wider than the label, it does not wrap; the part that does not fit is replaced at the end with an ellipsis "…".

There are three ways to handle text that does not fit, each controlled by a different property:

| Approach | How |
| --- | --- |
| Truncate | The default. Where the ellipsis goes is decided by [`lineBreakMode`](ui-label/linebreakmode.md) |
| Wrap | Set [`numberOfLines`](ui-label/numberoflines.md) to `0` (no limit), or to a number greater than 1 (at most that many lines) |
| Shrink the font | Set [`adjustsFontSizeToFitWidth`](ui-label/adjustsfontsizetofitwidth.md) to `true` |

The three can be combined: wrap first, and truncate once the lines run out; shrink first, and truncate once the lower limit is reached. For which to use for which content, see the guide [Displaying text](../guides/labels.md).

## Line count, wrapping, and truncation

Three things together decide how text is laid out:

| | Role |
| --- | --- |
| The label's width | How much text fits on a line |
| `numberOfLines` | The maximum number of lines. `0` means no limit |
| `lineBreakMode` | What to do with the remaining text when it still does not fit on the last line |

The rules are:

- When `numberOfLines` is `1`, the text does not wrap. If it does not fit, it is handled according to `lineBreakMode`.
- When `numberOfLines` is greater than 1 or equal to `0`, the text wraps automatically within the label's width.
- When the label is not tall enough to show `numberOfLines` lines, only the lines that fit are shown, and the last line is handled according to `lineBreakMode`. **Not verified in the simulator.**
- When the label is taller than the text, the text is centered vertically in the label. `UILabel` has no vertical alignment property. **Not verified in the simulator.**
- When `adjustsFontSizeToFitWidth` is `true`, the font size shrinks first; if it still does not fit at the lower limit set by `minimumScaleFactor`, it is handled according to `lineBreakMode`. **Not verified in the simulator.**

## Intrinsic size

The intrinsic size is the size a view calculates from its own content. A plain `UIView` has no content and no intrinsic size. A `UILabel`'s content is text, and its intrinsic size is decided by four things: `text`, `font`, `numberOfLines`, and `preferredMaxLayoutWidth`.

The intrinsic size is a value you can read (`intrinsicContentSize`). It only takes effect automatically when positioning with constraints:

| How it is positioned | Where the label's size comes from |
| --- | --- |
| [Auto Layout](auto-layout.md) constraints | When no constraint sets the width or height, the system uses the intrinsic size. So constraining only the position is enough |
| Writing `frame` directly | Entirely from `frame`. A new label's width and height are 0. The intrinsic size does not take effect automatically; measure it and write it in yourself |

When constraints conflict with the intrinsic size (for example, the constrained width is narrower than the text), the constraints win, and the text wraps or is truncated according to `numberOfLines` and `lineBreakMode`.

How strongly a label holds on to its intrinsic size is decided by its content priorities; see [`UIView`](ui-view.md). `UILabel`'s defaults are the same as a plain `UIView`'s: the priority for resisting growth is 250 and the priority for resisting shrinking is 750 (verified by testing).

"A label's size adjusts automatically with its text" comes from iOS's definition; the acceptance tests have no dedicated assertion for it, so it is **not verified in the simulator**. The intrinsic size values themselves were measured.

## Multi-line text and width

The size of single-line text is fixed. Multi-line text is not: the same text can be laid out as one very wide line or as many narrow lines. So measuring multi-line text requires a width. There are three ways to give a width:

| Situation | Where the width comes from |
| --- | --- |
| Calling `sizeThatFits(size)` | The `size.width` argument |
| Positioned with constraints, and the label's width is set by constraints | The width the constraints produce |
| Positioned with constraints, and the label's width is not set by constraints | [`preferredMaxLayoutWidth`](ui-label/preferredmaxlayoutwidth.md) |

When `preferredMaxLayoutWidth` is `0` (the default) and no other way gives a width, the intrinsic size is calculated as "all the text on one line". **Not verified in the simulator.**

## Touch

The following property is inherited from `UIView`, but `UILabel` has a different default:

| Property | `UIView` default | `UILabel` default | Effect |
| --- | --- | --- | --- |
| `isUserInteractionEnabled` | `true` | `false` | A label does not receive touches by default; touches go to the view behind it |

To make a label respond to taps, set it to `true` and add a [gesture recognizer](ui-gesture-recognizer.md).

## Errors

- A misspelled property name does not throw at runtime (type checking reports it). Calling on an object not created by the constructor throws `Illegal invocation`. These are the same for all views; see [`UIView`](ui-view.md).
- Invalid values for enum properties (`textAlignment`, `lineBreakMode`, `baselineAdjustment`) and color properties do not throw; the console prints a warning and the property keeps its value. The exact warning text is on each member page.

## Examples

### A title and a two-line description

Starting from a blank app, put a title near the top of the screen and a description of at most two lines below it.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const title = new UILabel();
  title.text = 'Hello, Nacre';
  title.font = UIFont.systemFontOfSize(34, { weight: 'bold' });
  title.textAlignment = 'center';

  const body = new UILabel();
  body.text = 'This description is deliberately long, to demonstrate multi-line layout, a line limit, and ' +
              'truncation at the end. Whatever does not fit in two lines is not shown, and the second line ends with an ellipsis.';
  body.font = UIFont.systemFontOfSize(15);
  body.textColor = 'secondaryLabel';
  body.numberOfLines = 2;

  title.translatesAutoresizingMaskIntoConstraints = false;
  body.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(title);
  page.view.addSubview(body);

  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    title.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 16 }),
    title.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 24 }),
    title.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -24 }),
    body.topAnchor.constraintEqualToAnchor(title.bottomAnchor, { constant: 12 }),
    body.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 24 }),
    body.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -24 }),
  ]);
});
```

**Effect**

- Near the top of the screen, 16 pt below the status bar, a line of large bold text "Hello, Nacre" appears, centered horizontally.
- 12 pt below the title is a paragraph of small gray text, 24 pt from the screen edge on each side.
- The description is laid out in two lines. The second line ends with "…", and the rest of the text is not shown.
- Neither label's height is written. The title's height equals one line of text, and the description's height equals two lines.
- In dark mode, the text colors automatically switch to light ones.

This code has not been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

`safe` is the safe area's layout guide, the region of the screen not covered by the notch, the status bar, or the home indicator; see [`UIView`](ui-view.md). For writing constraints, see [Auto Layout](auto-layout.md).

For more patterns, see the guide [Displaying text](../guides/labels.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UILabel alloc] init]` | `new UILabel()` |
| `label.text = @"Hello"` | `label.text = 'Hello'` |
| `label.font = [UIFont systemFontOfSize:34 weight:UIFontWeightBold]` | `label.font = UIFont.systemFontOfSize(34, { weight: 'bold' })` |
| `label.textColor = UIColor.labelColor` | `label.textColor = 'label'` |
| `label.textAlignment = NSTextAlignmentCenter` | `label.textAlignment = 'center'` |
| `label.lineBreakMode = NSLineBreakByTruncatingTail` | `label.lineBreakMode = 'byTruncatingTail'` |
| `label.numberOfLines = 0` | `label.numberOfLines = 0` |
| `label.adjustsFontSizeToFitWidth = YES` | `label.adjustsFontSizeToFitWidth = true` |
| `label.baselineAdjustment = UIBaselineAdjustmentAlignCenters` | `label.baselineAdjustment = 'alignCenters'` |
| `label.highlighted = YES` | `label.isHighlighted = true` |
| `label.enabled = NO` | `label.isEnabled = false` |
| `label.shadowOffset = CGSizeMake(0, -1)` | `label.shadowOffset = new CGSize(0, -1)` |
| `label.attributedText = text` | `label.attributedText = text` |
| `[label sizeThatFits:CGSizeMake(402, 999)]` | `label.sizeThatFits(new CGSize(402, 999))` |

There are three rules:

- Enums are written as strings: drop the type prefix from the ObjC constant and lowercase the first letter. `NSTextAlignmentCenter` is `'center'`, and `NSLineBreakByTruncatingTail` is `'byTruncatingTail'`. See [Enums](enums.md).
- Colors are written as strings, not `UIColor` constants.
- Boolean properties declared in ObjC with `getter=isXxx` are read and written in JS by the name `isXxx`.

### Comparison with the browser

| HTML / CSS | `UILabel` |
| --- | --- |
| Plain text in `<span>` or `<p>` | `text` |
| Wraps automatically by default | Shows only one line by default. Set `numberOfLines` to wrap |
| `-webkit-line-clamp: 3` | `numberOfLines = 3` |
| `text-overflow: ellipsis` | `lineBreakMode = 'byTruncatingTail'` (the default) |
| `text-overflow: clip` | `lineBreakMode = 'byClipping'` |
| `text-align` | `textAlignment` |
| `text-shadow`, with a blur radius | `shadowColor` and `shadowOffset`, with no blur radius |
| Nested `<b>` or `<span style>` inside the text | `attributedText` |
| The user can select and copy the text | Cannot |
| The size of an element shrunk to fit its content | `intrinsicContentSize`, which only takes effect automatically when positioning with constraints |

## See also

- [Displaying text](../guides/labels.md): multi-line, truncation, automatic shrinking, measuring, and shadows
- [`UIView`](ui-view.md): the label's superclass; position, size, background color, and constraints are all there
- [`UIFont`](ui-font.md): the value of `font`
- [`UIColor`](ui-color.md): every way to write a color string, and what happens with invalid ones
- [`NSAttributedString`](ns-attributed-string.md): the value of `attributedText`
- [Auto Layout](auto-layout.md): how the intrinsic size works in constraints
- [`UIButton`](ui-button.md): the text on a button is shown by a `UILabel`, available through `titleLabel`
- [`UITextField`](ui-text-field.md): editable single-line text
- [Units](units.md): what pt is
