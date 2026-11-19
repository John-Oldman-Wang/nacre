# Setting fonts

This guide shows how to use [`UIFont`](../api/ui-font.md) to set the font of text: size, weight, italic, monospaced, following the user's text size setting, and using a font by name. The details of each method and property are on the [`UIFont`](../api/ui-font.md) reference page.

## Recommended approach

- **Use the system font for UI text.** It always exists, the methods that get it never return `null`, and it comes in nine weights.
- **For text meant to be read, such as body text and descriptions, use [`preferredFontForTextStyle()`](../api/ui-font/preferredfontfortextstyle.md)** so it follows the user's text size setting; **for text whose position and size are fixed** (such as tab bars and fixed-height buttons), use [`systemFontOfSize()`](../api/ui-font/systemfontofsize.md) so it doesn't overflow when the size grows.
- **Following the text size setting takes two steps**: get the font with `preferredFontForTextStyle()`; when the setting changes, get it again and assign it to `font`. A font object you already have doesn't change on its own.

## First example

Starting from a blank App, put two lines of text on the view controller, top to bottom: a bold title and a line of body text.

```js
application.addEventListener('sceneconnect', (e) => {
  // Build the window and view controller. Every App needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Create a container that arranges its content vertically
  const column = new UIStackView();
  column.translatesAutoresizingMaskIntoConstraints = false;
  column.axis = 'vertical';
  column.spacing = 12;          // 12 pt between each pair of lines
  page.view.addSubview(column);

  // 2. Title: system font, 34 pt, bold
  const title = new UILabel();
  title.text = 'Hello, Nacre';
  title.font = UIFont.systemFontOfSize(34, { weight: 'bold' });
  column.addArrangedSubview(title);

  // 3. Body: system font, 17 pt, regular weight
  const body = new UILabel();
  body.text = 'The quick brown fox';
  body.font = UIFont.systemFontOfSize(17);
  column.addArrangedSubview(body);

  // 4. Place the container at the top of the view controller, 16 pt from each side
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
- The second line is 17 pt text in regular weight.

Every line is written the same way: create a `UILabel`, set `text`, and assign a font object to `font`. The sections below change only the "get a font object" step, and reuse `body` (the body text `UILabel`) and `column` (the container holding the text) from here. For containers and constraints, see [`UIStackView`](../api/ui-stack-view.md) and [Auto Layout](../api/auto-layout.md). To try a section on its own, write these lines first:

```js
const page = new UIViewController();
const column = new UIStackView();
column.axis = 'vertical';
page.view.addSubview(column);
const body = new UILabel();
column.addArrangedSubview(body);
```

## Setting the size

```js
body.font = UIFont.systemFontOfSize(20);
```

**Effect**: the line becomes 20 pt system font in regular weight. The label gets taller, and the content below moves down.

The size is in [pt](../api/units.md) and doesn't change with the screen size.

## Setting the weight

Pass `weight` in the second argument.

```js
body.font = UIFont.systemFontOfSize(17, { weight: 'semibold' });
```

**Effect**: the text becomes semibold, still at 17 pt.

`weight` has nine values; see [Font weights](../api/ui-font.md#weights). If you just want ordinary bold, there is a shorthand:

```js
body.font = UIFont.boldSystemFontOfSize(17);
```

**Effect**: the text becomes 17 pt bold. **Not verified in the simulator.**

An unrecognized weight name throws `TypeError` rather than falling back to `'regular'`:

```js
try {
  // @ts-expect-error 'extrabold' is not a valid weight name
  UIFont.systemFontOfSize(17, { weight: 'extrabold' });
} catch (err) {
  console.log(String(err));
}
```

**Effect**: the console logs `TypeError: weight has no value "extrabold"; expected one of: ultraLight / thin / light / regular / medium / semibold / bold / heavy / black`.

## Using italic

```js
body.font = UIFont.italicSystemFontOfSize(17);
```

**Effect**: the text becomes 17 pt italic in regular weight. **Not verified in the simulator.**

This method doesn't accept `weight`, so you can't specify italic and a weight at the same time.

## Showing code: using a monospaced font

```js
body.text = '0123456789';
body.font = UIFont.monospacedSystemFontOfSize(20, { weight: 'medium' });
```

**Effect**: each of the ten digits takes the same width.

## Showing changing numbers: monospacing only the digits

Numbers such as timers, countdowns, and prices keep changing. In the system font the digits have different widths, so when a number changes, the width of the whole line changes with it (**not verified in the simulator**).

```js
body.text = '00:59';
body.font = UIFont.monospacedDigitSystemFontOfSize(17, { weight: 'regular' });
```

**Effect**: the text looks the same as the ordinary system font. Changing `text` from `'00:59'` to `'01:11'` doesn't change the total width of the text. **Not verified in the simulator.**

## Following the system text size setting

Users can adjust text size in the system's Settings > Display & Brightness > Text Size. `preferredFontForTextStyle()` returns a font for a given purpose, with a size that depends on the user's current setting.

```js
body.font = UIFont.preferredFontForTextStyle('body');
console.log(body.font.pointSize);
```

**Effect**

- The text is shown in the "body" style.
- The console logs the body size under the current setting. After the user makes text larger and relaunches the App, the logged number gets bigger and the text gets larger. **"Gets larger after making text larger" is not verified in the simulator.**

For the available style names, see [Text styles](../api/ui-font.md#text-styles).

## Updating fonts after the user changes the system text size

A font object that has already been created doesn't change on its own. After the user changes the setting, `application` fires the `contentsizecategorychange` event; get the font again in the callback.

```js
application.addEventListener('contentsizecategorychange', () => {
  body.font = UIFont.preferredFontForTextStyle('body');
});
```

**Effect**: while the App is running, if the user changes text size in Settings, this line of text switches to the new size on returning to the App. **Not verified in the simulator.**

When several labels need updating, write "get the font and assign it" as one function, call it once when building the UI, and call it again in the event callback.

Larger text needs more space in the label. When a label is positioned with constraints and its height isn't constrained, its size adjusts to the new font automatically. Point values such as spacing and icon sizes don't change along with it; whether to increase them is up to the App's code.

## Using a font by name

```js
const helvetica = UIFont.fontWithName('Helvetica', { size: 17 });
if (helvetica) {
  body.font = helvetica;
}
```

**Effect**: if the system has this font, the text switches to 17 pt Helvetica. **Not verified in the simulator.**

If the system has no font with this name, the method returns `null` without throwing, so check first. Only fonts that ship with the system can be used; font files bundled with the App can't be used yet.

## Changing the size based on an existing font

Font objects are immutable, and there is no method to "copy and change the size". Instead, create another one the same way as the original.

System font: call the original static method again with the new size.

```js
const small = UIFont.systemFontOfSize(15, { weight: 'medium' });
const large = UIFont.systemFontOfSize(small.pointSize * 2, { weight: 'medium' });
body.font = large;
```

**Effect**: the text becomes 30 pt system font in medium weight.

Font by name: get it again using the original font's `fontName`.

```js
const base = UIFont.fontWithName('Helvetica', { size: 17 });
if (base) {
  const bigger = UIFont.fontWithName(base.fontName, { size: 24 });
  if (bigger) {
    body.font = bigger;
  }
}
```

**Effect**: the text becomes 24 pt Helvetica. **Not verified in the simulator.**

> **Note:** don't use the second approach on the system font. The system font's `fontName` is an internal name starting with a dot, such as `.SFUI-Regular`, and isn't guaranteed to be retrievable with `fontWithName()`. **Not verified in the simulator.**

## Reading font metrics

```js
const font = UIFont.systemFontOfSize(17);
console.log(font.pointSize);
console.log(font.lineHeight);
console.log(font.ascender, font.descender);
```

**Effect**

- The first line logs `17`.
- The second line logs the height of one line of text, in pt.
- The third line logs the heights above and below the baseline, in pt. The exact values are **not verified in the simulator**.

These numbers depend only on the font, not on the text content. To find out how wide and tall a specific piece of text is, ask the label that displays it:

```js
const size = body.intrinsicContentSize;
console.log(size.width, size.height);
```

**Effect**: the console logs the width and height of this line of text as displayed in the current font, in pt.

## Applying a font to a button

A button has no `font` property of its own. The text on a button is displayed by a `UILabel` inside the button; get it through `titleLabel` and set the font there.

```js
const button = UIButton.buttonWithType('system');
button.setTitle('OK', { forState: ['normal'] });
const titleLabel = button.titleLabel;
if (titleLabel) {
  titleLabel.font = UIFont.systemFontOfSize(20, { weight: 'semibold' });
}
column.addArrangedSubview(button);
```

**Effect**: a button appears at the bottom of the container, with 20 pt semibold text.

`titleLabel` can be `null`, so check first. See [`UIButton`](../api/ui-button.md) for details.

## Applying a font to a text field

[`UITextField`](../api/ui-text-field.md) (a single-line text field) has its own `font` property, written the same way as on `UILabel`.

```js
const field = new UITextField();
field.font = UIFont.systemFontOfSize(20);
column.addArrangedSubview(field);
```

**Effect**: a text field appears at the bottom of the container, and the text typed into it is 20 pt. **Not verified in the simulator.**

## Checking whether two fonts are the same

```js
const a = UIFont.systemFontOfSize(17);
const b = UIFont.systemFontOfSize(17);
console.log(a === b);

body.font = a;
console.log(body.font === a);
```

**Effect**: the console logs `true` twice.

> **Note:** there is no guarantee that calling `fontWithName()` twice gives the same object. Don't rely on `===` to compare fonts obtained by name; compare `fontName` and `pointSize` instead.

## See also

- [`UIFont`](../api/ui-font.md): all methods and properties
- [`UILabel`](../api/ui-label.md), [Displaying text](labels.md): where fonts are used
- [`application`](../api/application.md): the `contentsizecategorychange` event
