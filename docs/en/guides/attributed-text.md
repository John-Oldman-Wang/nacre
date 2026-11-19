# Displaying styled text

This guide covers how to use [attributed strings](../api/ns-attributed-string.md) to mix several fonts and colors in one piece of text, add underlines, strikethroughs, and shadows, adjust line spacing and alignment, insert images, measure size, and how attributed strings are read and written on labels, text fields, and buttons. The details of each class are on the reference pages for [`NSAttributedString`](../api/ns-attributed-string.md), [`NSMutableAttributedString`](../api/ns-mutable-attributed-string.md), [`NSParagraphStyle`](../api/ns-paragraph-style.md), [`NSShadow`](../api/ns-shadow.md), and [`NSTextAttachment`](../api/ns-text-attachment.md).

## Recommended approach

- **When a whole piece of text has one style, use `text`; use an attributed string only when you need to mix several styles in one piece.** A label's `text`, `font`, and `textColor` are simpler to write.
- **Set up the style objects first, then build the attributed string, and finally hand it to the view.** A view takes the content as of the moment of assignment; paragraph styles and shadows placed into an attributed string are also copies as of that moment. Changing them afterward doesn't update the interface. To change something, build a new one and assign it again.
- **Once a label has displayed an attributed string, keep writing `attributedText` to change its content.** Writing `text` afterward keeps the old styles.
- **To compare the content of two attributed strings, use [`isEqualToAttributedString()`](../api/ns-attributed-string/isequaltoattributedstring.md)**, not `===`: what you read back from a view is a snapshot, and each read may be a different object.

## First example

Starting from a blank app, display a line with a price on screen: ordinary small text first, the price in large red text, and the original price in gray with a strikethrough.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Build it piece by piece; each piece has its own attributes
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

  // 2. Hand it to a label to display
  const label = new UILabel();
  label.attributedText = text;

  // 3. Put it on the view controller, centered
  label.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(label);
  NSLayoutConstraint.activateConstraints([
    label.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    label.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  ]);
});
```

**Effect** (not verified in the simulator)

- A line of text appears in the center of the screen: "Now" in 15 pt regular text, "¥128" in 26 pt red bold, and "¥199" in 13 pt gray with a line through it.
- The bottoms of the three pieces sit on the same baseline.

The examples below all reuse `label` from here: a label added to the view controller. To try a section on its own, start with these lines:

```js
const page = new UIViewController();
const label = new UILabel();
page.view.addSubview(label);
```

## Using one set of attributes for the whole text

```js
label.attributedText = new NSAttributedString('Important notice', {
  font: UIFont.boldSystemFontOfSize(17),
  foregroundColor: '#ff3b30',
  kern: 2,
});
```

**Effect** (not verified in the simulator): The text is red bold, with 2 pt more space than usual between characters.

## Styling only part of the text

First build a mutable attributed string from the whole text, then add attributes to a range with [`addAttribute()`](../api/ns-mutable-attributed-string/addattribute.md). For how to write ranges, see [How to write ranges](../api/ns-attributed-string.md#how-ranges-are-written).

```js
const source = 'Total ¥128.00';
const priceText = new NSMutableAttributedString(source, { font: UIFont.systemFontOfSize(17) });
const start = source.indexOf('¥');
priceText.addAttribute('foregroundColor', {
  value: 'systemRed',
  range: new NSRange(start, source.length - start),
});
label.attributedText = priceText;
```

**Effect** (not verified in the simulator): "Total" is in the default color, and "¥128.00" is red.

`addAttribute()` touches only this one attribute; the range's original font stays the same.

## Underlines and strikethroughs

The values of `underlineStyle` and `strikethroughStyle` are arrays containing the line style, optionally plus a dash pattern; see [Line styles](../api/ns-attributed-string.md#line-styles).

```js
const lineText = new NSMutableAttributedString('Solid Double Dashed', {
  font: UIFont.systemFontOfSize(17),
});
lineText.addAttribute('underlineStyle', { value: ['single'], range: new NSRange(0, 5) });
lineText.addAttribute('underlineStyle', { value: ['double'], range: new NSRange(6, 6) });
lineText.addAttributes(
  { underlineStyle: ['single', 'patternDash'], underlineColor: 'systemRed' },
  { range: new NSRange(13, 6) },
);
label.attributedText = lineText;
```

**Effect**: "Solid" has one line under it, and "Dashed" has a red dashed line under it. "Double" has two lines; the upper one sits against the bottom of the text, and whether the lower one is visible depends on the label's height; see the first note below.

> **Note:** When the label's height exactly equals the text's height, the lower line of the double underline isn't visible. For 17 pt text, the height the label computes for itself is 20.33 pt, and the second line of the double underline is drawn outside that area; the label doesn't draw anything outside it. Give the label a taller height to see both lines, for example with a height constraint: `label.heightAnchor.constraintEqualToConstant(28)`. The bottom of a thick line (`'thick'`) is also clipped slightly.

> **Note:** The length of each dash follows the font size. For 17 pt text, a `'patternDash'` dash is about the width of one Chinese character, so two such characters have only two dashes under them with a small gap in between, which at a glance looks like a solid line. For shorter gaps, use `'patternDot'`.

When `underlineColor` isn't set, the line has the same color as the text.

## Adjusting line spacing and alignment

Line spacing, alignment, and indentation belong to the paragraph style. Create an [`NSMutableParagraphStyle`](../api/ns-mutable-paragraph-style.md), set it up, and put it in as the `paragraphStyle` attribute.

```js
const style = new NSMutableParagraphStyle();
style.alignment = 'center';
style.lineSpacing = 8;

label.numberOfLines = 0;
label.attributedText = new NSAttributedString('Line one\nLine two', {
  font: UIFont.systemFontOfSize(17),
  paragraphStyle: style,
});
```

**Effect** (not verified in the simulator): The two lines are centered, with 8 pt more space than usual between them.

A paragraph style applies to every paragraph it covers in full. A paragraph is the text between two newline characters.

## Inserting an image in text

First wrap the image in an [attachment](../api/ns-text-attachment.md), then build a one-character attributed string from the attachment and splice it into the text.

```js
const star = UIImage.systemImageNamed('star.fill');
if (star !== null) {
  const attachment = NSTextAttachment.textAttachmentWithImage(star);
  attachment.bounds = new CGRect(0, -3, 18, 18);

  const starText = new NSMutableAttributedString('Rating ', { font: UIFont.systemFontOfSize(17) });
  starText.appendAttributedString(NSAttributedString.attributedStringWithAttachment(attachment));
  starText.appendAttributedString(new NSAttributedString(' 4.8'));
  label.attributedText = starText;
}
```

**Effect** (not verified in the simulator): An 18 × 18 pt star sits between "Rating" and "4.8", 3 pt below the text baseline.

The origin of `bounds` is on the text baseline; a negative `y` moves it down. Without `bounds`, the image is shown at its own size with its bottom on the baseline.

## Changing the placeholder color

```js
const field = new UITextField();
field.attributedPlaceholder = new NSAttributedString('Enter your phone number', {
  foregroundColor: 'systemOrange',
});
```

**Effect** (not verified in the simulator): When the text field is empty, it shows "Enter your phone number" in orange.

## Using an attributed string as a button title

```js
const button = UIButton.buttonWithType('system');
button.setAttributedTitle(new NSAttributedString('Outlined', {
  font: UIFont.boldSystemFontOfSize(22),
  strokeWidth: 3,
  strokeColor: 'systemIndigo',
}), { forState: ['normal'] });
```

**Effect** (not verified in the simulator): The text on the button has only an indigo outline, with no fill.

Once a state has an attributed title, that state no longer shows the text given by `setTitle()`, and the color from `setTitleColor()` has no effect either.

## Measuring how much space an attributed string takes

For a single line, use [`size()`](../api/ns-attributed-string/size.md). To limit the width and let it wrap, use [`boundingRectWithSize()`](../api/ns-attributed-string/boundingrectwithsize.md), with `'usesLineFragmentOrigin'` in `options`.

```js
const measured = new NSAttributedString('A fairly long piece of text that wraps when it does not fit on one line.', {
  font: UIFont.systemFontOfSize(17),
});
const oneLine = measured.size();
const wrapped = measured.boundingRectWithSize(
  new CGSize(200, Number.MAX_VALUE),
  { options: ['usesLineFragmentOrigin'] },
);
console.log(oneLine.width, Math.ceil(wrapped.height));
```

**Effect** (not verified in the simulator): The console prints two numbers. The first is the width on a single line, and the second is the height needed when the width is limited to 200 pt, both in pt.

When the height is unlimited, write it as `Number.MAX_VALUE`. The measured numbers have fractions; round up when using them as a view's size.

## Reading and writing attributed strings on the four views

| Member | Type | Readable | Writable | Description |
| --- | --- | --- | --- | --- |
| [`UILabel.attributedText`](../api/ui-label/attributedtext.md) | `NSAttributedString` or `null` | Yes | Yes | The styled text. `null` when there is no content |
| `UITextField.attributedText` | `NSAttributedString` or `null` | Yes | Yes | The styled content |
| `UITextField.attributedPlaceholder` | `NSAttributedString` or `null` | Yes | Yes | The styled placeholder |
| `UITextView.attributedText` | `NSAttributedString` or `null` | Yes | Yes | The styled content. Writing `null` clears it |
| [`UIButton.currentAttributedTitle`](../api/ui-button/currentattributedtitle.md) | `NSAttributedString` or `null` | Yes | No | The styled title actually shown in the current state |

`attributedText` and `text` are two ways of reading and writing the same content. After writing `attributedText`, reading `text` gives the plain text in it. The other way around, writing `text` after having written `attributedText` differs among the three views:

| View | After writing `text` again |
| --- | --- |
| `UILabel` | The text is replaced, and **the styles from the old attributed string are kept**. For example, if it had an underline, the new text also has one |
| `UITextView` | The text is replaced, and the old styles are removed |
| `UITextField` | The text is replaced. Whether the old styles are kept is **not verified in the simulator** |

So once a label has displayed an attributed string, keep writing `attributedText` to change its content: assign a new attributed string, replacing content and styles together. Whether writing `attributedText = null` first and then `text` removes the styles is **not verified in the simulator**.

```js
label.attributedText = new NSAttributedString('On sale', { underlineStyle: ['single'] });
label.text = 'Ended';
const now = label.attributedText;
console.log(now === null ? 'null' : (now.attributesAtIndex(0).underlineStyle || []).join(','));
```

**Effect**: The console prints `single`. The label's text has changed to "Ended", and the underline is still there.

`attributedPlaceholder` and `placeholder` are also the same content: after writing one, the text read from the other changes too.

Writing `attributedText` in code doesn't fire the `input` event, the same as writing `text` in code.

Buttons are set per state, the same way as [`setTitle()`](../api/ui-button/settitle.md):

| Method | Description |
| --- | --- |
| [`setAttributedTitle()`](../api/ui-button/setattributedtitle.md) | Sets the styled title for these states. Passing `null` as `title` removes it, and the state goes back to using the `normal` one |
| [`attributedTitleForState()`](../api/ui-button/attributedtitleforstate.md) | Reads the styled title used for this state. The parameter is one state name |

For a state that hasn't been set separately, `attributedTitleForState()` returns the `normal` one, the same as [`titleForState()`](../api/ui-button/titleforstate.md). If `normal` hasn't been set either, it returns `null`.

```js
const submit = UIButton.buttonWithType('system');
submit.setAttributedTitle(new NSAttributedString('Submit'), { forState: ['normal'] });

submit.attributedTitleForState('normal');     // An attributed string with the content "Submit"
submit.attributedTitleForState('disabled');   // Also "Submit": not set separately, so the normal one is returned
```

What you read back is a snapshot and isn't necessarily the same object you wrote; compare content with `isEqualToAttributedString()`.

- **Errors**:
  - The written value isn't an attributed string: `TypeError: attributedText needs a native object or null, got "plain text"`
  - The written value is a different native object: `TypeError: attributedText needs a NSAttributedString or null`
  - `forState` wasn't passed: `TypeError: setAttributedTitle needs { forState }`

## See also

- [`NSAttributedString`](../api/ns-attributed-string.md): all attribute names and how to write ranges
- [`NSMutableAttributedString`](../api/ns-mutable-attributed-string.md): changing attributes and text
- [`NSMutableParagraphStyle`](../api/ns-mutable-paragraph-style.md): paragraph styles
- [`NSShadow`](../api/ns-shadow.md), [`NSTextAttachment`](../api/ns-text-attachment.md)
- [Displaying text](labels.md): other ways to use labels
