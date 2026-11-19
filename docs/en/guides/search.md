# Building a search bar

This guide covers how to use [`UISearchBar`](../api/ui-search-bar.md) for search: placing it in a view controller, filtering as the user types, submitting a search, the cancel button, scope buttons, and keyboard settings. The details of each property and event are on the [`UISearchBar`](../api/ui-search-bar.md) reference page.

## Recommended approach

- **Position it with Auto Layout, constraining the left, right, and top edges.** The search bar decides its own height, and grows by itself once a `prompt` or a scope bar is added.
- **Filter as the user types in [`input`](../api/ui-search-bar/input-event.md); submit the search in [`search`](../api/ui-search-bar/search-event.md).** The former comes once per character changed, suited to filtering data already at hand; the latter comes once only when the user taps Search on the keyboard, suited to sending a network request.
- **Dismiss the keyboard in the `search` and [`cancel`](../api/ui-search-bar/cancel-event.md) callbacks.** Call `search.resignFirstResponder()`.
- **Clear the text yourself when Cancel is tapped.** The cancel button only fires an event and does not change `text`. After clearing, `input` does not fire (the text was changed by code), so restore the filtered results yourself.
- **When you need a cancel button, show it only while editing.** Call `setShowsCancelButton(true, { animated: true })` in `focus`, and set it back to `false` in `blur`.

## A first search bar

Starting from a blank app, place a search bar at the top of the view controller, with a line of text below it showing the current search term.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Create the search bar
  const search = new UISearchBar();
  search.placeholder = 'Search cities';

  // 2. A line of text showing the current search term
  const status = new UILabel();
  status.text = 'Nothing entered yet';

  // 3. Put them in the view controller: the search bar against the top of the safe area, the text below it
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

  // 4. Each time the user changes the text, update that line
  search.addEventListener('input', () => {
    status.text = search.text === '' ? 'Nothing entered yet' : 'Typing: ' + search.text;
  });

  // 5. The user tapped Search on the keyboard: dismiss the keyboard and submit
  search.addEventListener('search', () => {
    search.resignFirstResponder();
    status.text = 'Search: ' + search.text;
    console.log('Search', search.text);
  });
});
```

**Effect**

- A search bar appears at the top of the view controller, showing "Search cities" in gray. Below it is the line "Nothing entered yet".
- Tap the search bar and the keyboard appears. Type `bei`, and the line below changes to "Typing: b", "Typing: be", and "Typing: bei" in turn.
- Tap the clear button at the right end of the field: the text is cleared and the line goes back to "Nothing entered yet".
- Type `bei` again and tap Search on the keyboard: the keyboard goes away, the line becomes "Search: bei", and the console prints `Search bei`.

The safe area is the part of the screen not covered by the notch, the rounded corners, or the home indicator; see [the safe area of `UIView`](../api/ui-view.md#safe-area).

This code has not been run as a whole in the simulator.

The following sections reuse the variables `search` and `page`. To try a section on its own, write these lines first:

```js
const page = new UIViewController();
const search = new UISearchBar();
page.view.addSubview(search);
```

## Why a new search bar is invisible

A new search bar's `frame` is 0 × 0.

| Cause | Fix |
| --- | --- |
| Positioned with Auto Layout, but the left and right edges are not constrained | Constrain the left, right, and top edges. The height does not need a constraint |
| Positioned with `frame`, without a width | First write `frame` with the position and width, then call `sizeToFit()` once |
| Positioned with `frame`, and a `prompt` or scope bar was added later | Call `sizeToFit()` again |

For the height the search bar wants in each case, see [Size](../api/ui-search-bar.md#size).

## Finding out what the user typed

Listen for [`input`](../api/ui-search-bar/input-event.md) and read [`text`](../api/ui-search-bar/text.md) in the callback:

```js
search.addEventListener('input', () => {
  console.log(search.text);
});
```

**Effect**: Each time the user changes the text (typing, deleting, tapping the clear button), the console prints the text at that moment.

The event object does not carry the text; read it from `search.text`, which gives the value at the time the callback runs. Writing `search.text` from code does not fire `input`, so changing `text` in the `input` callback does not cause a loop.

## Reading and setting the search term

```js
search.text = 'beijing';
console.log(search.text);
```

**Effect**: `beijing` appears in the field, and the console prints `beijing`. `input` does not fire.

When nothing has been typed, `text` is the empty string `''`, not `null`.

## Showing placeholder text

```js
search.placeholder = 'Search cities';
```

**Effect**: When the field is empty, it shows "Search cities" in gray. It disappears when the user types the first character.

To check whether there is a placeholder, use `!search.placeholder`; for why, see [`placeholder`](../api/ui-search-bar/placeholder.md).

## Showing and dismissing the keyboard

When the user taps the search bar, the keyboard appears and the search bar fires `focus`. You can also bring it up from code:

```js
const ok = search.becomeFirstResponder();
console.log(ok);
```

**Effect**: The keyboard appears with the cursor in the search bar, and the console prints `true`. The search bar fires `focus`.

When the search bar is not yet on screen, or the view controller is in a transition, the system refuses; then it prints `false` and the keyboard does not appear. For when it is refused, see [Focus on `UITextField`](../api/ui-text-field.md#focus).

Dismissing the keyboard:

```js
search.resignFirstResponder();
```

**Effect**: The keyboard goes away, and the search bar fires `blur`.

Whether the keyboard covers content in the view controller once it appears is the same issue as with a text field; for how to handle it, see [Building a text field](text-fields.md).

## Showing a cancel button and leaving search when it is tapped

```js
search.addEventListener('focus', () => {
  search.setShowsCancelButton(true, { animated: true });
});
search.addEventListener('blur', () => {
  search.setShowsCancelButton(false, { animated: true });
});
search.addEventListener('cancel', () => {
  search.text = '';
  search.resignFirstResponder();
});
```

**Effect**: Tap the search bar and a cancel button slides in on the right. Tap the cancel button: the text is cleared, the keyboard goes away, and the cancel button disappears. **This example is not verified in the simulator.**

## Adding a row of scope buttons

```js
search.scopeButtonTitles = ['All', 'Mine', 'Shared'];
search.showsScopeBar = true;
search.addEventListener('scopechange', () => {
  console.log('Scope', search.selectedScopeButtonIndex);
});
```

**Effect**: A row of three buttons appears below the field, with "All" selected. The search bar gets taller. Tap "Mine" and the console prints `Scope 1`. **That tapping a button fires the event is not verified in the simulator.**

Writing only `scopeButtonTitles` does not show the row; you also need `showsScopeBar = true`. There must be at least two titles.

## Switching scope from code

```js
search.selectedScopeButtonIndex = 2;
```

**Effect**: The third scope button becomes selected. `scopechange` does not fire.

The index may exceed the number of titles, or be `-1`, so confirm it is in range before getting a title; see [`selectedScopeButtonIndex`](../api/ui-search-bar/selectedscopebuttonindex.md).

## Adding a line of explanation above the field

```js
search.prompt = 'Enter a city name';
```

**Effect**: A line of small text appears above the field. The height the search bar wants changes from 64 pt to 98 pt.

Write `null` to remove this line.

## Changing the keyboard and Return key

The search bar has nine keyboard settings, written directly on the search bar:

```js
search.keyboardType = 'url';
search.returnKeyType = 'go';
```

**Effect**: The keyboard switches to the layout for entering URLs, and the Return key reads "Go". **The visuals are not verified in the simulator.**

For the available values, see [`keyboardType`](../api/ui-text-field/keyboardtype.md) and [`returnKeyType`](../api/ui-text-field/returnkeytype.md). Three defaults on a search bar differ from a new `UITextField`:

| Property | Search bar | New `UITextField` |
| --- | --- | --- |
| `returnKeyType` | `'search'`: the Return key reads "Search" | `'default'` |
| `enablesReturnKeyAutomatically` | `true`: the Return key is gray when there is no content | `false` |
| `autocorrectionType` | `'no'`: no autocorrection | `'default'` |

## Turning off autocapitalization and spell checking

```js
search.autocapitalizationType = 'none';
search.spellCheckingType = 'no';
```

**Effect**: The first letter typed is not automatically capitalized, and misspelled words are not underlined in red. Suited to searching for content that is not natural language, such as user names or code. **The visuals are not verified in the simulator.**

Autocorrection on a search bar (`autocorrectionType`) is already off by default.

## Changing the font and text color

The search bar itself has no font or text color properties. Set these on the text field inside it, [`searchTextField`](../api/ui-search-bar/searchtextfield.md):

```js
search.searchTextField.font = UIFont.systemFontOfSize(18);
search.searchTextField.textColor = 'systemBlue';
```

**Effect**: The search term becomes 18 pt and blue. **Not verified in the simulator.**

The text, placeholder, and keyboard settings are shared between the search bar and `searchTextField`, so writing them on the search bar alone is enough.

## Changing the color of the cursor and buttons

```js
search.tintColor = 'systemOrange';
```

**Effect**: The cursor and the cancel button turn orange.

For how to write colors, see [Colors](../api/ui-color.md). Write `null` to go back to the inherited color.

## Removing the search bar's background

```js
search.searchBarStyle = 'minimal';
```

**Effect**: The search bar's own background disappears, leaving only the field inside. **The visuals are not verified in the simulator.**

## Temporarily disabling the search bar

```js
search.isEnabled = false;
```

**Effect**: Tapping the search bar does nothing, and the keyboard does not appear. Write `true` back to restore it. How it looks when disabled is **not verified in the simulator**.

## Placing a row of buttons above the keyboard

```js
const bar = new UIToolbar();
const done = UIBarButtonItem.systemItem('done');
done.addEventListener('click', () => search.resignFirstResponder());
bar.items = [UIBarButtonItem.flexibleSpace(), done];
bar.sizeToFit();
search.inputAccessoryView = bar;
```

**Effect**: When the keyboard appears, there is a [toolbar](../api/ui-toolbar.md) above it with Done at its right end. Tap it and the keyboard goes away. **This example is not verified in the simulator.**

## Positioning with `frame`

```js
const fixed = new UISearchBar();
fixed.frame = new CGRect(0, 100, 390, 0);
fixed.sizeToFit();
page.view.addSubview(fixed);
console.log(fixed.frame.height);
```

**Effect**: The console prints `64`. A search bar 390 pt wide, with its top at y = 100 in the view controller.

## See also

- [`UISearchBar`](../api/ui-search-bar.md): all properties, methods, and events
- [`UITextField`](../api/ui-text-field.md): the type of `searchTextField`; focus and keyboard settings
- [Building a toolbar](toolbars.md): the row of buttons placed above the keyboard
