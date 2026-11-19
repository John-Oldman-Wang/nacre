# Building a multiline text view

This guide shows how to use [`UITextView`](../api/ui-text-view.md) for multiline input: reading and writing the content, showing placeholder text, growing with the content, read-only display, dismissing the keyboard, and staying clear of the keyboard. The details of each property, method, and event are on the [`UITextView`](../api/ui-text-view.md) reference page. For single-line input, see [Building a text field](text-fields.md).

## Recommended approach

- **Always set `font`.** A new text view has no font set, and its text is smaller than the system's standard 17 pt body text (measured: with one line of text it wants a height of 30 pt; with 17 pt text it is 36 pt).
- **Give it a background color and rounded corners.** A new text view's background is the page background with no border, so on the page you cannot tell where to tap.
- **Set `keyboardDismissMode = 'onDrag'`, or provide a button that dismisses the keyboard (put it in [`inputAccessoryView`](#putting-a-done-button-above-the-keyboard)).** Otherwise there is no way to dismiss the keyboard once it appears.
- **Near the bottom of the screen, constrain the bottom edge of its container to `keyboardLayoutGuide.topAnchor`.** See [Keeping it clear of the keyboard](#keeping-it-clear-of-the-keyboard).
- **Listen to content changes with `input`, and save when editing ends with `blur`.**

## First multiline text input

Starting from a blank app, put a multiline input near the top of the screen, with a line of text below it showing the content's length.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Create the text view and set its appearance
  const input = new UITextView();
  input.font = UIFont.systemFontOfSize(17);            // without this the text is tiny
  input.backgroundColor = 'secondarySystemBackground'; // a gray background shows its extent
  input.layer.cornerRadius = 10;
  input.keyboardDismissMode = 'onDrag';                // dismiss the keyboard when the text is dragged down

  // 2. A line of text showing the content's length
  const counter = new UILabel();
  counter.text = 'Length 0';
  counter.textColor = 'secondaryLabel';

  // 3. Update that line whenever the content changes
  input.addEventListener('input', () => {
    counter.text = 'Length ' + input.text.length;
  });

  // 4. Read all the content when editing ends
  input.addEventListener('blur', () => {
    console.log('You typed: ' + input.text);
  });

  // 5. Put them on the page: 16 pt margins on both sides, 160 pt tall; the line of text below it
  input.translatesAutoresizingMaskIntoConstraints = false;
  counter.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(input);
  page.view.addSubview(counter);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    input.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
    input.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    input.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
    input.heightAnchor.constraintEqualToConstant(160),
    counter.topAnchor.constraintEqualToAnchor(input.bottomAnchor, { constant: 8 }),
    counter.leadingAnchor.constraintEqualToAnchor(input.leadingAnchor),
  ]);
});
```

**Effect**

- A gray rounded area appears near the top of the screen, with a line of gray text "Length 0" below it.
- Tapping the gray area brings up the keyboard and a cursor in the area.
- With each character typed, the number in the line below changes. Pressing Return moves to the next line.
- Once the text exceeds the 160 pt height, the area scrolls up and down.
- Dragging the text down with a finger dismisses the keyboard, and the console logs `You typed: ` followed by all the content.

This code has not been run as a whole in the simulator; the five points above are **not verified in the simulator**. Reading and writing each property, and the firing of `input` and `blur`, were measured in a small program without UI.

> **Note:** When the simulator is connected to the computer's hardware keyboard, the on-screen keyboard does not appear. This is simulator behavior. To see the on-screen keyboard, turn off the hardware keyboard connection in the simulator's menu.

The following sections reuse the `input` and `page` variables. To try a section on its own, write these lines first:

```js
const page = new UIViewController();
const input = new UITextView();
page.view.addSubview(input);
```

## How the keyboard is dismissed

The keyboard follows focus: it appears when the text view becomes the first responder and is dismissed when it stops being the first responder; see [Focus](../api/ui-text-field.md#focus).

In a multiline input, Return inserts a line break, so you cannot dismiss the keyboard with Return as in a single-line text field. There are three ways:

| Approach | How |
| --- | --- |
| Dismiss when the user drags the text down | `input.keyboardDismissMode = 'onDrag'` |
| Put a "Done" button above the keyboard | Assign a toolbar with the button to `input.inputAccessoryView`, and call `input.resignFirstResponder()` in the button's callback; see [Putting a "Done" button above the keyboard](#putting-a-done-button-above-the-keyboard) |
| Dismiss by tapping empty space | Add a tap gesture to the page and call `page.view.endEditing(true)` in its callback; see [Dismissing the keyboard by tapping empty space](text-fields.md#dismissing-the-keyboard-on-a-tap-in-empty-space) |

The actual effect of the three approaches is **not verified in the simulator**. The acceptance tests verify that `keyboardDismissMode` and `inputAccessoryView` can be written and read back, and that after code calls `resignFirstResponder()` the view is no longer the first responder and `blur` fires.

## Reading and writing the content

```js
console.log(input.text.length);
input.text = 'Line 1\nLine 2';
console.log(input.hasText);
```

**Effect**: the first line logs the length of the current content. With no content, `text` is the empty string `''`, not `null`. The second line replaces the content with two lines of text; a line break is `\n` in the string. The third line logs `true`.

After writing `text`, the cursor is at the end of the content (verified by testing). Writing `null` or `undefined` gives an empty string. Writing `text` does not fire `input`.

## Limiting the input length

```js
const LIMIT = 200;
input.addEventListener('input', () => {
  if (input.text.length > LIMIT) {
    input.text = input.text.slice(0, LIMIT);
  }
});
```

**Effect**: when the content exceeds 200 UTF-16 code units, the excess is removed. Writing `text` does not fire `input`, so the callback does not run again because of it. After truncation, the cursor is at the end.

The user first sees the extra characters, which then disappear; this is **not verified in the simulator**.

## Showing placeholder text

A text view has no `placeholder` property. The approach is to overlay a [label](../api/ui-label.md) on it, shown when there is no content and hidden when there is.

```js
const hint = new UILabel();
hint.text = 'Write something…';
hint.font = input.font;
hint.textColor = 'placeholderText';
hint.translatesAutoresizingMaskIntoConstraints = false;
input.addSubview(hint);
NSLayoutConstraint.activateConstraints([
  // Text starts 8 pt from the top and 5 pt from the left; line the label up with it
  hint.topAnchor.constraintEqualToAnchor(input.topAnchor, { constant: 8 }),
  hint.leadingAnchor.constraintEqualToAnchor(input.leadingAnchor, { constant: 5 }),
]);

const syncHint = () => { hint.isHidden = input.hasText; };
input.addEventListener('input', syncHint);
syncHint();
```

**Effect**: with no content, gray "Write something…" appears in the top-left corner. When the user types the first character it disappears; when the content is all deleted it reappears. **The appearance is not verified in the simulator.**

The numbers 8 and 5 come from the default values of `textContainerInset` and `lineFragmentPadding`; see [How far text is from the edges](#how-far-text-is-from-the-edges). If you change those two values, change these accordingly.

After writing `input.text` in code, call `syncHint()` yourself, because writing `text` does not fire `input`.

## Making a text input that grows with its content

```js
const composer = new UITextView();
composer.font = UIFont.systemFontOfSize(17);
composer.backgroundColor = 'secondarySystemBackground';
composer.layer.cornerRadius = 10;
composer.isScrollEnabled = false;   // no scrolling; the height follows the content
composer.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(composer);

const safe = page.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  composer.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
  composer.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  composer.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  // no height given
]);
```

**Effect**: with no content it is one line of text tall (36 pt for 17 pt text). Each additional line of content makes it one line taller; deleting a line shrinks it back. Measured with 17 pt text: three lines are 77 pt tall, five lines 118 pt, six lines 138 pt.

This holds only after it is placed in a window. A text view not in a window keeps its original height when laid out again after the text changes (verified by testing).

With scrolling off, no amount of content can be scrolled; it just keeps growing.

## Displaying long text read-only

```js
input.isEditable = false;
input.text = 'A long piece of explanatory text…';
```

**Effect**: tapping it does not bring up the keyboard and the content cannot be modified, but the user can still long-press to select and copy text, and it scrolls when the content exceeds its height. **Not verified in the simulator.**

To disallow selection too, add `input.isSelectable = false`.

`isEditable` restricts only the user. Code can still change the content by writing `text` or calling `insertText()` and `deleteBackward()` (verified by testing).

## Reading and writing the cursor position and selection

```js
const range = input.selectedRange;
console.log(range.location, range.length);

input.selectedRange = new NSRange(0, 0);                  // cursor at the start
input.selectedRange = new NSRange(0, input.text.length);  // select all
const selected = input.text.slice(range.location, range.location + range.length);
```

**Effect**: `selectedRange` is an [`NSRange`](../api/ns-range.md): `location` is the start and `length` is how much is selected. A `length` of 0 means no text is selected, only a cursor at `location`. The last line extracts the selected text.

How the selection looks on screen is **not verified in the simulator**.

A text view does not limit reading and writing the selection to while it is being edited, so these lines do not need to focus it first.

## Getting notified when the cursor moves

```js
input.addEventListener('selectionchange', () => {
  const range = input.selectedRange;
  console.log('Cursor at ' + range.location + ', selected ' + range.length + ' code units');
});

input.selectedRange = new NSRange(0, 3);
```

**Effect**: after the last line runs, the console logs `Cursor at 0, selected 3 code units` (testing shows that writing `selectedRange` in code fires the event). Moving the cursor, dragging the selection, or typing each logs a line as well; that part is **not verified in the simulator**.

The event object does not carry the selection; read `input.selectedRange` in the callback. The callback runs a little later, and reads the selection as of the moment the callback runs.

## Inserting text at the cursor

```js
input.insertText('😀');
```

**Effect**: inserts an emoji at the cursor and moves the cursor after it. If text is selected, the selection is replaced with the emoji. Fires `input` once (verified by testing).

## Scrolling to a range of text

```js
input.scrollRangeToVisible(new NSRange(input.text.length, 0));
```

**Effect**: scrolls to the end of the content. Measured with a 200 × 60 pt text view containing 40 lines: after the call, `contentOffset.y` goes from 0 to 788.

## How far text is from the edges

```js
input.textContainerInset = new UIEdgeInsets(12, 12, 12, 12);
input.textContainer.lineFragmentPadding = 0;
```

**Effect**: the text is 12 pt from each edge.

The distance from the text to the left and right edges is the sum of two values: the left and right of `textContainerInset`, plus `textContainer.lineFragmentPadding`. The defaults are 0 plus 5, so in a new text view the text is 5 pt from the left edge. With `lineFragmentPadding` set to 0, the left and right distances are determined by `textContainerInset` alone.

## Showing at most a few lines

```js
input.isScrollEnabled = false;
input.isEditable = false;
input.textContainer.maximumNumberOfLines = 3;
input.textContainer.lineBreakMode = 'byTruncatingTail';
```

**Effect**: only the first three lines are laid out, and when the third line does not fit it ends with an ellipsis (**the ellipsis is not verified in the simulator**). The content of `text` does not change; the excess simply is not shown. Measured with six lines of 17 pt text: without a line limit it wants a height of 138 pt; limited to two lines, 57 pt.

## Keeping it clear of the keyboard

The keyboard covers the page; the page's size and position do not change. A text view near the bottom of the screen is covered by the keyboard. Constrain its bottom edge (or its container's) to the top edge of the page's `keyboardLayoutGuide`:

```js
input.bottomAnchor
  .constraintEqualToAnchor(page.view.keyboardLayoutGuide.topAnchor, { constant: -16 })
  .isActive = true;
```

**Effect**: when the keyboard is hidden, its bottom edge is 16 pt above the bottom of the safe area. When the keyboard is shown, its bottom edge is 16 pt above the top of the keyboard. **Not verified in the simulator.**

For `keyboardLayoutGuide`, see [Text fields and the keyboard](text-fields.md#keyboard-avoidance-one-constraint).

## Putting a "Done" button above the keyboard

`inputAccessoryView` is a view attached above the keyboard when it appears, shown and hidden together with the keyboard. In a multiline input Return inserts a line break, so the button that dismisses the keyboard usually goes here.

```js
const bar = new UIToolbar();
const done = UIBarButtonItem.systemItem('done');
done.addEventListener('click', () => input.resignFirstResponder());
bar.items = [UIBarButtonItem.flexibleSpace(), done];
bar.sizeToFit();
input.inputAccessoryView = bar;
```

**Effect**: tapping the text view brings up the keyboard with an extra [toolbar](../api/ui-toolbar.md) above it, with "Done" at the right end. Tapping it dismisses the keyboard, and the toolbar disappears with it. **This example is not verified in the simulator**; the acceptance tests contain assertions that "this view appears on screen after focusing", but they have not yet been run since they were written.

`bar.sizeToFit()` makes the toolbar measure its own height. A new toolbar's height is 0; without this line it takes up no space.

This property is the same as the property of the same name on [single-line text fields](text-fields.md#putting-a-row-of-buttons-above-the-keyboard): it can be any view, the same view can be given to several inputs, and changing it while editing takes effect immediately.

## Focusing and unfocusing from code

```js
const ok = input.becomeFirstResponder();
// …
input.resignFirstResponder();
```

**Effect**: the first line focuses it, the keyboard appears, and then `focus` fires. `ok` being `false` means the system refused and nothing happened; for when it is refused, see [Text fields and the keyboard](../api/ui-text-field.md#focus). The last line unfocuses it, the keyboard is dismissed, and then `blur` fires.

When `isEditable` is `false`, `becomeFirstResponder()` still returns `true` but does not fire `focus`, and unfocusing does not fire `blur` either (verified by testing, measured without a keyboard).

## See also

- [`UITextView`](../api/ui-text-view.md): all properties, methods, and events
- [`NSRange`](../api/ns-range.md), [`NSTextContainer`](../api/ns-text-container.md)
- [Building a text field](text-fields.md): single-line input, focus, staying clear of the keyboard
- [`UILabel`](../api/ui-label.md): the label used for placeholder text
