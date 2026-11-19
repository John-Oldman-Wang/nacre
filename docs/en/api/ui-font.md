---
type: reference
native: UIFont
status: partial
---

# `UIFont`

**`UIFont`** represents a font. One `UIFont` object determines three things at once: which typeface, what size, and how heavy the strokes are. Assign it to the `font` property of a view that displays text, such as [`UILabel`](ui-label.md), and the text is shown in this font.

Font objects are immutable: their size and weight cannot change after creation. To change the size, get another font object and assign it to `font` again. `UIFont` fires no events; all property values stay the same for the object's lifetime, so there are no change notifications.

**Inheritance**: `EventTarget` → `NSObject` → `UIFont`

For how to choose fonts for text and follow the system text size, see the guide [Setting fonts](../guides/fonts.md).

## Constructor

It cannot be created with `new` or subclassed. `new UIFont()` throws:

```
TypeError: Illegal constructor: UIFont is created by the runtime, not by new
```

All font objects are obtained through the static methods below. For the subclassing restriction, see [Native classes](native-classes.md).

## Static methods

System fonts:

| Method | Description |
| --- | --- |
| [`UIFont.systemFontOfSize()`](ui-font/systemfontofsize.md) | The system font, with an optional weight |
| [`UIFont.boldSystemFontOfSize()`](ui-font/boldsystemfontofsize.md) | The bold system font |
| [`UIFont.italicSystemFontOfSize()`](ui-font/italicsystemfontofsize.md) | The italic system font |
| [`UIFont.monospacedSystemFontOfSize()`](ui-font/monospacedsystemfontofsize.md) | The system monospaced font; all characters have the same width |
| [`UIFont.monospacedDigitSystemFontOfSize()`](ui-font/monospaceddigitsystemfontofsize.md) | The system font with only digits of equal width |

Other sources:

| Method | Description |
| --- | --- |
| [`UIFont.preferredFontForTextStyle()`](ui-font/preferredfontfortextstyle.md) | The system font for a purpose, sized by the user's text size setting |
| [`UIFont.fontWithName()`](ui-font/fontwithname.md) | Another font installed on the system, by name. Returns `null` if not found |

Which fonts are available:

| Member | Description |
| --- | --- |
| [`UIFont.familyNames`](ui-font/familynames.md) <small>read-only</small> | The names of all available font families |
| [`UIFont.fontNamesForFamilyName()`](ui-font/fontnamesforfamilyname.md) | The names of the fonts in a family, which can be passed to `fontWithName()` |

## Instance properties

Also inherits the properties of `NSObject`. All are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`familyName`](ui-font/familyname.md) <small>read-only</small> | The font family name |
| [`fontName`](ui-font/fontname.md) <small>read-only</small> | The specific font name |
| [`pointSize`](ui-font/pointsize.md) <small>read-only</small> | The font size |
| [`ascender`](ui-font/ascender.md) <small>read-only</small> | Distance from the baseline to the font's highest point |
| [`descender`](ui-font/descender.md) <small>read-only</small> | Distance from the baseline to the font's lowest point |
| [`capHeight`](ui-font/capheight.md) <small>read-only</small> | Height of capital letters |
| [`xHeight`](ui-font/xheight.md) <small>read-only</small> | Height of the lowercase x |
| [`lineHeight`](ui-font/lineheight.md) <small>read-only</small> | Height of a line of text |
| [`leading`](ui-font/leading.md) <small>read-only</small> | Extra spacing between lines suggested by the font |

## Font size units

Font sizes are in points ([pt](units.md)), the same unit as view positions and sizes. There are no other units. A label with no font set uses the 17 pt system font.

A font size is a fixed number. The font from `UIFont.systemFontOfSize(17)` is always 17 pt; it does not change with screen size or with the user's system settings.

## Where fonts come from

| Source | How | When not found |
| --- | --- | --- |
| System font | `systemFontOfSize()` and the other four methods | Always found |
| System font for a purpose, sized by user settings | `preferredFontForTextStyle()` | Always found |
| Other fonts installed on the system, by name | `fontWithName()` | Returns `null`, does not throw |

The "system font" is the font the iOS interface uses by default. It always exists, the methods that get it never return `null`, and it has nine weights to choose from.

`fontWithName()` has no fallback list: you can specify only one name at a time, and what to use instead when it is not found is up to the app's code. To find out which names are available, read [`familyNames`](ui-font/familynames.md) and [`fontNamesForFamilyName()`](ui-font/fontnamesforfamilyname.md).

All available fonts come with the system.

## Weights

Weight is the thickness of the strokes. The `weight` of `systemFontOfSize()`, `monospacedSystemFontOfSize()`, and `monospacedDigitSystemFontOfSize()` accepts nine names, listed from thinnest to heaviest:

| Value | Effect |
| --- | --- |
| `'ultraLight'` | Thinnest |
| `'thin'` | One step heavier than `'ultraLight'` |
| `'light'` | One step thinner than regular |
| `'regular'` | Regular weight. Used when `weight` is omitted |
| `'medium'` | One step heavier than regular |
| `'semibold'` | Semibold |
| `'bold'` | Bold |
| `'heavy'` | One step heavier than bold |
| `'black'` | Heaviest |

Only these nine names can be written, not numbers. An unrecognized name throws `TypeError` rather than falling back to `'regular'`:

```
TypeError: weight has no value "extrabold"; expected one of: ultraLight / thin / light / regular / medium / semibold / bold / heavy / black
```

## Text styles

Text styles are a set of fonts named by purpose, accepted by [`preferredFontForTextStyle()`](ui-font/preferredfontfortextstyle.md). The size and weight of each style are defined by the system and change with the user's text size setting. How much each style changes when the user adjusts the text size is also defined by the system.

| Value | Purpose |
| --- | --- |
| `'largeTitle'` | Large title at the top of a view controller |
| `'title1'` | First-level heading |
| `'title2'` | Second-level heading |
| `'title3'` | Third-level heading |
| `'headline'` | Paragraph heading |
| `'subheadline'` | Subheading below a heading |
| `'body'` | Body text |
| `'callout'` | Callout text |
| `'footnote'` | Footnotes |
| `'caption1'` | Captions for images or controls |
| `'caption2'` | Captions one size smaller |

Read the specific size of each style under the current setting with `pointSize`.

## Dynamic Type

"Dynamic Type" is an iOS system feature: the user picks a level in the system's "Settings → Display & Brightness → Text Size", and the text in every app gets larger or smaller accordingly. [Text styles](#text-styles) are how an app takes part in this feature.

Three rules:

- **Only fonts from `preferredFontForTextStyle()` follow the setting.** `systemFontOfSize(17)`, `fontWithName()`, and other methods with an explicit size always give that size.
- **Following happens at the moment of creation.** `preferredFontForTextStyle('body')` returns the body font for the setting "at this moment". It is still an immutable object: if the user changes the setting later, this object's `pointSize` does not change, and neither do labels already using it.
- **To follow changes while the app is running, assign again.** After the user changes the setting, [`application`](application.md) fires the `contentsizecategorychange` event; in the callback, call `preferredFontForTextStyle()` again and assign the result to `font`. See the guide [Setting fonts](../guides/fonts.md) for how.

The current level can be read from `application.contentSizeCategory`. The `traitchange` event of views and scenes also fires when the text size changes; see [`UITraitCollection`](ui-trait-collection.md).

[Point values](units.md) such as spacing and icon sizes do not change with the text size setting.

## Font metrics

A line of text is divided vertically into several parts, and the metric properties on a font object give the height of each part.

```
        ┬ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   highest point
        │  ascender
        │        ┬ capHeight (height of capital letters)
        │        │    ┬ xHeight (height of lowercase x)
baseline┴────────┴────┴─────────
        │  descender
        ┴ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   lowest point
```

- **Baseline**: the line letters stand on. Letters such as `g` and `y` extend partly below it.
- [`ascender`](ui-font/ascender.md), [`descender`](ui-font/descender.md): the distance from the baseline to the font's highest and lowest points.
- [`capHeight`](ui-font/capheight.md), [`xHeight`](ui-font/xheight.md): the height of capital letters and of the lowercase x.
- [`lineHeight`](ui-font/lineheight.md): the height of a line of text.
- [`leading`](ui-font/leading.md): the extra spacing between lines suggested by the font.

These values all change with the font size and are all in [pt](units.md). They depend only on the font, not on the text content. How wide and tall a particular piece of text is, read from the `intrinsicContentSize` of the label displaying it; see [`UILabel`](ui-label.md).

## Equality

The system returns the same object for system fonts with the same arguments, so `UIFont.systemFontOfSize(17) === UIFont.systemFontOfSize(17)` is `true`. Assigning a font to a label and reading it back also returns the original object.

Whether `fontWithName()` returns the same object for two calls is not guaranteed. To compare named fonts, compare `fontName` and `pointSize`.

## Where fonts are accepted

| Property | Description |
| --- | --- |
| [`font`](ui-label/font.md) of [`UILabel`](ui-label.md) | The label's font. Accepts a `UIFont` or `null` when written |
| `font` of [`UITextField`](ui-text-field.md) | The text field's font |
| `titleLabel.font` of [`UIButton`](ui-button.md) | The font of the button's text; written the same way as for `UILabel` |
| The `font` attribute of [`NSAttributedString`](ns-attributed-string.md) | The font of a range in an attributed string |

## Examples

### Five fonts

Starting from a blank app, put five lines of text on the page from top to bottom, each in a different font.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const column = new UIStackView();
  column.translatesAutoresizingMaskIntoConstraints = false;
  column.axis = 'vertical';
  column.spacing = 12;
  page.view.addSubview(column);

  const title = new UILabel();
  title.text = 'Hello, Nacre';
  title.font = UIFont.systemFontOfSize(34, { weight: 'bold' });
  column.addArrangedSubview(title);

  const body = new UILabel();
  body.text = 'The quick brown fox';
  body.font = UIFont.systemFontOfSize(17);
  column.addArrangedSubview(body);

  const italic = new UILabel();
  italic.text = 'The quick brown fox';
  italic.font = UIFont.italicSystemFontOfSize(17);
  column.addArrangedSubview(italic);

  const code = new UILabel();
  code.text = 'const x = 0123456789;';
  code.font = UIFont.monospacedSystemFontOfSize(17);
  column.addArrangedSubview(code);

  const note = new UILabel();
  note.text = 'Footnote text';
  note.font = UIFont.preferredFontForTextStyle('footnote');
  column.addArrangedSubview(note);

  console.log(title.font.fontName, title.font.pointSize);

  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    column.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 16 }),
    column.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    column.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  ]);
});
```

**Effect**

- The first line, "Hello, Nacre", is large bold text at 34 pt.
- The second line is 17 pt text at regular weight.
- The third line is the same size as the second, with letterforms slanted to the right. **Not verified in the simulator.**
- In the fourth line every character takes the same width, so letters and digits line up in columns.
- The fifth line is smaller than the second. If the user makes text larger in system settings and relaunches the app, this line gets larger while the first four stay the same. **Not verified in the simulator.**
- The console logs `.SFUI-Bold 34`.

This code has not been run as a whole in the simulator. `systemFontOfSize()`, `monospacedSystemFontOfSize()`, `preferredFontForTextStyle()`, `fontName`, and `pointSize` have been run in the acceptance tests; `italicSystemFontOfSize()` has not.

For more patterns, see the guide [Setting fonts](../guides/fonts.md).

## Corresponding iOS API

The method name is the first part of the ObjC method name. The remaining parts go into an options object, keyed by the ObjC part names. Weight and text style constants become strings with the prefix removed and the first letter lowercased.

| ObjC | JS |
| --- | --- |
| `[UIFont systemFontOfSize:17]` | `UIFont.systemFontOfSize(17)` |
| `[UIFont systemFontOfSize:28 weight:UIFontWeightBold]` | `UIFont.systemFontOfSize(28, { weight: 'bold' })` |
| `[UIFont boldSystemFontOfSize:17]` | `UIFont.boldSystemFontOfSize(17)` |
| `[UIFont italicSystemFontOfSize:17]` | `UIFont.italicSystemFontOfSize(17)` |
| `[UIFont monospacedSystemFontOfSize:20 weight:UIFontWeightMedium]` | `UIFont.monospacedSystemFontOfSize(20, { weight: 'medium' })` |
| `[UIFont monospacedDigitSystemFontOfSize:17 weight:UIFontWeightRegular]` | `UIFont.monospacedDigitSystemFontOfSize(17, { weight: 'regular' })` |
| `[UIFont fontWithName:@"Helvetica" size:17]` | `UIFont.fontWithName('Helvetica', { size: 17 })` |
| `[UIFont preferredFontForTextStyle:UIFontTextStyleBody]` | `UIFont.preferredFontForTextStyle('body')` |
| `UIFontWeightSemibold` | `'semibold'` |
| `UIFontTextStyleLargeTitle` | `'largeTitle'` |
| `font.familyName`, `font.fontName`, `font.pointSize` | Properties with the same names |
| `font.ascender`, `font.descender`, `font.capHeight`, `font.xHeight`, `font.lineHeight`, `font.leading` | Properties with the same names |
| `UIContentSizeCategoryDidChangeNotification` | `application.addEventListener('contentsizecategorychange', …)` |

Two differences from native:

- Native `monospacedSystemFontOfSize:weight:` and `monospacedDigitSystemFontOfSize:weight:` require a weight. In JS, `weight` can be omitted and defaults to `'regular'`.
- Native weights are floating-point constants, so any intermediate value can be written. JS accepts only the nine names.

### Comparison with the browser

| CSS | Here |
| --- | --- |
| The four properties `font-family`, `font-size`, `font-weight`, `font-style` | Combined into one `UIFont` object, assigned to `font` |
| `font-family: system-ui` | `UIFont.systemFontOfSize(size)` |
| `font-family: monospace` | `UIFont.monospacedSystemFontOfSize(size)` |
| `font-variant-numeric: tabular-nums` | `UIFont.monospacedDigitSystemFontOfSize(size)` |
| `font-weight: 100`–`900` | Nine weight names. Whether each step corresponds one-to-one to the CSS values has not been checked |
| A fallback list, `font-family: A, B, sans-serif` | None. `fontWithName()` returns `null` when not found |
| `px`, `em`, `rem` | Only pt |
| `line-height` | No corresponding writable property. `lineHeight` is a read-only font metric. The paragraph style of attributed strings can adjust line spacing; see [`NSParagraphStyle`](ns-paragraph-style.md) |
| Canvas `measureText()` | Read a font's height information from the `UIFont` metric properties, and a piece of text's width and height from the label's `intrinsicContentSize` |

## See also

- [Setting fonts](../guides/fonts.md): weight, italics, monospacing, following the system text size, named fonts
- [`UILabel`](ui-label.md): the view that displays text; the `font` property is on it
- [`UIButton`](ui-button.md): a button's text font is set through `titleLabel`
- [`application`](application.md): `contentSizeCategory` and the `contentsizecategorychange` event
- [Enums](enums.md): general rules for string values and how invalid values are reported
- [Units](units.md): what pt is
