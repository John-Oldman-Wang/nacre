---
type: reference
native: UISearchBar
status: partial
---

# `UISearchBar`

**`UISearchBar`** represents a search bar: a single-line text field with a magnifying-glass icon and a clear button at its right end. It can also have a cancel button, a bookmark button, and a row of buttons for switching the search scope.

The search bar only takes the search term the user types and notifies the app. What to search and where to show the results is up to the app.

A search bar is not a [control](ui-control.md): it doesn't have the control events. It has its own eight events instead; see [Events](#events). The events carry no data. When an event arrives, read [`text`](ui-search-bar/text.md) and [`selectedScopeButtonIndex`](ui-search-bar/selectedscopebuttonindex.md). Show and hide the keyboard with the inherited `becomeFirstResponder()` and `resignFirstResponder()`; see [focus on `UITextField`](ui-text-field.md#focus).

The text field inside the search bar is a [`UITextField`](ui-text-field.md), available from [`searchTextField`](ui-search-bar/searchtextfield.md). It shares the same text and the same keyboard settings with the search bar.

The values and state changes on these pages (defaults, sizes, results of reads and writes, errors) were measured in the simulator (iPhone Air, iOS 27.2) on search bars that were not in a window. The on-screen appearance, keyboard behavior, and real touches are **not verified in the simulator**.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UISearchBar`

For filtering as the user types, the cancel button, and scope buttons, see the guide [Building a search bar](../guides/search.md).

## Constructor

[`UISearchBar()`](ui-search-bar/constructor.md)

Creates a search bar whose `frame` is 0 × 0 and whose `text` is the empty string.

## Instance properties

Also inherits the properties of [`UIView`](ui-view.md). The inherited properties most often used on a search bar are `frame`, `isHidden`, and `isFirstResponder`.

Text:

| Property | Description |
| --- | --- |
| [`text`](ui-search-bar/text.md) | The text in the text field |
| [`placeholder`](ui-search-bar/placeholder.md) | Gray text shown when the field is empty |
| [`prompt`](ui-search-bar/prompt.md) | A line of description above the text field |
| [`searchTextField`](ui-search-bar/searchtextfield.md) <small>read-only</small> | The text field inside the search bar |

Style:

| Property | Description |
| --- | --- |
| [`searchBarStyle`](ui-search-bar/searchbarstyle.md) | Whether the search bar has its own background |
| [`barStyle`](ui-search-bar/barstyle.md) | The light or dark style of the bar |
| [`isTranslucent`](ui-search-bar/istranslucent.md) | Whether the background is translucent |
| [`isEnabled`](ui-search-bar/isenabled.md) | Whether it can be tapped and typed into |
| [`tintColor`](ui-search-bar/tintcolor.md) | The color of the cursor and the buttons |
| [`barTintColor`](ui-search-bar/bartintcolor.md) | The search bar's own background color |

Buttons:

| Property | Description |
| --- | --- |
| [`showsCancelButton`](ui-search-bar/showscancelbutton.md) | Shows the cancel button |
| [`showsBookmarkButton`](ui-search-bar/showsbookmarkbutton.md) | Shows a bookmark button at the right end of the text field |
| [`showsSearchResultsButton`](ui-search-bar/showssearchresultsbutton.md) | Shows a results list button at the right end of the text field |
| [`isSearchResultsButtonSelected`](ui-search-bar/issearchresultsbuttonselected.md) | Whether the results list button looks selected |

Scope buttons:

| Property | Description |
| --- | --- |
| [`scopeButtonTitles`](ui-search-bar/scopebuttontitles.md) | The titles of the scope buttons, from left to right |
| [`selectedScopeButtonIndex`](ui-search-bar/selectedscopebuttonindex.md) | Which scope button is selected |
| [`showsScopeBar`](ui-search-bar/showsscopebar.md) | Shows the scope bar |

Keyboard settings. These nine properties take the same values as the properties of the same names on [`UITextField`](ui-text-field.md) and [`UITextView`](ui-text-view.md), and behave the same way on invalid values. Three defaults differ from a new `UITextField`: `returnKeyType`, `enablesReturnKeyAutomatically`, and `autocorrectionType`.

| Property | Description |
| --- | --- |
| [`keyboardType`](ui-search-bar/keyboardtype.md) | Which keyboard appears |
| [`returnKeyType`](ui-search-bar/returnkeytype.md) | The label on the return key |
| [`keyboardAppearance`](ui-search-bar/keyboardappearance.md) | Light or dark keyboard |
| [`enablesReturnKeyAutomatically`](ui-search-bar/enablesreturnkeyautomatically.md) | Grays out the return key when the field is empty |
| [`isSecureTextEntry`](ui-search-bar/issecuretextentry.md) | Shows typed characters as dots |
| [`autocapitalizationType`](ui-search-bar/autocapitalizationtype.md) | Automatic capitalization |
| [`autocorrectionType`](ui-search-bar/autocorrectiontype.md) | Autocorrection |
| [`spellCheckingType`](ui-search-bar/spellcheckingtype.md) | Spell checking |
| [`textContentType`](ui-search-bar/textcontenttype.md) | What kind of content the field holds, used for AutoFill |

Above the keyboard:

| Property | Description |
| --- | --- |
| [`inputAccessoryView`](ui-search-bar/inputaccessoryview.md) | A view attached above the keyboard when it appears |

## Instance methods

Also inherits the methods of [`UIView`](ui-view.md), such as `becomeFirstResponder()`, `resignFirstResponder()`, and `sizeToFit()`. When the search bar has focus, both `search.isFirstResponder` and `search.searchTextField.isFirstResponder` are `true`.

| Method | Description |
| --- | --- |
| [`setShowsCancelButton()`](ui-search-bar/setshowscancelbutton.md) | Shows or hides the cancel button, optionally animated |
| [`setShowsScopeBar()`](ui-search-bar/setshowsscopebar.md) | Shows or hides the scope bar, optionally animated |

## Events

Listen with `addEventListener()`.

| Event | When it fires |
| --- | --- |
| [`focus`](ui-search-bar/focus-event.md) | Editing begins: the search bar gains focus |
| [`blur`](ui-search-bar/blur-event.md) | Editing ends: the search bar gives up focus |
| [`input`](ui-search-bar/input-event.md) | The user changes the text, including by tapping the clear button |
| [`search`](ui-search-bar/search-event.md) | The user taps the Search key on the keyboard |
| [`cancel`](ui-search-bar/cancel-event.md) | The user taps the cancel button |
| [`bookmarkclick`](ui-search-bar/bookmarkclick-event.md) | The user taps the bookmark button |
| [`resultslistclick`](ui-search-bar/resultslistclick-event.md) | The user taps the results list button |
| [`scopechange`](ui-search-bar/scopechange-event.md) | The user taps a different scope button |
| `traitchange` | The [traits](ui-trait-collection.md) change; inherited from `UIView` |

Rules shared by the eight events:

- **The event object has only `type` and `target`** (the search bar itself) and carries no other data. The events are not cancelable.
- **Only user actions fire events.** Setting `text` or `selectedScopeButtonIndex` in code fires nothing.
- **Events fire a little after the action, not at the moment it happens.** The `text` and `selectedScopeButtonIndex` you read in the callback are the values at the time the callback runs.
- **Listening for other names doesn't throw**: such a name is treated as a custom event and only fires when you dispatch it yourself with `dispatchEvent()`.

How they were verified: `focus`, `blur`, `input`, and `search` were verified by making the inner text field send the corresponding actions from code, not through a real keyboard. `cancel`, `bookmarkclick`, `resultslistclick`, and `scopechange` need a real tap to fire and are **not verified in the simulator**.

## Size

A new search bar has a `frame` of 0 × 0. It has no width requirement (the width of `intrinsicContentSize` is -1), and the height it wants changes with its content:

| Situation | Height it wants |
| --- | --- |
| Text field only | 64 pt |
| With a [`prompt`](ui-search-bar/prompt.md) | 98 pt |
| Scope bar shown, with two or more scope buttons | 111 pt |

- When positioning with [Auto Layout](auto-layout.md), constrain its left, right, and top edges; don't constrain the height.
- When positioning with `frame`, set `frame` first to give it a position and width, then call `sizeToFit()` once. Call it again every time you add or remove the `prompt` or the scope bar.

## Examples

### A search bar at the top of the view controller

Starting from a blank app, put a search bar at the top of the view controller, with a line of text below it that shows the current search term.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const search = new UISearchBar();
  search.placeholder = 'Search cities';
  const status = new UILabel();
  status.text = 'Nothing typed yet';

  const safe = page.view.safeAreaLayoutGuide;
  search.translatesAutoresizingMaskIntoConstraints = false;
  status.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(search);
  page.view.addSubview(status);
  NSLayoutConstraint.activateConstraints([
    search.topAnchor.constraintEqualToAnchor(safe.topAnchor),
    search.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor),
    search.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor),
    status.topAnchor.constraintEqualToAnchor(search.bottomAnchor, { constant: 16 }),
    status.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  ]);

  search.addEventListener('input', () => {
    status.text = search.text === '' ? 'Nothing typed yet' : 'Typing: ' + search.text;
  });
  search.addEventListener('search', () => {
    search.resignFirstResponder();
    status.text = 'Search: ' + search.text;
    console.log('search', search.text);
  });
});
```

**Effect**

- A search bar appears at the top of the view controller, with gray "Search cities" in it. Below it is the line "Nothing typed yet".
- Tap the search bar and the keyboard appears. Type `bei`, and the line below changes to "Typing: b", "Typing: be", "Typing: bei" in turn.
- Tap the clear button at the right end of the text field. The text is cleared and the line below goes back to "Nothing typed yet".
- Type `bei` again and tap Search on the keyboard. The keyboard goes away, the line below changes to "Search: bei", and the console prints `search bei`.

This code has not been run as a whole in the simulator.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UISearchBar alloc] init]` | `new UISearchBar()` |
| `bar.text = @"beijing"` | `bar.text = 'beijing'` |
| `bar.placeholder = @"Search"` | `bar.placeholder = 'Search'` |
| `bar.prompt = nil` | `bar.prompt = null` |
| `bar.keyboardType = UIKeyboardTypeURL` | `bar.keyboardType = 'url'` |
| `bar.returnKeyType = UIReturnKeyGo` | `bar.returnKeyType = 'go'` |
| `bar.keyboardAppearance = UIKeyboardAppearanceDark` | `bar.keyboardAppearance = 'dark'` |
| `bar.enablesReturnKeyAutomatically = NO` | `bar.enablesReturnKeyAutomatically = false` |
| `bar.secureTextEntry = YES` | `bar.isSecureTextEntry = true` |
| `bar.autocapitalizationType = UITextAutocapitalizationTypeNone` | `bar.autocapitalizationType = 'none'` |
| `bar.autocorrectionType = UITextAutocorrectionTypeYes` | `bar.autocorrectionType = 'yes'` |
| `bar.spellCheckingType = UITextSpellCheckingTypeNo` | `bar.spellCheckingType = 'no'` |
| `bar.textContentType = UITextContentTypeUsername` | `bar.textContentType = 'username'` |
| `bar.textContentType = nil` | `bar.textContentType = null` |
| `bar.searchTextField.keyboardType = UIKeyboardTypeURL` | `bar.searchTextField.keyboardType = 'url'` |
| `bar.searchBarStyle = UISearchBarStyleMinimal` | `bar.searchBarStyle = 'minimal'` |
| `bar.barStyle = UIBarStyleBlack` | `bar.barStyle = 'black'` |
| `bar.translucent = NO` | `bar.isTranslucent = false` |
| `bar.enabled = NO` | `bar.isEnabled = false` |
| `bar.showsCancelButton = YES` | `bar.showsCancelButton = true` |
| `[bar setShowsCancelButton:YES animated:YES]` | `bar.setShowsCancelButton(true, { animated: true })` |
| `bar.showsBookmarkButton = YES` | `bar.showsBookmarkButton = true` |
| `bar.showsSearchResultsButton = YES` | `bar.showsSearchResultsButton = true` |
| `bar.searchResultsButtonSelected = YES` | `bar.isSearchResultsButtonSelected = true` |
| `bar.scopeButtonTitles = @[@"All", @"Mine"]` | `bar.scopeButtonTitles = ['All', 'Mine']` |
| `bar.selectedScopeButtonIndex = 1` | `bar.selectedScopeButtonIndex = 1` |
| `[bar setShowsScopeBar:YES animated:YES]` | `bar.setShowsScopeBar(true, { animated: true })` |
| `bar.tintColor = UIColor.systemOrangeColor` | `bar.tintColor = 'systemOrange'` |
| `bar.barTintColor = nil` | `bar.barTintColor = null` |
| `bar.inputAccessoryView = toolbar` | `bar.inputAccessoryView = toolbar` |
| `[bar becomeFirstResponder]` | `bar.becomeFirstResponder()` |

iOS receives notifications through a delegate object (`UISearchBarDelegate`). In JS these become events on the search bar:

| `UISearchBarDelegate` method | JS event |
| --- | --- |
| `searchBarTextDidBeginEditing:` | `focus` |
| `searchBarTextDidEndEditing:` | `blur` |
| `searchBar:textDidChange:` | `input` (read the text from `bar.text`) |
| `searchBarSearchButtonClicked:` | `search` |
| `searchBarCancelButtonClicked:` | `cancel` |
| `searchBarBookmarkButtonClicked:` | `bookmarkclick` |
| `searchBarResultsListButtonClicked:` | `resultslistclick` |
| `searchBar:selectedScopeButtonIndexDidChange:` | `scopechange` (read the index from `bar.selectedScopeButtonIndex`) |

## See also

- [Building a search bar](../guides/search.md): filtering as the user types, the cancel button, scope buttons, the keyboard
- [`UITextField`](ui-text-field.md): the type of `searchTextField`; all values of the keyboard settings, focus, and keyboard avoidance
- [`UITextView`](ui-text-view.md): multi-line input, with the same nine keyboard settings
- [`UIToolbar`](ui-toolbar.md): can be placed above the search bar's keyboard
- [`UIView`](ui-view.md): the search bar's superclass; position, size, hiding
