---
type: reference
native: UITextField
status: partial
---

# `UITextField`

**`UITextField`** represents a single-line text field. When the user taps it, the system keyboard slides up from the bottom of the screen and the typed text appears in the field. The app reads the field's content from [`text`](ui-text-field/text.md), reads the cursor position and the selected range from [`selectedRange`](ui-text-field/selectedrange.md), and learns through events when the content changes, the cursor moves, editing begins and ends, and the user presses Return.

A text field has only one line; pressing Return does not insert a line break. For multiline input, use [`UITextView`](ui-text-view.md).

A new text field has no border, no content, and no placeholder, so on screen there is no visible hint of where to tap. Set a border with [`borderStyle`](ui-text-field/borderstyle.md). A text field has no built-in length limit, format validation, or read-only mode: [`keyboardType`](ui-text-field/keyboardtype.md) only decides which keyboard appears and does not validate the content; to stop a change before it happens, listen for [`beforeinput`](ui-text-field/beforeinput-event.md).

When the keyboard appears, it covers the view controller's content; the size and position of the view controller's view do not change. To keep content clear of the keyboard, use the view's `keyboardLayoutGuide`, which is a [`UIKeyboardLayoutGuide`](ui-keyboard-layout-guide.md).

A text field is a [control](ui-control.md): disabling it and the `focus`, `input`, `return`, and `blur` events come from `UIControl`. A control is in turn a [view](ui-view.md): position, size, and background color come from `UIView`.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UITextField`

For how to build a usable text field, dismiss the keyboard, avoid being covered by the keyboard, and build forms, see the guide [Building a text field](../guides/text-fields.md).

## Constructor

[`UITextField()`](ui-text-field/constructor.md)

Creates a text field. It has no border, no content, and a size of 0.

## Instance properties

Also inherits properties from [`UIControl`](ui-control.md) and [`UIView`](ui-view.md). Commonly used inherited properties on a text field are `isEnabled`, `isFirstResponder`, `tintColor`, and `keyboardLayoutGuide`.

Content:

| Property | Description |
| --- | --- |
| [`text`](ui-text-field/text.md) | The content of the field |
| [`placeholder`](ui-text-field/placeholder.md) | The hint shown when the field is empty |
| [`attributedText`](ui-text-field/attributedtext.md) | Styled content |
| [`attributedPlaceholder`](ui-text-field/attributedplaceholder.md) | Styled placeholder |
| [`isEditing`](ui-text-field/isediting.md) <small>read-only</small> | Whether the user is editing |
| [`hasText`](ui-text-field/hastext.md) <small>read-only</small> | Whether there is content |
| [`clearsOnBeginEditing`](ui-text-field/clearsonbeginediting.md) | Whether existing content is cleared each time editing begins |
| [`clearsOnInsertion`](ui-text-field/clearsoninsertion.md) | Whether inserting text replaces all the content |
| [`allowsEditingTextAttributes`](ui-text-field/allowseditingtextattributes.md) | Whether the user can change the style of the text |

Selection:

| Property | Description |
| --- | --- |
| [`selectedRange`](ui-text-field/selectedrange.md) | The selected range, or the cursor position |

Keyboard:

| Property | Description |
| --- | --- |
| [`keyboardType`](ui-text-field/keyboardtype.md) | Which keyboard appears |
| [`returnKeyType`](ui-text-field/returnkeytype.md) | The label on the Return key |
| [`keyboardAppearance`](ui-text-field/keyboardappearance.md) | Whether the keyboard is light or dark |
| [`enablesReturnKeyAutomatically`](ui-text-field/enablesreturnkeyautomatically.md) | Whether the Return key is grayed out when the field is empty |
| [`inputAccessoryView`](ui-text-field/inputaccessoryview.md) | A view attached above the keyboard while it is shown |
| [`inputView`](ui-text-field/inputview.md) | A view shown in place of the system keyboard |
| [`allowsNumberPadPopover`](ui-text-field/allowsnumberpadpopover.md) | Whether the number pad popover is allowed |

Input behavior:

| Property | Description |
| --- | --- |
| [`isSecureTextEntry`](ui-text-field/issecuretextentry.md) | Shows the content as dots, for passwords |
| [`autocapitalizationType`](ui-text-field/autocapitalizationtype.md) | The automatic capitalization rule |
| [`autocorrectionType`](ui-text-field/autocorrectiontype.md) | Whether autocorrection is on |
| [`spellCheckingType`](ui-text-field/spellcheckingtype.md) | Whether spelling is checked |
| [`textContentType`](ui-text-field/textcontenttype.md) | What kind of content the field holds, which the system uses for AutoFill |
| [`smartQuotesType`](ui-text-field/smartquotestype.md) | Whether straight quotes are replaced with curly quotes |
| [`smartDashesType`](ui-text-field/smartdashestype.md) | Whether consecutive hyphens are replaced with a dash |
| [`smartInsertDeleteType`](ui-text-field/smartinsertdeletetype.md) | Whether spaces are adjusted automatically on paste and delete |
| [`inlinePredictionType`](ui-text-field/inlinepredictiontype.md) | Whether predicted text appears after the cursor |
| [`mathExpressionCompletionType`](ui-text-field/mathexpressioncompletiontype.md) | Whether the result of a math expression is computed automatically |
| [`writingToolsBehavior`](ui-text-field/writingtoolsbehavior.md) | How far Writing Tools can go |
| [`allowedWritingToolsResultOptions`](ui-text-field/allowedwritingtoolsresultoptions.md) | Which kinds of content Writing Tools can write back |

Appearance:

| Property | Description |
| --- | --- |
| [`borderStyle`](ui-text-field/borderstyle.md) | The look of the border |
| [`clearButtonMode`](ui-text-field/clearbuttonmode.md) | When the clear button on the right is shown |
| [`textAlignment`](ui-text-field/textalignment.md) | Horizontal alignment of the text |
| [`font`](ui-text-field/font.md) | Font and size of the text |
| [`textColor`](ui-text-field/textcolor.md) | Color of the text |
| [`adjustsFontSizeToFitWidth`](ui-text-field/adjustsfontsizetofitwidth.md) | Whether the font size shrinks when the content is wider than the field |
| [`minimumFontSize`](ui-text-field/minimumfontsize.md) | The smallest size the font can shrink to |
| [`background`](ui-text-field/background.md) | Background image |
| [`disabledBackground`](ui-text-field/disabledbackground.md) | Background image when disabled |
| [`leftView`](ui-text-field/leftview.md) | A view at the left end of the field |
| [`leftViewMode`](ui-text-field/leftviewmode.md) | When the left view is shown |
| [`rightView`](ui-text-field/rightview.md) | A view at the right end of the field |
| [`rightViewMode`](ui-text-field/rightviewmode.md) | When the right view is shown |

## Instance methods

Also inherits methods from [`UIControl`](ui-control.md) and [`UIView`](ui-view.md). Commonly used inherited methods on a text field are `becomeFirstResponder()`, `resignFirstResponder()`, and `addEventListener()`; see [Focus](#focus).

Changing the content:

| Method | Description |
| --- | --- |
| [`insertText()`](ui-text-field/inserttext.md) | Inserts text at the cursor the way the user types |
| [`deleteBackward()`](ui-text-field/deletebackward.md) | Deletes the way the user presses the Delete key |

Computing the position of each part. These methods return the rectangle the text field uses to lay out a given part within the given bounds:

| Method | Description |
| --- | --- |
| [`borderRectForBounds()`](ui-text-field/borderrectforbounds.md) | Rectangle of the border |
| [`textRectForBounds()`](ui-text-field/textrectforbounds.md) | Rectangle where the text is displayed |
| [`placeholderRectForBounds()`](ui-text-field/placeholderrectforbounds.md) | Rectangle where the placeholder is displayed |
| [`editingRectForBounds()`](ui-text-field/editingrectforbounds.md) | Rectangle of the text while editing |
| [`clearButtonRectForBounds()`](ui-text-field/clearbuttonrectforbounds.md) | Rectangle of the clear button |
| [`leftViewRectForBounds()`](ui-text-field/leftviewrectforbounds.md) | Rectangle of the left view |
| [`rightViewRectForBounds()`](ui-text-field/rightviewrectforbounds.md) | Rectangle of the right view |

## Events

Listen with `addEventListener()`. A text field's events fall into three groups: control events tell the app what happened, `selectionchange` tells the app the cursor or selection moved, and cancelable events ask the app whether something should happen before it does.

Control events are inherited from [`UIControl`](ui-control.md#events). A text field uses these four:

| Event | When it fires |
| --- | --- |
| [`focus`](ui-control/focus-event.md) | The text field becomes first responder and editing begins |
| [`input`](ui-control/input-event.md) | The user's input changed the content once |
| [`return`](ui-control/return-event.md) | The user pressed the Return key |
| [`blur`](ui-control/blur-event.md) | The text field is no longer first responder and editing ends |

The text field's own events:

| Event | When it fires |
| --- | --- |
| [`selectionchange`](ui-text-field/selectionchange-event.md) | The selection or the cursor position changed |
| [`beforefocus`](ui-text-field/beforefocus-event.md) | Editing is about to begin. Cancelable |
| [`beforeblur`](ui-text-field/beforeblur-event.md) | Editing is about to end. Cancelable |
| [`beforeinput`](ui-text-field/beforeinput-event.md) | The user's input is about to change the content. Cancelable |
| [`beforeclear`](ui-text-field/beforeclear-event.md) | The user tapped the clear button and the field is about to be cleared. Cancelable |
| [`beforereturn`](ui-text-field/beforereturn-event.md) | The user pressed the Return key and it is about to be handled the default way. Cancelable |

The system fires the 16 control events listed under [`UIControl`](ui-control.md#events), `traitchange`, `selectionchange`, and the five cancelable events. Listening for any other name does not throw: it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`; see [the limits on event names](ui-control.md#events).

## Focus

The **first responder** is iOS's name for "the object currently receiving keyboard input", that is, the object that has focus. There is at most one at a time. The keyboard follows the first responder: it appears when a text field becomes first responder and goes away when the text field stops being first responder. There are no separate "show keyboard" or "hide keyboard" methods.

| What you want to do | How to write it |
| --- | --- |
| Focus the text field | `field.becomeFirstResponder()` |
| Remove focus from the text field | `field.resignFirstResponder()`, or `page.view.endEditing(true)` |
| Check whether the text field has focus | `field.isFirstResponder` |
| Learn that the text field gained or lost focus | The `focus` and `blur` events |

These members are defined on `UIResponder` and `UIView`, so every view has them:

- **`becomeFirstResponder()`** returns a boolean. `true` means it is now first responder; `false` means the system refused, nothing happened, and the keyboard does not appear.
- **`resignFirstResponder()`** returns a boolean. `true` means it is no longer first responder. The return value when the object was not first responder in the first place is **not verified in the simulator**.
- **`isFirstResponder`** is read-only. A new text field has `false`.
- **`canBecomeFirstResponder`** is read-only. It is `true` for a text field and `false` for a plain `UIView`. **Neither value has been verified in the simulator.**
- **`endEditing(true)`** removes focus from whichever text field in a view hierarchy is being edited, without needing to know which one it is.

The result of `becomeFirstResponder()` in different situations:

| Situation | Result | Basis |
| --- | --- | --- |
| The view controller is already shown and no transition is in progress | Returns `true`, then `focus` fires | Measured |
| The text field is already first responder | Returns `true` | The acceptance tests rely on this by calling it repeatedly; there is no separate assertion |
| A transition is in progress (during the animation of a modal view controller being presented or dismissed) | Returns `false` | Measured |
| In the `sceneconnect` callback, before the view controller is shown | Returns `true` and `isEditing` is `true`, but `focus` does not fire | Measured |
| The text field has not been added to the view controller yet | Returns `false` | **Not verified in the simulator** |

Two more things:

- **When the user taps a text field, focus happens the moment the finger touches down**, without waiting for the finger to lift (measured).
- **Tapping elsewhere does not remove focus automatically.** The text field stays first responder and the keyboard stays on screen until code removes focus or the user taps another text field. **Not verified in the simulator.**

## Which events one round of input fires

| User action | Fires |
| --- | --- |
| Tap the text field | `focus`. Measured to fire the moment the finger touches down |
| Type three characters | `input` three times. **Not verified in the simulator** |
| Press Return | `return`. **Not verified in the simulator** |
| The keyboard goes away | `blur` |

A cancelable event comes before its corresponding control event: focusing once was measured to fire `beforefocus` → `focus`.

Whether `return` or `blur` comes first is **not verified in the simulator**. Calling `becomeFirstResponder()` and `endEditing()` from code fires `focus` and `blur` in the same way; this is verified in the acceptance tests.

Rules for control events:

- The event object's `type` is the event name and its `target` is this text field. The event object does not carry the typed content, which key was pressed, or the touch location. Read the content from `field.text`.
- They cannot be canceled; `preventDefault()` has no effect. To stop something from happening, use a cancelable event.
- Callbacks do not run synchronously at the moment the event occurs; they run a little later, see [When callbacks run](ui-control.md#when-callbacks-run). The `field.text` read in a callback is the content at the time the callback runs; when the user types fast, the content read in one callback may already include the next few keystrokes. **Not verified in the simulator.**
- Changing `text` from code does not fire `input`; the event fires only when the user's input changes the content. **Not verified in the simulator.**
- For "the user finished typing", use `blur`. There is no separate "content committed" event.
- With input methods such as Chinese Pinyin, whether the Pinyin letters the user has not yet converted count toward `text`, and whether `input` fires during that time, is **not verified in the simulator**.
- An exception thrown in a callback does not affect the text field, and the other callbacks for the same event still run. The exception fires `error` on [`application`](application.md#unhandled-exceptions-dont-terminate-the-app); if no listener cancels it, the console prints a log line starting with `Uncaught`.

## Selection and cursor

The selection is the selected stretch of text in the text field. When no text is selected, the selection is a position of length 0, which is the cursor. [`selectedRange`](ui-text-field/selectedrange.md) represents it as an [`NSRange`](ns-range.md): `location` is the start and `length` is the length, both in UTF-16 code units, the same as JS string indices, so `field.text.slice(location, location + length)` is the selected text.

A text field always has a selection; it can be read and written even when the user is not editing (measured). When the user is not editing, no cursor or selection highlight is shown on screen.

Emoji and some Chinese characters take two code units. Placing the cursor between those two code units does not throw and is not corrected: when the content is `'a😀b'`, writing `(2, 0)` reads back as `(2, 0)` (measured). On a text view, inserting text at such a position was measured to split the character in two. Avoid such positions when computing positions yourself.

## Size

A text field is a view and is positioned like any other view; see [Auto Layout](auto-layout.md). All sizes are in [points (pt)](units.md).

- **With constraints, you can leave out the height but must supply the width.** The text field computes its own height from the font. Without a width, it sizes its width to the content, which is very narrow when empty and grows as the user types. So constrain both the left and right edges, or give it a fixed width. **Not verified in the simulator.**
- **With `frame`, you must supply both width and height.** Otherwise both are 0 and nothing appears on screen.

## Examples

### Entering a name

Starting from a blank app, place a text field near the top of the screen. Each time the user types a character, the text below updates. Pressing Return dismisses the keyboard.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const field = new UITextField();
  field.placeholder = 'Enter your name';
  field.borderStyle = 'roundedRect';
  field.returnKeyType = 'done';

  const greeting = new UILabel();
  greeting.text = 'Hello';

  field.addEventListener('input', () => {
    greeting.text = field.text === '' ? 'Hello' : `Hello, ${field.text}`;
  });
  field.addEventListener('return', () => {
    field.resignFirstResponder();
    console.log('You entered: ' + field.text);
  });

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

- A text field with a rounded border appears near the top of the screen, showing "Enter your name" in gray. The line below reads "Hello".
- Tap the text field: the keyboard slides up from the bottom of the screen and a cursor appears in the field.
- With each character typed, the line below changes to "Hello, " followed by the field's content. When the content is deleted entirely, it goes back to "Hello".
- Press the Return key at the bottom right of the keyboard: the keyboard goes away and the console prints `You entered: ` followed by the field's content.

This code has not been run as a whole in the simulator. Every API it uses has been run in the acceptance tests. **The appearance (the border, the placeholder color, the label on the Return key) and "`input` fires once per typed character" are not verified in the simulator.**

> **Note:** When the simulator is connected to the computer's hardware keyboard, the on-screen software keyboard does not appear. This is simulator behavior. To see the software keyboard, turn off the hardware keyboard connection in the simulator's menu.

### Password field

```js
const secret = new UITextField();
secret.placeholder = 'Password';
secret.borderStyle = 'roundedRect';
secret.textContentType = 'password';
secret.isSecureTextEntry = true;
secret.returnKeyType = 'done';
```

**Effect**: Each typed character is shown as a dot. When the user taps the field, the system may list saved accounts above the keyboard. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UITextField alloc] init]` | `new UITextField()` |
| `field.text` | `field.text` |
| `field.placeholder = @"Account"` | `field.placeholder = 'Account'` |
| `field.secureTextEntry = YES` | `field.isSecureTextEntry = true` |
| `field.keyboardType = UIKeyboardTypeNumberPad` | `field.keyboardType = 'numberPad'` |
| `field.returnKeyType = UIReturnKeyDone` | `field.returnKeyType = 'done'` |
| `field.textContentType = UITextContentTypeOneTimeCode` | `field.textContentType = 'oneTimeCode'` |
| `field.autocapitalizationType = UITextAutocapitalizationTypeNone` | `field.autocapitalizationType = 'none'` |
| `field.autocorrectionType = UITextAutocorrectionTypeNo` | `field.autocorrectionType = 'no'` |
| `field.borderStyle = UITextBorderStyleRoundedRect` | `field.borderStyle = 'roundedRect'` |
| `field.clearButtonMode = UITextFieldViewModeWhileEditing` | `field.clearButtonMode = 'whileEditing'` |
| `field.textColor = UIColor.labelColor` | `field.textColor = 'label'` |
| `field.editing` | `field.isEditing` |
| `field.hasText` | `field.hasText` |
| `[field insertText:@"Hello"]` | `field.insertText('Hello')` |
| `[field deleteBackward]` | `field.deleteBackward()` |
| `field.inputAccessoryView = toolbar` | `field.inputAccessoryView = toolbar` |
| Calling `[field reloadInputViews]` after changing `inputAccessoryView` | Not needed. Writing `inputAccessoryView` takes effect immediately |
| `field.selectedTextRange`, then converting to offsets with `offsetFromPosition:toPosition:` | `field.selectedRange` |
| `field.selectedTextRange = [field textRangeFromPosition:start toPosition:end]` | `field.selectedRange = new NSRange(location, length)` |
| `[field addTarget:self action:@selector(changed) forControlEvents:UIControlEventEditingChanged]` | `field.addEventListener('input', changed)` |
| `[field becomeFirstResponder]` | `field.becomeFirstResponder()` |
| `[field resignFirstResponder]` | `field.resignFirstResponder()` |
| `field.isFirstResponder` | `field.isFirstResponder` |
| `[view endEditing:YES]` | `view.endEditing(true)` |
| `view.keyboardLayoutGuide.topAnchor` | `view.keyboardLayoutGuide.topAnchor` |

Enum values drop the type prefix and start with a lowercase letter. `UIKeyboardTypeEmailAddress` is written `'emailAddress'`. See [Enums](enums.md).

How `UITextFieldDelegate` methods map to JS:

| ObjC delegate method | JS |
| --- | --- |
| `textFieldDidBeginEditing:` | The `focus` event |
| `textFieldDidChangeSelection:` | The `selectionchange` event |
| `textFieldDidEndEditing:` | The `blur` event |
| Dismissing the keyboard in `textFieldShouldReturn:` | Calling `resignFirstResponder()` in the `return` event |
| Returning `NO` from `textFieldShouldBeginEditing:` | Calling `event.preventDefault()` in the `beforefocus` event |
| Returning `NO` from `textFieldShouldEndEditing:` | Calling `event.preventDefault()` in the `beforeblur` event |
| Returning `NO` from `textField:shouldChangeCharactersInRange:replacementString:` | Calling `event.preventDefault()` in the `beforeinput` event. The two arguments are in `event.range` and `event.replacementString` |
| Returning `NO` from `textFieldShouldClear:` | Calling `event.preventDefault()` in the `beforeclear` event |
| Returning `NO` from `textFieldShouldReturn:` | Calling `event.preventDefault()` in the `beforereturn` event |

ObjC represents the two ends of a selection with `UITextRange` and `UITextPosition`; in JS the selection is an `NSRange` counted from the start of the content, read and written through `selectedRange`.

### Mapping to the browser's `<input>`

This table is only for looking up correspondences, for people familiar with HTML forms.

| Browser | Nacre | Difference |
| --- | --- | --- |
| `input.value` | `field.text` | An empty string when there is no content, not `null` |
| `placeholder` | `placeholder` | Reads `null` when not set |
| `type="password"` | `isSecureTextEntry = true` | A boolean property, not a type |
| `inputmode` | `keyboardType` | Only decides which keyboard appears; does not validate content |
| `autocomplete` | `textContentType` | The values are a set of names defined by iOS |
| `enterkeyhint` | `returnKeyType` | Only changes the label on the Return key, not its behavior |
| `input` event | `input` event | The event object does not carry the content; read `field.text` |
| `focus` / `blur` events | `focus` / `blur` events | — |
| Checking for Enter in `keydown` | `return` event | — |
| `el.focus()` / `el.blur()` | `becomeFirstResponder()` / `resignFirstResponder()` | Return a value indicating whether they succeeded |
| `document.activeElement === el` | `field.isFirstResponder` | — |
| `selectionStart`, `selectionEnd`, `setSelectionRange()` | `selectedRange` | A start plus a length, not a start plus an end |
| `selectionchange` event | `selectionchange` event | The event object does not carry the selection; read `field.selectedRange` |
| `disabled` | `isEnabled = false` | — |
| `maxlength`, `pattern`, `required`, `readonly` | None | Check them yourself in the `beforeinput` or `input` callback |
| Form submission | None | Pressing Return fires `return`; the callback decides what to do |

## See also

- [Building a text field](../guides/text-fields.md): reading the content, dismissing the keyboard, avoiding the keyboard, limiting input, form screens
- [`UIControl`](ui-control.md): the text field's parent class, with `isEnabled` and all 16 events
- [`UIView`](ui-view.md): `endEditing()`, `keyboardLayoutGuide`, and the safe area
- [`UIKeyboardLayoutGuide`](ui-keyboard-layout-guide.md): keeping content clear of the keyboard
- [`NSRange`](ns-range.md): the type of `selectedRange`
- [`UITextView`](ui-text-view.md): multiline input
- [`UISearchBar`](ui-search-bar.md): a search bar, which contains a text field
- [Attributed strings](ns-attributed-string.md): the type of `attributedText` and `attributedPlaceholder`
