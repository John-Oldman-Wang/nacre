# Building a text field

This guide covers how to use [`UITextField`](../api/ui-text-field.md) for single-line input: reading the content, responding to input, showing and dismissing the keyboard, staying clear of the keyboard, restricting input, and building a login form. The details of each property, method, and event are on the [`UITextField`](../api/ui-text-field.md) reference page. For multiline input, see [Building a multiline text view](multiline-text.md); for search fields, see [Building a search bar](search.md).

## Recommended approach

- **Use `borderStyle = 'roundedRect'` for the border.** This is the system's standard text field appearance, with built-in spacing on the left and right of the text. For a different look, put the text field in a container; see [Drawing your own border and background](#drawing-your-own-border-and-background).
- **Constrain the form's bottom edge to `keyboardLayoutGuide.topAnchor`.** One constraint works whether the keyboard is shown or hidden; see [Keyboard avoidance: one constraint](#keyboard-avoidance-one-constraint).
- **Provide both ways to dismiss the keyboard: pressing Return and tapping empty space.** Keyboards such as the number pad have no Return key, so Return alone can't dismiss them.
- **With multiple text fields, Return moves to the next one and Return on the last one submits.** Use `returnKeyType` to set the text on the Return key to `'next'` and `'done'` accordingly.
- **Set `textContentType` on the account and password fields.** The system uses it to offer AutoFill, so users don't have to type.
- **Set `keyboardType` according to the content, and turn off auto-capitalization and autocorrection for accounts and email addresses.**

For how these fit together, see [Building a form](#building-a-form).

## First text field

Starting from a blank app, place a text field near the top of the screen. Each time the user types a character, the text below it updates. Pressing Return dismisses the keyboard.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Create the text field and set its appearance
  const field = new UITextField();
  field.placeholder = 'Enter your name';  // hint shown when empty
  field.borderStyle = 'roundedRect';      // rounded border; without it there's no border
  field.returnKeyType = 'done';           // the Return key shows "Done"

  // 2. Create a line of text to show what was entered
  const greeting = new UILabel();
  greeting.text = 'Hello';

  // 3. Update that line each time the content changes
  field.addEventListener('input', () => {
    greeting.text = field.text === '' ? 'Hello' : `Hello, ${field.text}`;
  });

  // 4. On Return, dismiss the keyboard and read the final content
  field.addEventListener('return', () => {
    field.resignFirstResponder();
    console.log('Entered: ' + field.text);
  });

  // 5. Place them on the view controller: the text field at the top with 16 pt on each side; the text below it
  field.translatesAutoresizingMaskIntoConstraints = false;
  greeting.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(field);
  page.view.addSubview(greeting);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    field.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
    field.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    field.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
    greeting.topAnchor.constraintEqualToAnchor(field.bottomAnchor, { constant: 16 }),
    greeting.leadingAnchor.constraintEqualToAnchor(field.leadingAnchor),
  ]);
});
```

**Effect**

- A text field with a rounded border appears near the top of the screen, with gray "Enter your name" inside. The line below reads "Hello".
- Tapping the text field makes the keyboard slide up from the bottom of the screen, and a cursor appears in the field.
- With each character typed, the line below changes to "Hello, " plus the field's content. When the content is cleared, it goes back to "Hello".
- Pressing the Return key at the bottom right of the keyboard dismisses the keyboard, and the console prints `Entered: ` plus the field's content.

This code hasn't been run as a whole in the simulator. Every API it uses has been run in the acceptance tests. **The appearance in the four points above (the border, the placeholder color, the text on the Return key) and "`input` fires once per character typed" are not verified in the simulator.**

> **Note:** When the simulator is connected to the computer's hardware keyboard, the on-screen software keyboard doesn't appear. This is simulator behavior. To see the software keyboard, turn off the hardware keyboard connection in the simulator's menu.

The five steps are: create it and set its appearance, prepare a place to show the content, listen for content changes, handle Return, and place it on the view controller. Each of the uses below modifies these five steps and reuses the `field` and `page` variables. To try a section on its own, write these lines first:

```js
const page = new UIViewController();
const field = new UITextField();
page.view.addSubview(field);
```

## Why a new text field is invisible

A new text field has no border, no content, and no placeholder. Put it on a view controller and you can't tell where to tap.

| Cause | Fix |
| --- | --- |
| No border | Set [`borderStyle`](../api/ui-text-field/borderstyle.md); the default is `'none'` |
| Positioned with constraints but given no width | Constrain the left and right edges, or give it a fixed width. The height can be omitted; the text field computes its own height from the font |
| Positioned with `frame` but given no width or height | You must give both yourself; otherwise they're 0 |

## Dismissing the keyboard

The keyboard has no separate "show" or "hide" methods; it follows focus: the keyboard appears when the text field becomes first responder and is dismissed when it stops being first responder. The first responder is "the object currently receiving keyboard input"; see [Focus](../api/ui-text-field.md#focus).

| What you want | How it happens |
| --- | --- |
| Keyboard appears | The user taps the text field, or code calls `field.becomeFirstResponder()` |
| Keyboard is dismissed | Code calls `field.resignFirstResponder()`, or calls `page.view.endEditing(true)` |

Dismissing the keyboard has to be done by the app's code. When the user taps outside the text field, the keyboard doesn't dismiss itself. **Not verified in the simulator.** So every view controller with text fields must provide a way to dismiss the keyboard; the two common ones are [dismissing on Return](#submitting-and-dismissing-the-keyboard-on-return) and [dismissing on a tap in empty space](#dismissing-the-keyboard-on-a-tap-in-empty-space). When text fields are inside a scroll view, you can also let users [dismiss it by dragging the content](scrolling.md#dismissing-the-keyboard-when-the-list-is-dragged).

There are three ways to write it, with the same result:

| How | When to use |
| --- | --- |
| `field.resignFirstResponder()` | You know which text field |
| `page.view.endEditing(true)` | You don't know which one, or the view controller has several text fields |
| Call either of the above in the `return` callback | Dismiss when the user presses Return |

## Can the input be restricted?

Text fields have no built-in length limit, format validation, or read-only mode.

- `keyboardType` only decides which keyboard appears; it doesn't validate the content. Users can still paste other characters.
- To limit length or filter characters, listen for [`beforeinput`](../api/ui-text-field/beforeinput-event.md): the system fires it before each change, and calling `preventDefault()` in the listener stops that change from happening. See [Limiting input length or filtering characters](#limiting-input-length-or-filtering-characters).
- To keep the text field from starting to edit, or from losing focus, listen for [`beforefocus`](../api/ui-text-field/beforefocus-event.md) and [`beforeblur`](../api/ui-text-field/beforeblur-event.md).

## Reading what the user entered

```js
const name = field.text;
console.log(name.length);
```

**Effect**: `field.text` is the field's entire current content. When empty it's the empty string `''`, not `null`, so you can read `length` directly.

Writing `field.text = 'Alice'` in code replaces the field's content. Changing `text` in code doesn't fire `input`; that event fires only when the user's input changes the content. **Not verified in the simulator.** To make a change from code fire `input`, use [`insertText()`](#inserting-text-at-the-cursor-in-code).

Written values that aren't strings are converted to strings. Writing `null` or `undefined` gives the empty string.

## Showing placeholder text

```js
field.placeholder = 'Enter your account';
```

**Effect**: this hint is shown while the field is empty and disappears once the user types the first character. **The color of the hint is not verified in the simulator.**

Set it to `null` to remove the hint.

## Responding to input as it changes

```js
field.addEventListener('input', () => {
  console.log('Now: ' + field.text);
});
```

**Effect**: the callback runs each time the user types a character, deletes a character, or pastes some text. **Not verified in the simulator.**

The event object's `type` is the event name and `target` is the text field. The event object doesn't carry the content; read it from `field.text`.

The callback runs after the content changes, and `field.text` read in the callback is the content at the time it runs. When the user types quickly, the content read in one callback may already include later keystrokes. **Not verified in the simulator.**

With input methods such as Chinese Pinyin, whether the Pinyin letters not yet converted to characters count toward `text`, and whether `input` fires during that time, is **not verified in the simulator**.

## Submitting and dismissing the keyboard on Return

```js
field.addEventListener('return', () => {
  field.resignFirstResponder();
  console.log('Submit: ' + field.text);
});
```

**Effect**: when the user presses Return, the callback runs and the keyboard is dismissed. The acceptance tests use this pattern; **a real user pressing Return is not verified in the simulator.**

Pressing Return in a single-line text field doesn't insert a line break.

Whether the keyboard stays on screen after Return when `resignFirstResponder()` isn't called is **not verified in the simulator**. To dismiss the keyboard, call it explicitly in the callback.

With multiple text fields, focus the next text field in the callback so the keyboard isn't dismissed; see [Building a form](#building-a-form).

## Making a password field

```js
field.isSecureTextEntry = true;
```

**Effect**: each character typed is shown as a dot. `field.text` still reads the real content. **The dots are not verified in the simulator.**

## Letting a password field toggle plain text

`isSecureTextEntry` can be changed at any time. Add a button that inverts it when tapped.

```js
const toggle = UIButton.buttonWithType('system');
toggle.setTitle('Show', { forState: ['normal'] });
toggle.addEventListener('click', () => {
  field.isSecureTextEntry = !field.isSecureTextEntry;
  toggle.setTitle(field.isSecureTextEntry ? 'Show' : 'Hide', { forState: ['normal'] });
});
```

**Effect**: tapping the button once turns the dots in the field into the real text, and the button's text changes to "Hide". Tap again to go back to dots. The button still needs to be added to the view controller and positioned; for how, see [`UIButton`](../api/ui-button.md). **This example is not verified in the simulator.**

## Showing a number pad or email keyboard

```js
field.keyboardType = 'numberPad';
```

**Effect**: tapping the text field brings up a number pad with only 0 through 9. **Not verified in the simulator.**

Commonly used values:

| What you want to enter | Value |
| --- | --- |
| Integers (verification codes, quantities) | `'numberPad'` |
| Numbers with a decimal point (amounts) | `'decimalPad'` |
| Email addresses | `'emailAddress'` |
| Phone numbers | `'phonePad'` |
| URLs | `'url'` |

For all 13 values, see [`keyboardType`](../api/ui-text-field/keyboardtype.md).

> **Note:** `keyboardType` only decides which keyboard appears; it doesn't validate the content. Users can still paste other characters in, and with a hardware keyboard connected they can type any character. When you need validation, check `field.text` in `input`.
>
> The `'numberPad'`, `'decimalPad'`, and `'phonePad'` keyboards have no Return key, so users can't dismiss the keyboard by pressing Return. Provide another way to dismiss it; see [Dismissing the keyboard on a tap in empty space](#dismissing-the-keyboard-on-a-tap-in-empty-space) and [Putting a row of buttons above the keyboard](#putting-a-row-of-buttons-above-the-keyboard). **The absence of a Return key is not verified in the simulator.**

## Changing the text on the Return key

```js
field.returnKeyType = 'search';
```

**Effect**: the Return key at the bottom right of the keyboard shows "Search". **Not verified in the simulator.**

It changes only the text on the key, not the behavior. Whatever it shows, pressing it fires `return`. For all values, see [`returnKeyType`](../api/ui-text-field/returnkeytype.md).

To make the Return key unpressable when the field is empty:

```js
field.enablesReturnKeyAutomatically = true;
```

**Effect**: while the field is empty, the Return key is gray and can't be pressed. It becomes pressable automatically once something is typed. **Not verified in the simulator.**

## Letting the system AutoFill accounts and passwords

Tell the system what each field holds, and it can fill them in for the user.

```js
const account = new UITextField();
account.placeholder = 'Account';
account.textContentType = 'username';

const secret = new UITextField();
secret.placeholder = 'Password';
secret.textContentType = 'password';
secret.isSecureTextEntry = true;
```

**Effect**: when either field is tapped, a bar appears above the keyboard listing accounts saved in the system. When the user picks one, both fields are filled in. **Not verified in the simulator.**

On sign-up screens, use `'newPassword'` for the new-password field, and the system offers to generate a strong password. **Not verified in the simulator.**

## Letting the system AutoFill SMS verification codes

```js
const code = new UITextField();
code.keyboardType = 'numberPad';
code.textContentType = 'oneTimeCode';
```

**Effect**: after the phone receives a text message containing a verification code, the code appears above the keyboard, and one tap fills it into the field. **Not verified in the simulator.**

For all 48 values of `textContentType`, see [Values of `textContentType`](../api/ui-text-field/textcontenttype.md).

## Turning off autocorrection and auto-capitalization

When entering accounts, email addresses, codes, and the like, the system's automatic corrections get in the way.

```js
field.autocapitalizationType = 'none';   // no automatic capitalization
field.autocorrectionType = 'no';         // no autocorrection
field.spellCheckingType = 'no';          // no red underline under misspelled words
```

**Effect**: what the user types is what they get. By default, the system capitalizes the first letter of each sentence and replaces words it considers misspelled. **Not verified in the simulator.**

## Showing a clear button on the right

```js
field.clearButtonMode = 'whileEditing';
```

**Effect**: while the text field is being edited and has content, a round × button appears on the right. Tapping it clears all content. **Not verified in the simulator.**

`'always'` shows it all the time, `'unlessEditing'` shows it only when not editing, and `'never'` doesn't show it.

## Focusing and unfocusing in code

```js
const ok = field.becomeFirstResponder();   // focus; the keyboard appears
console.log(ok, field.isFirstResponder);

field.resignFirstResponder();              // unfocus; the keyboard is dismissed
```

**Effect**: on success, `becomeFirstResponder()` returns `true`, the text field starts editing, and `isFirstResponder` and `isEditing` both become `true`. After `resignFirstResponder()`, both go back to `false`.

`becomeFirstResponder()` can be refused by the system, in which case it returns `false` and nothing happens. So don't ignore the return value. For when it's refused, see [first responder](../api/ui-text-field.md#focus).

## Reading and writing the cursor position and selection

```js
field.text = 'hello world';
field.selectedRange = new NSRange(0, 5);   // select "hello"

const range = field.selectedRange;
console.log(range.location, range.length);
console.log(field.text.slice(range.location, range.location + range.length));

field.selectedRange = new NSRange(field.text.length, 0);   // move the cursor to the end
```

**Effect**: prints `0 5` and `hello`.

- `selectedRange` is an [`NSRange`](../api/ns-range.md): `location` is the start and `length` is how much is selected, in UTF-16 code units, the same as JS string indices. A `length` of 0 means no text is selected, just a cursor.
- The selection can be read and written even when the text field isn't editing, and what's written reads back (verified by testing). In that case no cursor or selection highlight is visible on screen.
- Whether a selection written while not editing is still there after the text field starts editing is **not verified in the simulator**. To show the user the cursor at a certain position, write it after the text field starts editing; see the next section.

## Inserting text at the cursor in code

`insertText()` changes the content the way user typing does: it inserts at the cursor position, and when text is selected, it replaces the selection. Use it for a row of "quick input" buttons, rather than assembling strings and computing the cursor yourself.

```js
const domain = UIButton.buttonWithType('system');
domain.setTitle('@example.com', { forState: ['normal'] });
domain.addEventListener('click', () => {
  field.insertText('@example.com');
});
```

**Effect**: tapping this button inserts `@example.com` at the cursor position in the text field, and the cursor moves after it; when text is selected, the selection is replaced. An `input` listener runs once. **Not verified in the simulator**; the acceptance tests have corresponding assertions, which haven't been run since they were written.

To delete, use `deleteBackward()`, which has the same effect as the user pressing Delete once.

How it differs from writing `text` directly:

| | `field.text = …` | `insertText()` / `deleteBackward()` |
| --- | --- | --- |
| What changes | The whole content is replaced | Only the cursor or selection |
| Fires `input` | No | Yes |
| Fires `beforeinput` | No | No |

The `insertText()` / `deleteBackward()` column of this table is **not verified in the simulator**.

## Selecting all existing content when editing starts

```js
field.addEventListener('focus', () => {
  field.selectedRange = new NSRange(0, field.text.length);
});
```

**Effect**: when the text field starts editing, all its content is selected, so typing replaces the original content directly. **Not verified in the simulator**; whether the system then moves the cursor to the tapped position when the user taps the field with a finger hasn't been measured.

## Getting notified when the cursor moves

```js
field.addEventListener('selectionchange', () => {
  const range = field.selectedRange;
  console.log('Cursor at ' + range.location + ', ' + range.length + ' code units selected');
});
```

**Effect**: when code writes `selectedRange`, the console prints a line (verified by testing). Moving the cursor, dragging the selection, and typing by the user likewise each print a line; that part is **not verified in the simulator**.

The event object doesn't carry the selection; read `field.selectedRange` in the callback. The callback runs later, so you read the selection at the moment the callback runs.

## Focusing automatically when the view controller first appears

Focusing has to wait until the view controller is on screen. `appear` fires when the view controller has appeared; focus in its callback:

```js
page.addEventListener('appear', () => {
  field.becomeFirstResponder();
}, { once: true });
```

**Effect**: after the view controller's transition animation ends, the text field automatically starts editing and the keyboard appears.

- The acceptance tests verified this for a modally presented view controller: calling `becomeFirstResponder()` in this callback returns `true`, and the text field becomes first responder. The window's root view controller is **not verified in the simulator**.
- `{ once: true }` makes it focus only the first time the view controller appears. Without it, the field is focused every time you return to this view controller.
- For `appear`, see [`UIViewController`](../api/ui-view-controller.md#appearing-and-disappearing).

Don't focus at other times; both points below are verified by testing:

- **Calling `becomeFirstResponder()` directly in the `sceneconnect` callback is too early.** It returns `true` and `isEditing` is `true` too, but the `focus` event doesn't fire.
- **It's refused while the view controller is transitioning.** During the animation of a modal view controller being presented or dismissed, `becomeFirstResponder()` returns `false`.

## Dismissing the keyboard on a tap in empty space

Keyboards without a Return key (such as the number pad) need another way to be dismissed. The common approach is to dismiss on a tap outside the text field.

The recommended way is to add a tap [gesture recognizer](../api/ui-gesture-recognizer.md) to the view controller's root view. The recognizer receives taps on the root view and all its subviews, so the callback first has to find which view was tapped, and not dismiss the keyboard when the tap lands on a text field or button.

```js
const dismiss = new UITapGestureRecognizer();
dismiss.cancelsTouchesInView = false;   // don't cancel touches the views themselves are handling
dismiss.addEventListener('ended', (e) => {
  const { location } = /** @type {UIGestureRecognizerEvent} */ (e);
  if (location === null) return;
  // Tapped on a control (text field, button) or one of its subviews: don't dismiss the keyboard
  for (let v = page.view.hitTest(location); v !== null; v = v.superview) {
    if (v instanceof UIControl) return;
  }
  page.view.endEditing(true);
});
page.view.addGestureRecognizer(dismiss);
```

**Effect**: tapping anywhere on the view controller other than a control dismisses the keyboard. Tapping text fields and buttons doesn't dismiss the keyboard, and they respond as usual. **This example is not verified in the simulator.**

`page.view.endEditing(true)` makes whichever text field on the view controller is editing lose focus. You don't need to know which one.

This approach doesn't require changing the view controller's view hierarchy, and when the view controller has text, images, and other views that aren't controls, tapping them also dismisses the keyboard.

Another approach doesn't use a gesture recognizer: place a full-size [`UIControl`](../api/ui-control.md) at the very bottom of the view controller to receive taps. It works only for taps on empty space with no other view; whether taps on text and images work depends on whether those views receive touches.

```js
const backdrop = new UIControl();
backdrop.translatesAutoresizingMaskIntoConstraints = false;
page.view.insertSubview(backdrop, { atIndex: 0 });   // behind all the content
NSLayoutConstraint.activateConstraints([
  backdrop.topAnchor.constraintEqualToAnchor(page.view.topAnchor),
  backdrop.bottomAnchor.constraintEqualToAnchor(page.view.bottomAnchor),
  backdrop.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
  backdrop.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor),
]);

backdrop.addEventListener('touchupinside', () => {
  page.view.endEditing(true);
});
```

**Effect**: tapping a place on the view controller with no other control dismisses the keyboard. Taps on text fields and buttons aren't affected, because they're in front of `backdrop`. **This example is not verified in the simulator.**

## Putting a row of buttons above the keyboard

`inputAccessoryView` is a view attached above the keyboard when it appears; it appears and disappears with the keyboard. Put a [toolbar](../api/ui-toolbar.md) there and you get a row of buttons above the keyboard. The number pad has no Return key, so a "Done" button usually goes here.

```js
const amount = new UITextField();
amount.keyboardType = 'decimalPad';

const bar = new UIToolbar();
const done = UIBarButtonItem.systemItem('done');
done.addEventListener('click', () => amount.resignFirstResponder());
bar.items = [UIBarButtonItem.flexibleSpace(), done];
bar.sizeToFit();
amount.inputAccessoryView = bar;
```

**Effect**: tapping the text field brings up the number pad with a toolbar above it, with "Done" at the right end. Tapping it dismisses the keyboard, and the toolbar disappears with it. **This example is not verified in the simulator**; the acceptance tests have assertions that "this view appears on screen after the text field is focused", which haven't been run since they were written.

`bar.sizeToFit()` makes the toolbar measure its own height. A new toolbar has a height of 0; without this line it takes up no space.

`inputAccessoryView` can be any [view](../api/ui-view.md), not just a toolbar. The system stretches its width to match the keyboard; its height is its own.

Several text fields can share the same view:

```js
const account = new UITextField();
const secret = new UITextField();
account.inputAccessoryView = bar;
secret.inputAccessoryView = bar;
done.addEventListener('click', () => page.view.endEditing(true));
```

**Effect**: both text fields have the same toolbar above their keyboard. Tapping "Done" ends editing in whichever one is editing. **Not verified in the simulator.**

It can also be changed while the text field is editing: after writing a new view, the area above the keyboard switches to the new one on the spot; writing `null` removes it on the spot. The text field doesn't lose focus as a result. **Not verified in the simulator.**

## Keeping the text field clear of the keyboard

Constrain the content's bottom edge to the top edge of `keyboardLayoutGuide`. The example below places a text field at the bottom of the screen.

```js
const input = new UITextField();
input.borderStyle = 'roundedRect';
input.placeholder = 'Say something';
input.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(input);

const area = page.view.safeAreaLayoutGuide;
const keyboard = page.view.keyboardLayoutGuide;
NSLayoutConstraint.activateConstraints([
  input.leadingAnchor.constraintEqualToAnchor(area.leadingAnchor, { constant: 16 }),
  input.trailingAnchor.constraintEqualToAnchor(area.trailingAnchor, { constant: -16 }),
  // This one keeps it clear of the keyboard
  input.bottomAnchor.constraintEqualToAnchor(keyboard.topAnchor, { constant: -16 }),
]);
```

**Effect**

- When the keyboard is hidden, the text field is at the bottom of the screen, with its bottom edge 16 pt above the bottom of the safe area.
- When the keyboard appears, the text field moves up to 16 pt above the keyboard. It returns to its original position when the keyboard is dismissed. The acceptance tests check the upward move only when the software keyboard actually appears; in the iOS 27.2 simulator the software keyboard didn't appear, so this is **not verified in the simulator on that system**.

For how it works, see [Keyboard avoidance: one constraint](#keyboard-avoidance-one-constraint).

## Disabling the text field

```js
field.isEnabled = false;
```

**Effect**: tapping the text field does nothing, and the keyboard doesn't appear. Set it back to `true` to restore. **Not verified in the simulator.**

`isEnabled` is inherited from [`UIControl`](../api/ui-control.md).

## Drawing your own border and background

`borderStyle` has only four fixed looks. For a different look, put the text field in a container and set the border, background color, and corner radius on the container.

```js
const box = new UIView();
box.backgroundColor = 'secondarySystemBackground';
box.layer.cornerRadius = 12;
box.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(box);

const inner = new UITextField();
inner.placeholder = 'Search';
inner.translatesAutoresizingMaskIntoConstraints = false;
box.addSubview(inner);

const boxArea = page.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  box.topAnchor.constraintEqualToAnchor(boxArea.topAnchor, { constant: 100 }),
  box.leadingAnchor.constraintEqualToAnchor(boxArea.leadingAnchor, { constant: 16 }),
  box.trailingAnchor.constraintEqualToAnchor(boxArea.trailingAnchor, { constant: -16 }),
  box.heightAnchor.constraintEqualToConstant(56),
  // The text field is inset 12 pt on each side within the container and vertically centered
  inner.leadingAnchor.constraintEqualToAnchor(box.leadingAnchor, { constant: 12 }),
  inner.trailingAnchor.constraintEqualToAnchor(box.trailingAnchor, { constant: -12 }),
  inner.centerYAnchor.constraintEqualToAnchor(box.centerYAnchor),
]);
```

**Effect**: a light gray rounded rectangle 56 pt tall, with a corner radius of 12 pt. The text starts 12 pt from the left edge.

The text field itself has no padding property. When `borderStyle` is `'none'`, the text sits right against the text field's left edge, so use a container to leave space.

## Changing the font, color, and alignment of the text

```js
field.font = UIFont.systemFontOfSize(20);
field.textColor = 'systemBlue';
field.textAlignment = 'center';
```

**Effect**: the text in the field is 20 pt, blue, and horizontally centered. **Not verified in the simulator.**

For fonts, see [`UIFont`](../api/ui-font.md); for how to write colors, see [Colors](../api/ui-color.md).

## Limiting input length or filtering characters

Text fields have no maximum-length property. Listen for `beforeinput` and decide, before the change happens, whether to let it happen.

```js
field.addEventListener('beforeinput', (event) => {
  const { range, replacementString } = event;
  // What the text field would contain if this change happened
  const next = field.text.slice(0, range.location) + replacementString +
    field.text.slice(range.location + range.length);
  if (next.length > 6) {
    event.preventDefault();
  }
});
```

**Effect**: once the text field has 6 characters, further keystrokes do nothing and the characters don't appear. Pasting text that would make the total longer than 6 inserts none of it. Deleting works as usual. **Not verified in the simulator**: this event is triggered only by real keyboard input, which the automated acceptance tests can't produce.

- `range` is the section to be replaced and `replacementString` is the text to replace it with; see [The data `beforeinput` carries](../api/ui-text-field/beforeinput-event.md).
- The system decides whether to make the change only after the listener has run. So a blocked character never shows up first.
- Writing `field.text` in code, and calling `insertText()` and `deleteBackward()`, don't fire `beforeinput`. The latter two are **not verified in the simulator**.

Allowing only digits works the same way, with a different check:

```js
field.addEventListener('beforeinput', (event) => {
  if (/[^0-9]/.test(event.replacementString)) {
    event.preventDefault();
  }
});
```

**Effect**: digit keys type as usual, and other keys do nothing. If pasted content contains even one non-digit character, none of it is inserted. **Not verified in the simulator**, for the same reason as above.

> **Note:** With input methods such as Pinyin, the Pinyin letters not yet converted to characters are also individual changes. How `beforeinput` fires in that case is **not verified in the simulator**, and blocking it may interrupt input.

## Keeping the text field from losing focus

To keep focus on the text field while the content is invalid, listen for `beforeblur`.

```js
field.addEventListener('beforeblur', (event) => {
  if (field.text === '') {
    event.preventDefault();
  }
});

field.becomeFirstResponder();
console.log(field.resignFirstResponder());
```

**Effect**: when the text field is empty, the console prints `false`, focus stays on the text field, and the keyboard isn't dismissed. After content is entered, calling it again prints `true`.

- After `preventDefault()`, `resignFirstResponder()` returns `false`.
- `view.endEditing(true)` is forced; how the system handles it in that case is **not verified in the simulator**.

## Building a form

Below is a login form: two text fields and a button. It includes all the points from [Recommended approach](#recommended-approach).

```js
// 1. Account field: the Return key shows "Next"
const account = new UITextField();
account.placeholder = 'Account';
account.borderStyle = 'roundedRect';
account.textContentType = 'username';
account.autocapitalizationType = 'none';
account.autocorrectionType = 'no';
account.returnKeyType = 'next';

// 2. Password field: the Return key shows "Done"
const secret = new UITextField();
secret.placeholder = 'Password';
secret.borderStyle = 'roundedRect';
secret.textContentType = 'password';
secret.isSecureTextEntry = true;
secret.returnKeyType = 'done';

const submit = UIButton.buttonWithType('system');
submit.setTitle('Log in', { forState: ['normal'] });

// 3. Submit: dismiss the keyboard first, then read the content
function login() {
  page.view.endEditing(true);
  console.log('Log in: ' + account.text + ', password length ' + secret.text.length);
}

// 4. Return: the account field moves to the password field; the password field submits
account.addEventListener('return', () => {
  secret.becomeFirstResponder();
});
secret.addEventListener('return', login);
submit.addEventListener('click', login);

// 5. Dismiss the keyboard on a tap in empty space
const dismissTap = new UITapGestureRecognizer();
dismissTap.cancelsTouchesInView = false;
dismissTap.addEventListener('ended', (e) => {
  const { location } = /** @type {UIGestureRecognizerEvent} */ (e);
  if (location === null) return;
  for (let v = page.view.hitTest(location); v !== null; v = v.superview) {
    if (v instanceof UIControl) return;
  }
  page.view.endEditing(true);
});
page.view.addGestureRecognizer(dismissTap);

// 6. Layout: the two text fields at the top; the button's bottom edge follows the keyboard
for (const v of [account, secret, submit]) {
  v.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(v);
}
const safeArea = page.view.safeAreaLayoutGuide;
const keyboardGuide = page.view.keyboardLayoutGuide;
NSLayoutConstraint.activateConstraints([
  account.topAnchor.constraintEqualToAnchor(safeArea.topAnchor, { constant: 24 }),
  account.leadingAnchor.constraintEqualToAnchor(safeArea.leadingAnchor, { constant: 16 }),
  account.trailingAnchor.constraintEqualToAnchor(safeArea.trailingAnchor, { constant: -16 }),
  secret.topAnchor.constraintEqualToAnchor(account.bottomAnchor, { constant: 12 }),
  secret.leadingAnchor.constraintEqualToAnchor(account.leadingAnchor),
  secret.trailingAnchor.constraintEqualToAnchor(account.trailingAnchor),
  submit.centerXAnchor.constraintEqualToAnchor(safeArea.centerXAnchor),
  submit.bottomAnchor.constraintEqualToAnchor(keyboardGuide.topAnchor, { constant: -16 }),
]);
```

**Effect**

- The account and password fields are at the top of the view controller, with 16 pt on each side. The "Log in" button is at the bottom of the screen, with its bottom edge 16 pt above the bottom of the safe area.
- Tapping the account field brings up the keyboard, and the "Log in" button moves up to 16 pt above the keyboard.
- Pressing Return in the account field moves the cursor to the password field without dismissing the keyboard.
- Pressing Return in the password field, or tapping "Log in", dismisses the keyboard, and the console prints `Log in: ` plus the account and the password length.
- Tapping anywhere other than the text fields and button dismisses the keyboard.

**This example hasn't been run as a whole in the simulator.** Reading and writing each property, `becomeFirstResponder()`, `endEditing()`, and the `keyboardLayoutGuide` constraint have been run in the acceptance tests. That the keyboard isn't dismissed when another text field is focused in the `return` callback is **not verified in the simulator**.

## Keyboard avoidance: one constraint

The keyboard slides up from the bottom of the screen and covers the view controller. The view controller's size and position don't change, so the covered content can't be seen.

Every view has a `keyboardLayoutGuide` property. It's a layout guide, an invisible rectangle used only for alignment. This rectangle represents the area the keyboard occupies:

- **When the keyboard is hidden**, its top edge is at the bottom of the safe area. The safe area is the part of the screen not obscured by the notch and the home indicator at the bottom; see [`UIView`](../api/ui-view.md).
- **When the keyboard is shown**, its top edge is at the top of the keyboard.

So constraining the content's bottom edge to its top edge is correct in both cases:

```js
const guide = page.view.keyboardLayoutGuide;
field.translatesAutoresizingMaskIntoConstraints = false;
field.bottomAnchor
  .constraintEqualToAnchor(guide.topAnchor, { constant: -16 })
  .isActive = true;
```

**Effect**: when the keyboard is hidden, the text field's bottom edge is 16 pt above the bottom of the safe area (checked in the acceptance tests). When the keyboard is shown, the text field's bottom edge is 16 pt above the keyboard. The acceptance tests check this only when the software keyboard actually appears; in the iOS 27.2 simulator the software keyboard didn't appear, so this is **not verified in the simulator on that system**.

There's no need to listen for the keyboard appearing and disappearing, or to compute the keyboard's height. The system updates the position along with the keyboard. **That the movement is synchronized with the keyboard animation is not verified in the simulator.**

When the view controller's content is long and placed in a [scroll view](../api/ui-scroll-view.md), constrain the scroll view's bottom edge to `keyboardLayoutGuide.topAnchor`. When the keyboard appears, the scroll view gets shorter, and its content can still be scrolled into view. **Not verified in the simulator.**

Measured: when the keyboard is hidden, `page.view.keyboardLayoutGuide.layoutFrame.height` is 34 pt, equal to the safe area height taken up by the home indicator at the bottom of the screen. You can use this height to tell whether the software keyboard actually appeared.

For how to write constraints, see [Auto Layout](../api/auto-layout.md).

## Calculating positions yourself: listening for keyboard events

If you set views' `frame` yourself instead of using constraints, listen for the [`keyboardchange`](../api/ui-screen/keyboardchange-event.md) event on the screen. The event carries `frame`, where the keyboard will be when its animation ends; the keyboard's height is `frame.height`.

```js
const screen = e.scene.screen;   // inside the sceneconnect callback
screen.addEventListener('keyboardchange', (event) => {
  const keyboard = /** @type {UIScreenKeyboardEvent} */ (event);
  const top = Math.min(keyboard.frame.y, screen.bounds.height);
  field.frame = new CGRect(16, top - 16 - 40, 358, 40);
});
```

**Effect**: when the keyboard appears, the text field moves up with it and stops 16 pt above the keyboard; when the keyboard is dismissed, the field moves back to the bottom along with it. Both start and stop at the same time (tested: the position set in the listener automatically picked up the same animation as the keyboard).

**Make your changes in the listener, right away.** The listener runs inside the keyboard's animation; only a `frame` set or a constraint changed at that moment moves along with the keyboard. Put it in `setTimeout` or any other callback that runs later, and the view jumps straight to its final position.

If you only need the moment the keyboard appears or is dismissed, listen for [`keyboardshow`](../api/ui-screen/keyboardshow-event.md) or [`keyboardhide`](../api/ui-screen/keyboardhide-event.md) respectively.


## See also

- [`UITextField`](../api/ui-text-field.md): all properties, methods, and events
- [`UIKeyboardLayoutGuide`](../api/ui-keyboard-layout-guide.md): the area the keyboard occupies
- [`NSRange`](../api/ns-range.md): the type of the selection
- [Gesture recognizers](../api/ui-gesture-recognizer.md): the tap recognizer used to dismiss the keyboard on a tap in empty space
- [`UIToolbar`](../api/ui-toolbar.md): a row of buttons above the keyboard
- [Building a scrolling view](scrolling.md): putting a long form in a scroll view
- [Building a multiline text view](multiline-text.md)
