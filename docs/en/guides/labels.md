# Displaying text

This guide shows how to display text with [`UILabel`](../api/ui-label.md): titles, multi-line descriptions, truncating or shrinking when text doesn't fit, measuring how much space text needs, and shadows. Details of each property are on the [`UILabel`](../api/ui-label.md) reference page. For how to write fonts and colors, see [Setting fonts](fonts.md) and [Setting colors](colors.md); for mixing several styles in one passage, see [Displaying styled text](attributed-text.md).

## Recommended approach

- **Position labels with constraints, and don't constrain the height.** A label computes how big it needs to be from its text, font, and number of lines. Constrain only the position, and the label resizes automatically when the text gets longer, the font size grows, or the language changes. When positioning with `frame`, you measure and write the width and height yourself, and measure again whenever the text changes.
- **For multi-line text: set the width with constraints on the left and right edges, set [`numberOfLines`](../api/ui-label/numberoflines.md) to `0`, and don't constrain the height.** The constraints determine the label's width, and the height grows with the number of lines.
- **When text doesn't fit, choose how to handle it based on the content:**

  | Handling | How | Suited to |
  | --- | --- | --- |
  | Truncate | Default behavior | Titles, names. One line only; content that doesn't fit can be left out |
  | Wrap | `numberOfLines = 0`, or a number greater than 1 | Body text, descriptions. The content must be shown in full |
  | Shrink the font | `adjustsFontSizeToFitWidth = true` | Amounts, numbers. One line only, and the content must be shown in full |

  Wrap content that must be shown in full; truncate content that only serves as an identifier; shrink the font only for very short single-line text, because after shrinking, font sizes on the same page are no longer consistent.

## First label

Starting from a blank app, place a title line near the top of the screen and, below it, a description that shows at most two lines.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and the page. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Create the title and set its text
  const title = new UILabel();
  title.text = 'Hello, Nacre';

  // 2. Set the font, color, and alignment
  title.font = UIFont.systemFontOfSize(34, { weight: 'bold' });   // 34 pt, bold
  title.textColor = 'label';
  title.textAlignment = 'center';

  // 3. Create the description, showing at most two lines
  const body = new UILabel();
  body.text = 'This description is deliberately long to demonstrate multi-line layout, a line limit, and ' +
              'truncation at the end. Whatever doesn\'t fit in two lines isn\'t shown, and the second line ends with an ellipsis.';
  body.font = UIFont.systemFontOfSize(15);
  body.textColor = 'secondaryLabel';
  body.numberOfLines = 2;

  // 4. Put them on the page. Constrain only the position and the side margins, not the height
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

- Near the top of the screen, 16 pt below the status bar, a line of large bold text "Hello, Nacre" appears, horizontally centered.
- 12 pt below the title is a passage of small gray text, 24 pt from each edge of the screen.
- The description is laid out in two lines. The second line ends with "…", and the rest of the text isn't shown.
- Neither label's height is written. The title's height equals the height of one line of text, and the description's height equals the height of two lines.
- In Dark Mode, the text colors automatically switch to light ones.

This code has not been run as a whole in the simulator. Each API it uses has been run in the acceptance tests.

The four steps are: create and set the text, set the appearance, set the number of lines, and put them on the page. `safe` is the safe area's layout guide, the region of the screen not covered by the notch, the status bar, or the home indicator at the bottom; see [`UIView`](../api/ui-view.md). For how to write constraints, see [Auto Layout](../api/auto-layout.md).

The examples below all reuse `title`, `body`, `page`, and `safe` from here. To try a section on its own, write these lines first:

```js
const page = new UIViewController();
const title = new UILabel();
const body = new UILabel();
page.view.addSubview(title);
page.view.addSubview(body);
const safe = page.view.safeAreaLayoutGuide;
```

## Changing the text

```js
title.text = 'New title';
```

**Effect**: The text the label displays changes to "New title" immediately. When positioned with constraints, the label's size is recomputed for the new text; you don't need to refresh the layout manually. The automatic size change is **not verified in the simulator**.

Write `null` to clear the text:

```js
title.text = null;
```

**Effect**: The label displays no text. **Not verified in the simulator.**

`text` accepts any value; values that aren't strings are converted with `String()`: `title.text = 5` displays "5".

> **Note:** After a label has displayed an attributed string (after [`attributedText`](../api/ui-label/attributedtext.md) was written), writing `text` replaces the text, but the styles from the old attributed string remain. For such a label, keep writing `attributedText` to change the content.

## Changing the font, size, and weight

A font is a [`UIFont`](../api/ui-font.md) object; its size and weight are fixed when it is created. `UIFont` can't be modified; to change the size or weight, create a new one and assign it.

```js
title.font = UIFont.systemFontOfSize(20, { weight: 'semibold' });
```

**Effect**: The text becomes the 20 pt semibold system font.

A monospaced font:

```js
title.font = UIFont.monospacedSystemFontOfSize(20, { weight: 'medium' });
```

**Effect**: Every character takes the same width, which suits numbers and code.

For other fonts, see [Setting fonts](fonts.md).

## Changing the color

```js
title.textColor = '#FF3B30';
```

**Effect**: The text turns red.

Colors are written as strings. You can use `'#RRGGBB'`, or system color names such as `'systemRed'` and `'label'`. System color names change automatically with Dark Mode. What you read back is also a string:

```js
title.textColor = '#336699';
console.log(title.textColor);
```

**Effect**: The console prints `#336699`.

An invalid color doesn't throw; a warning is printed to the console and the text keeps its previous color. For all forms, see [Setting colors](colors.md).

## Alignment

```js
title.textAlignment = 'center';
```

**Effect**: The text is horizontally centered within the label's width.

Alignment happens within the label's own width. When the label is exactly as wide as the text, the alignments look the same. In the example above, the title is constrained on both left and right, so the label is wider than the text and centering is visible. For the values, see [`textAlignment`](../api/ui-label/textalignment.md).

## Displaying multi-line text

This is the recommended way to write multi-line text: set the width with constraints on the left and right edges, set the number of lines to unlimited, and don't constrain the height.

```js
const para = new UILabel();
para.text = 'A fairly long passage that doesn\'t fit on one line. The label\'s width is set by the left and right constraints, ' +
            'the text wraps within that width, and the label\'s height equals the total height of all the lines.';
para.numberOfLines = 0;
para.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(para);

NSLayoutConstraint.activateConstraints([
  para.topAnchor.constraintEqualToAnchor(body.bottomAnchor, { constant: 12 }),
  para.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 24 }),
  para.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -24 }),
]);
```

**Effect**: This passage appears 12 pt below the description, 24 pt from each edge of the screen. All the text is shown, using as many lines as it needs. The label's height grows with the number of lines. **This code is not verified in the simulator.**

`numberOfLines` is the maximum number of lines shown; the default is `1`. `0` means "unlimited", not "zero lines".

## Why text shows only one line

When a long passage shows only one line, it is usually for one of these reasons:

| Cause | Fix |
| --- | --- |
| `numberOfLines` wasn't changed. When it is `1`, text doesn't wrap | Set it to `0` or a number greater than 1 |
| The width isn't determined. When the label's width isn't set by constraints, its intrinsic size is computed as "all the text on one line" (**not verified in the simulator**), and the text doesn't wrap | Constrain the left and right edges, or set [`preferredMaxLayoutWidth`](../api/ui-label/preferredmaxlayoutwidth.md) |
| The height is constrained. Once the height is constrained, lines that don't fit aren't shown | Remove the height constraint |

## Limiting the number of lines

```js
body.numberOfLines = 3;
```

**Effect**: The text wraps automatically within the label's width and shows at most 3 lines. When 3 lines aren't enough, the 3rd line ends with "…". When the text is shorter than 3 lines, it shows as many lines as it has.

## A different truncation when text doesn't fit

[`lineBreakMode`](../api/ui-label/linebreakmode.md) determines how text that doesn't fit is handled. By default, an ellipsis is shown at the end.

```js
body.numberOfLines = 1;
body.lineBreakMode = 'byTruncatingMiddle';
```

**Effect**: The text shows on one line. The beginning and end are kept, and the middle is replaced with "…". This suits content with information at both ends, such as file names and addresses. **Not verified in the simulator.**

To clip without an ellipsis:

```js
body.lineBreakMode = 'byClipping';
```

**Effect**: The part that doesn't fit isn't shown, with no ellipsis. **Not verified in the simulator.**

## Shrinking text automatically when it's too long

When single-line text doesn't fit, you can have the label shrink the font size instead of truncating.

```js
title.numberOfLines = 1;
title.adjustsFontSizeToFitWidth = true;
title.minimumScaleFactor = 0.5;
```

**Effect**: When the text fits, it shows at the original size. When it doesn't, the font size shrinks automatically until the whole line fits, down to at most half the original size. If it still doesn't fit at half size, it is then truncated according to `lineBreakMode`. **Not verified in the simulator.**

`title.font` still reads the original font and doesn't reflect the shrunk size. **Not verified in the simulator.**

Explicitly set [`minimumScaleFactor`](../api/ui-label/minimumscalefactor.md) to a value greater than 0 to give the shrinking a lower limit.

## Measuring how much space text needs

A label can compute how big it needs to be to show all its text. The result is returned synchronously, not through a callback or a Promise.

```js
const heading = new UILabel();
heading.text = 'Hello, Nacre';
heading.font = UIFont.systemFontOfSize(34, { weight: 'bold' });

const size = heading.intrinsicContentSize;
console.log(size.width, size.height);
```

**Effect**: The console prints the width and height of the text, in [pt](../api/units.md). Measured for this text and font: 188.33 wide and 40.67 tall.

`intrinsicContentSize` is the intrinsic size: how big the text needs to be with no width limit. To ask "how big does it need to be with at most this much width", use `sizeThatFits()`:

```js
const need = body.sizeThatFits(new CGSize(300, 9999));
console.log(need.width, need.height);
```

**Effect**: The console prints the width and height `body` needs when its width is at most 300 pt. The result is limited by `numberOfLines`.

Neither member changes the label. The label doesn't need to be added to a page first; you can measure it as soon as it's created.

## Sizing a label to fit its text when positioning with `frame`

When you write `frame` directly instead of using constraints, the label doesn't grow on its own. A new label is 0 wide and 0 tall, and its text isn't visible on screen. Measure first, then write `frame`:

```js
const note = new UILabel();
note.text = '3 items';

const fit = note.intrinsicContentSize;
note.frame = new CGRect(24, 300, fit.width, fit.height);
page.view.addSubview(note);
```

**Effect**: "3 items" appears 24 pt from the left of the screen and 300 pt from the top, and the label is exactly the size of the text.

`note.sizeToFit()` does "measure and resize to that size" in one step, without changing the position.

If you later change `text` or `font`, the label's size doesn't follow; measure again and write `frame`.

## Computing the height of multi-line text when positioning with `frame`

The height of multi-line text depends on the width: the same text uses fewer lines when wider and more lines when narrower. So decide the width first, then ask for the height.

```js
const width = page.view.bounds.width - 48;   // 24 pt on each side

const block = new UILabel();
block.text = 'A fairly long passage that doesn\'t fit on one line; its height is only known after wrapping it at the given width.';
block.numberOfLines = 0;

const blockSize = block.sizeThatFits(new CGSize(width, 9999));
block.frame = new CGRect(24, 340, width, blockSize.height);
page.view.addSubview(block);
```

**Effect**: The text wraps within `width` and is shown in full. The label's height is exactly the total height of the lines.

Giving `sizeThatFits()` a very large height means the height has no upper limit.

## Specifying the wrap width for multi-line text with constraints

For a multi-line label whose position is constrained but whose width isn't, use [`preferredMaxLayoutWidth`](../api/ui-label/preferredmaxlayoutwidth.md) to tell it how wide to wrap.

```js
body.numberOfLines = 0;
body.preferredMaxLayoutWidth = 320;
console.log(body.intrinsicContentSize.height);
```

**Effect**: The console prints the total height of the text wrapped at a width of 320 pt. **Not verified in the simulator.**

When the label's width is already set by constraints, you generally don't need this property; the system wraps at the width from the constraints.

## Adding a text shadow

```js
title.shadowColor = 'rgba(0,0,0,.25)';
title.shadowOffset = new CGSize(0, 2);
```

**Effect**: 2 pt directly below each character appears a semi-transparent black copy of the same shape. The shadow has crisp edges, with no blur. **Not verified in the simulator.**

Text shadows have no blur radius. For a shadow with blurred edges, use the layer's shadow properties; see [Drawing rounded corners, shadows, gradients, and shapes with layers](layers.md).

## Showing text as unavailable

```js
title.isEnabled = false;
```

**Effect**: The text fades, indicating the content is currently unavailable. Set it back to `true` to restore. **Not verified in the simulator.**

## Temporarily switching to a different text color

[`highlightedTextColor`](../api/ui-label/highlightedtextcolor.md) is the text color when the label is in the highlighted state. The highlighted state is controlled by `isHighlighted`; the system doesn't switch it automatically.

```js
title.highlightedTextColor = 'systemYellow';
title.isHighlighted = true;
```

**Effect**: The text turns yellow. Set `isHighlighted` back to `false`, and the text returns to the `textColor` color. **Not verified in the simulator.**

## Following the system text size

A label's font size is determined by `font`; if `font` doesn't change, neither does the size. When the user enlarges text in system settings, the label doesn't change automatically. To follow it, get the font from a [`UIFont`](../api/ui-font.md) text style and assign it again when the system setting changes; for how, see [Setting fonts](fonts.md).

## Text color in Dark Mode

The default text color is the semantic color `label`: black in Light Mode and white in Dark Mode, switching automatically. When you set a color yourself, use a semantic color or `light-dark()`, which also switch automatically; see [Setting colors](colors.md).

## Making a label respond to taps

A label's `isUserInteractionEnabled` is `false` by default, so touches go to the view behind it. To respond to taps, set it to `true` and add a gesture recognizer; see [Gesture recognizers](../api/ui-gesture-recognizer.md). If you need feedback when pressed, use a [`UIButton`](../api/ui-button.md).

## Aligning text to the top

When a label is taller than its text, the text is vertically centered within the label, and there is no vertical alignment property (**not verified in the simulator**). When the height isn't constrained, the label's height equals the text's height, so this doesn't come up.

## See also

- [`UILabel`](../api/ui-label.md): all properties
- [`UIFont`](../api/ui-font.md), [Setting fonts](fonts.md)
- [`UIColor`](../api/ui-color.md), [Setting colors](colors.md)
- [Displaying styled text](attributed-text.md): mixing several fonts, colors, and underlines in one passage
- [Auto Layout](../api/auto-layout.md): positioning with constraints
