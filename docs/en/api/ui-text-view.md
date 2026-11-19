---
type: reference
native: UITextView
status: partial
---

# `UITextView`

**`UITextView`** represents an area where the user can type multiple lines of text. When the user taps it, the system keyboard appears; pressing Return inserts a line break instead of ending input. The app reads the full content from [`text`](ui-text-view/text.md), reads the cursor position and the selected range from [`selectedRange`](ui-text-view/selectedrange.md), and learns through events when the content changes, the cursor moves, and input begins and ends.

A text view is a [scroll view](ui-scroll-view.md): when the content is taller than the view itself, it scrolls vertically, and it has all the properties and events of a scroll view. Once `isScrollEnabled` is set to `false`, it no longer scrolls; instead it asks to be as tall as its lines of text. It is not a [control](ui-control.md): it has no `isEnabled` and none of the 16 control events. For single-line input, use [`UITextField`](ui-text-field.md).

Compared with a text field:

| | `UITextField` | `UITextView` |
| --- | --- | --- |
| Lines | One | Multiple; Return inserts a line break |
| Superclass | Control | Scroll view |
| Content changed | `input` event | `input` event |
| Input begins, ends | `focus`, `blur` | `focus`, `blur` |
| Pressing Return | Fires `return` | Inserts a line break; no event |
| Placeholder text | `placeholder` property | None; overlay a label yourself |
| Border | `borderStyle` has four styles | No usable border style; use a background color and corner radius |
| Intercepting before a change | Cancelable events such as `beforeinput` | None |
| Cursor and selected range | `selectedRange` | `selectedRange` |
| Cursor or selection moved | `selectionchange` event | `selectionchange` event |

The nine keyboard settings (`keyboardType`, `textContentType`, and so on) are the same on both.

Behavior marked "measured" in this set of pages was measured with a small program without UI in the simulator (iPhone Air, iOS 27.2). What appears on screen and the behavior of a real keyboard are marked "**not verified in the simulator**".

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIScrollView`](ui-scroll-view.md) → `UITextView`

Two classes used with it: [`NSRange`](ns-range.md) represents a range of text, and [`NSTextContainer`](ns-text-container.md) represents the area where text is laid out.

For placeholder text, a text view that grows with its content, and dismissing the keyboard, see the guide [Building a multiline text view](../guides/multiline-text.md).

## Constructor

[`UITextView()`](ui-text-view/constructor.md)

Creates a text view. It has no content, no font set, and a size of 0.

## Instance properties

Also inherits properties from [`UIScrollView`](ui-scroll-view.md) and [`UIView`](ui-view.md). Inherited properties commonly used with text views are [`isScrollEnabled`](ui-scroll-view/isscrollenabled.md), [`keyboardDismissMode`](ui-scroll-view/keyboarddismissmode.md), [`contentOffset`](ui-scroll-view/contentoffset.md), `backgroundColor`, and `isFirstResponder`.

Content:

| Property | Description |
| --- | --- |
| [`text`](ui-text-view/text.md) | The full content |
| [`attributedText`](ui-text-view/attributedtext.md) | The content with styles |
| [`hasText`](ui-text-view/hastext.md) <small>read-only</small> | Whether there is any content |
| [`clearsOnInsertion`](ui-text-view/clearsoninsertion.md) | Whether inserting text replaces the whole content |
| [`allowsEditingTextAttributes`](ui-text-view/allowseditingtextattributes.md) | Whether the user can change text styles |
| [`dataDetectorTypes`](ui-text-view/datadetectortypes.md) | Which kinds of content become tappable links |

Appearance:

| Property | Description |
| --- | --- |
| [`font`](ui-text-view/font.md) | The font of the text |
| [`textColor`](ui-text-view/textcolor.md) | The color of the text |
| [`textAlignment`](ui-text-view/textalignment.md) | Which side the text aligns to |
| [`textContainerInset`](ui-text-view/textcontainerinset.md) | How far the text is from the four edges |
| [`textContainer`](ui-text-view/textcontainer.md) <small>read-only</small> | The area where text is laid out |
| [`usesStandardTextScaling`](ui-text-view/usesstandardtextscaling.md) | Whether text is scaled by the standard ratio |

Behavior:

| Property | Description |
| --- | --- |
| [`isEditable`](ui-text-view/iseditable.md) | Whether the user can change the content |
| [`isSelectable`](ui-text-view/isselectable.md) | Whether the user can select text |
| [`selectedRange`](ui-text-view/selectedrange.md) | The selected range, or the cursor position |
| [`isFindInteractionEnabled`](ui-text-view/isfindinteractionenabled.md) | Whether system find and replace is turned on |
| [`isWritingToolsActive`](ui-text-view/iswritingtoolsactive.md) <small>read-only</small> | Whether Writing Tools is currently working |
| [`writingToolsBehavior`](ui-text-view/writingtoolsbehavior.md) | How much Writing Tools can do |
| [`allowedWritingToolsResultOptions`](ui-text-view/allowedwritingtoolsresultoptions.md) | Which kinds of content Writing Tools can write back |

Keyboard:

| Property | Description |
| --- | --- |
| [`keyboardType`](ui-text-view/keyboardtype.md) | Which keyboard appears |
| [`returnKeyType`](ui-text-view/returnkeytype.md) | What the Return key says |
| [`keyboardAppearance`](ui-text-view/keyboardappearance.md) | Light or dark keyboard |
| [`enablesReturnKeyAutomatically`](ui-text-view/enablesreturnkeyautomatically.md) | Whether the Return key is dimmed when there is no content |
| [`isSecureTextEntry`](ui-text-view/issecuretextentry.md) | Password-style input |
| [`autocapitalizationType`](ui-text-view/autocapitalizationtype.md) | Rules for automatic capitalization |
| [`autocorrectionType`](ui-text-view/autocorrectiontype.md) | Whether autocorrection is on |
| [`spellCheckingType`](ui-text-view/spellcheckingtype.md) | Whether spelling is checked |
| [`textContentType`](ui-text-view/textcontenttype.md) | What kind of content goes here, used for AutoFill |
| [`smartQuotesType`](ui-text-view/smartquotestype.md) | Whether straight quotes become curly quotes |
| [`smartDashesType`](ui-text-view/smartdashestype.md) | Whether consecutive hyphens become a dash |
| [`smartInsertDeleteType`](ui-text-view/smartinsertdeletetype.md) | Whether spaces are adjusted automatically on paste and delete |
| [`inlinePredictionType`](ui-text-view/inlinepredictiontype.md) | Whether predicted text is shown after the cursor |
| [`mathExpressionCompletionType`](ui-text-view/mathexpressioncompletiontype.md) | Whether math expressions are evaluated automatically |
| [`allowsNumberPadPopover`](ui-text-view/allowsnumberpadpopover.md) | Whether the number pad may appear as a popover |
| [`inputAccessoryView`](ui-text-view/inputaccessoryview.md) | A view attached above the keyboard when it appears |
| [`inputView`](ui-text-view/inputview.md) | A view that appears instead of the system keyboard |

## Instance methods

Also inherits methods from [`UIScrollView`](ui-scroll-view.md) and [`UIView`](ui-view.md). Inherited methods commonly used with text views are `becomeFirstResponder()` and `resignFirstResponder()`; see [focus on `UITextField`](ui-text-field.md#focus).

| Method | Description |
| --- | --- |
| [`insertText()`](ui-text-view/inserttext.md) | Inserts text at the cursor as if the user typed it |
| [`deleteBackward()`](ui-text-view/deletebackward.md) | Deletes as if the user pressed the Delete key |
| [`scrollRangeToVisible()`](ui-text-view/scrollrangetovisible.md) | Scrolls until a range of text is visible |

## Events

Listen with `addEventListener()`. A text view has four events of its own:

| Event | When it fires |
| --- | --- |
| [`focus`](ui-text-view/focus-event.md) | It becomes first responder and input begins |
| [`input`](ui-text-view/input-event.md) | User input changed the content, or code called `insertText()` or `deleteBackward()` |
| [`selectionchange`](ui-text-view/selectionchange-event.md) | The selection or cursor position changed |
| [`blur`](ui-text-view/blur-event.md) | It is no longer first responder and input ends |
| [`scroll`](ui-scroll-view/scroll-event.md) and others | The eight scroll view events, inherited from [`UIScrollView`](ui-scroll-view.md#events) |
| `traitchange` | The [traits](ui-trait-collection.md) changed; inherited from `UIView` |

Rules shared by the four events:

- The event object's `type` is the event name and its `target` is the text view. The event object carries neither the content nor what changed. Read the content from `text` and the cursor from `selectedRange`.
- They can't be canceled; `preventDefault()` has no effect. So they can't be used to block a character from being entered.
- Callbacks don't run synchronously at the moment the event happens; they run a little later. See [when callbacks run](ui-control.md#when-callbacks-run). On the line after calling `insertText()`, the callback hasn't run yet.
- An exception thrown in a callback doesn't affect the text view, and other callbacks for the same event still run. The exception fires `error` on [`application`](application.md#unhandled-exceptions-dont-terminate-the-app); if no listener cancels it, the console logs a message starting with `Uncaught`.
- There is no cost when there are no listeners.
- Scroll view events can be listened to alongside these four without interfering with each other (measured).
- Listening to any other name doesn't throw: it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`.

## Content changed by code vs. by the user

| How it changed | Fires `input`? |
| --- | --- |
| The user types, deletes, or pastes | Yes (**not verified in the simulator**) |
| `insertText()`, `deleteBackward()` | Yes (measured) |
| Writing `text` | No (measured) |

So after writing `text` in code, update any UI that depends on the content (character count, placeholder text) yourself. Conversely, writing `text` in an `input` callback doesn't trigger the callback again.

## Size

By default the app sets the size of a text view: constraints or `frame` determine its width and height, and content taller than that scrolls inside it.

Once [`isScrollEnabled`](ui-scroll-view/isscrollenabled.md) is set to `false`, it no longer scrolls and instead has a height of its own: it asks to be as tall as its lines of text. When it is positioned with constraints, give only the leading, trailing, and top edges and no height; its height follows the text (measured). This holds only after it is placed in a window: for a text view not in a window, laying it out again after the text changes leaves the height unchanged (measured).

Measured with 17 pt text: one line is 36 pt, three lines 77 pt, five lines 118 pt, six lines 138 pt. With no font set, one line is 30 pt.

## Examples

### Text view with a character count

Starting from a blank app, place a text view at the top of the screen with a line of text below it showing the length of the content.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const input = new UITextView();
  input.font = UIFont.systemFontOfSize(17);
  input.backgroundColor = 'secondarySystemBackground';
  input.layer.cornerRadius = 10;
  input.keyboardDismissMode = 'onDrag';

  const counter = new UILabel();
  counter.text = 'Length 0';
  counter.textColor = 'secondaryLabel';

  input.addEventListener('input', () => {
    counter.text = 'Length ' + input.text.length;
  });
  input.addEventListener('blur', () => {
    console.log('You typed: ' + input.text);
  });

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

- A gray rounded area appears at the top of the screen, with a line of gray text "Length 0" below it.
- Tapping the gray area brings up the keyboard and a cursor appears in the area.
- With each character typed, the number in the line below changes. Pressing Return moves to the next line.
- Once the text is taller than 160 pt, the area can be scrolled vertically.
- Dragging the text downward dismisses the keyboard, and the console logs `You typed: ` followed by the full content.

This code hasn't been run as a whole in the simulator; the five points above are **not verified in the simulator**. Reading and writing each property, and the firing of `input` and `blur`, were measured in a small program without UI.

> **Note:** When the simulator is connected to the computer's hardware keyboard, the on-screen software keyboard doesn't appear. This is simulator behavior. To see the software keyboard, turn off the hardware keyboard connection in the simulator's menu.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UITextView alloc] init]` | `new UITextView()` |
| `view.text` | `input.text` |
| `view.hasText` | `input.hasText` |
| `[view insertText:@"你好"]` | `input.insertText('你好')` |
| `[view deleteBackward]` | `input.deleteBackward()` |
| `view.font = [UIFont systemFontOfSize:17]` | `input.font = UIFont.systemFontOfSize(17)` |
| `view.textColor = UIColor.labelColor` | `input.textColor = 'label'` |
| `view.textAlignment = NSTextAlignmentCenter` | `input.textAlignment = 'center'` |
| `view.textContainerInset = UIEdgeInsetsMake(12, 12, 12, 12)` | `input.textContainerInset = new UIEdgeInsets(12, 12, 12, 12)` |
| `view.textContainer.lineFragmentPadding = 0` | `input.textContainer.lineFragmentPadding = 0` |
| `view.textContainer.maximumNumberOfLines = 3` | `input.textContainer.maximumNumberOfLines = 3` |
| `view.editable = NO` | `input.isEditable = false` |
| `view.selectable = NO` | `input.isSelectable = false` |
| `view.selectedRange = NSMakeRange(0, 5)` | `input.selectedRange = new NSRange(0, 5)` |
| `[view scrollRangeToVisible:range]` | `input.scrollRangeToVisible(range)` |
| `view.keyboardDismissMode = UIScrollViewKeyboardDismissModeOnDrag` | `input.keyboardDismissMode = 'onDrag'` |
| `view.inputAccessoryView = toolbar` | `input.inputAccessoryView = toolbar` |
| Calling `[view reloadInputViews]` after changing `inputAccessoryView` | Not needed. Writing `inputAccessoryView` takes effect immediately |
| `view.scrollEnabled = NO` | `input.isScrollEnabled = false` |

Enum values: drop the type prefix and lowercase the first letter. See [Enums](enums.md).

How `UITextViewDelegate` methods and notifications map to JS:

| ObjC | JS |
| --- | --- |
| `textViewDidBeginEditing:`, `UITextViewTextDidBeginEditingNotification` | `focus` event |
| `textViewDidChange:`, `UITextViewTextDidChangeNotification` | `input` event |
| `textViewDidEndEditing:`, `UITextViewTextDidEndEditingNotification` | `blur` event |
| `textViewDidChangeSelection:` | `selectionchange` event |
| `textView:shouldChangeTextInRange:replacementText:` | No equivalent |
| `textViewShouldBeginEditing:`, `textViewShouldEndEditing:` | No equivalent |

### Compared with the browser `<textarea>`

This table is only for looking up correspondences, for people familiar with HTML forms.

| Browser | Nacre | Difference |
| --- | --- | --- |
| `textarea.value` | `input.text` | — |
| `input` event | `input` event | The event object doesn't carry the content; read `input.text` |
| `focus` / `blur` events | `focus` / `blur` events | — |
| `selectionStart`, `selectionEnd` | `selectedRange` | A start plus a length, not a start plus an end |
| `setRangeText()` | `insertText()` | Can only replace the current selection |
| `readonly` | `isEditable = false` | — |
| `placeholder` | None | Overlay a label |
| `maxlength` | None | Truncate in the `input` callback |
| `rows` | None | Height comes from constraints, or turn off scrolling so it follows the content |
| `selectionchange` event | `selectionchange` event | Fires on the text view, not on `document`. The event object doesn't carry the selection; read `input.selectedRange` |

## See also

- [Building a multiline text view](../guides/multiline-text.md): placeholder text, growing taller, read-only, dismissing the keyboard, avoiding the keyboard
- [`UITextField`](ui-text-field.md): single-line input, focus, keyboard settings
- [`UIScrollView`](ui-scroll-view.md): the text view's superclass, with scrolling properties and events
- [`NSRange`](ns-range.md), [`NSTextContainer`](ns-text-container.md)
- [`UILabel`](ui-label.md): use it for multiline text that is only displayed and doesn't need to be selected
- [Attributed strings](ns-attributed-string.md): the type of `attributedText`
