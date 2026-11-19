# Building a toolbar

This guide shows how to build a row of buttons with [`UIToolbar`](../api/ui-toolbar.md): placing it at the bottom of the page, arranging buttons, adding and removing buttons, and putting it above the keyboard. The buttons themselves are [`UIBarButtonItem`](../api/ui-bar-button-item.md)s. Details of each property and method are on the reference pages.

## Recommended approach

- **Position it with Auto Layout, constraining the left, right, and bottom edges.** When the screen width changes, the toolbar widens with it, and its height is determined by the toolbar itself (48 pt), so no specific height appears in your code.
- **Listen for taps on the buttons.** The toolbar itself has no events; taps come from each `UIBarButtonItem`'s `click`.
- **One reference to a button is enough.** The toolbar holds its items, so after you put a button in `items`, the button and its listeners aren't lost even if you don't keep a variable yourself.
- **Use [`setItems(items, { animated: true })`](../api/ui-toolbar/setitems.md) to add and remove buttons.** Writing [`items`](../api/ui-toolbar/items.md) directly replaces them immediately, with no transition.
- **Put each button in only one toolbar.** Putting the same `UIBarButtonItem` in a second toolbar doesn't throw, and both toolbars' `items` contain it; which one it appears in on screen is **not verified in the simulator**.

## First toolbar

Starting from a blank app, place a toolbar at the bottom of the page with a plus on the left and a trash can on the right.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and the page. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Create the toolbar
  const toolbar = new UIToolbar();

  // 2. Create the buttons, each listening for taps
  const add = UIBarButtonItem.systemItem('add');
  add.addEventListener('click', () => console.log('New'));
  const trash = UIBarButtonItem.systemItem('trash');
  trash.addEventListener('click', () => console.log('Delete'));

  // 3. Arrange them in the toolbar: plus on the left, trash can on the right, flexible space in between
  toolbar.items = [add, UIBarButtonItem.flexibleSpace(), trash];

  // 4. Put it at the bottom of the page: left and right edges flush, bottom on the safe area. No height needed
  const safe = page.view.safeAreaLayoutGuide;
  toolbar.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(toolbar);
  NSLayoutConstraint.activateConstraints([
    toolbar.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor),
    toolbar.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor),
    toolbar.bottomAnchor.constraintEqualToAnchor(safe.bottomAnchor),
  ]);
});
```

**Effect**

- A 48 pt tall bar appears at the bottom of the page, with a plus at the left end and a trash can at the right end.
- Tap the plus, and the console prints `New`; tap the trash can, and it prints `Delete`.

The safe area is the region of the screen not covered by the notch, the rounded corners, or the home indicator at the bottom; see [`UIView`'s safe area](../api/ui-view.md#safe-area).

This code has not been run as a whole in the simulator.

The four steps are: create the toolbar, create the buttons, arrange them, and put it on the page. Each usage below modifies these four steps and reuses the variables `toolbar`, `add`, `trash`, and `page`. To try a section on its own, write these lines first:

```js
const page = new UIViewController();
const toolbar = new UIToolbar();
const add = UIBarButtonItem.systemItem('add');
const trash = UIBarButtonItem.systemItem('trash');
page.view.addSubview(toolbar);
```

## Why a new toolbar is invisible

A new toolbar's `frame` is 0 × 0, and it has no buttons.

| Cause | Fix |
| --- | --- |
| Positioned with Auto Layout, but the left and right edges aren't constrained | Constrain the left and right edges and the top (or bottom). The height doesn't need a constraint; it is 48 pt on its own |
| Positioned with `frame`, but no width given | First write `frame` to give the position and width, then call `sizeToFit()` once |
| `items` is empty | Put buttons in [`items`](../api/ui-toolbar/items.md) |

48 pt was measured in the iPhone Air simulator (iOS 27.2). Don't write this number into your code: when you need the height, read `toolbar.intrinsicContentSize.height`, or let constraints decide.

## Placing buttons in the middle

A toolbar has no properties like "align left", "center", or "spacing". Buttons are laid out one after another starting from the left; to leave space in between, put a placeholder item in `items`:

| Placeholder item | Purpose |
| --- | --- |
| `UIBarButtonItem.flexibleSpace()` | Flexible space: fills the remaining width. Several flexible spaces split it evenly |
| `UIBarButtonItem.fixedSpace(width)` | Space of fixed width; `width` is in [pt](../api/units.md) |

```js
const share = new UIBarButtonItem({ title: 'Share' });
toolbar.items = [UIBarButtonItem.flexibleSpace(), share, UIBarButtonItem.flexibleSpace()];
```

**Effect**: The toolbar has only the word "Share", in the exact center.

## Spacing three buttons evenly

```js
const share2 = new UIBarButtonItem({ title: 'Share' });
toolbar.items = [
  add,
  UIBarButtonItem.flexibleSpace(),
  share2,
  UIBarButtonItem.flexibleSpace(),
  trash,
];
```

**Effect**: The plus is at the left end, "Share" in the middle, and the trash can at the right end.

## Leaving a fixed distance between two buttons

```js
toolbar.items = [add, UIBarButtonItem.fixedSpace(24), trash];
```

**Effect**: The plus and trash can are both on the left, 24 pt apart.

## Adding a button

`items` reads back as a snapshot; `push`ing onto that array doesn't change the toolbar. To add or remove buttons, reassign the whole thing:

```js
toolbar.items = [...toolbar.items, UIBarButtonItem.systemItem('done')];
```

**Effect**: "Done" is added at the far right. The existing buttons are still the same objects, with all their listeners.

## Adding and removing buttons with animation

```js
toolbar.setItems([add, UIBarButtonItem.flexibleSpace()], { animated: true });
console.log(toolbar.items.length);
```

**Effect**: The trash can fades out. The console prints `2`: `items` already holds the new set when the call returns.

## Clearing the toolbar

```js
toolbar.items = [];
```

**Effect**: The toolbar has no buttons; the bar remains. Writing `null` has the same effect.

## Disabling one of the buttons

```js
trash.isEnabled = false;
```

**Effect**: The trash can turns gray, and tapping it does nothing. The plus isn't affected.

`isEnabled` is a property of the button itself; see [`UIBarItem`'s `isEnabled`](../api/ui-bar-item/isenabled.md).

## Changing the button color

```js
toolbar.tintColor = 'systemRed';
```

**Effect**: The text and icons of all buttons on the toolbar turn red.

For how to write colors, see [Colors](../api/ui-color.md). Writing `null` restores the inherited color.

## Changing the toolbar's background color

```js
toolbar.barTintColor = '#1C1C1E';
```

**Effect**: The bar's background turns dark gray. **Whether this property still changes what's on screen under the iOS 26 interface style is not verified in the simulator.**

## Positioning with `frame`

```js
const fixed = new UIToolbar();
fixed.frame = new CGRect(0, 300, 390, 0);
fixed.sizeToFit();
page.view.addSubview(fixed);
console.log(fixed.frame.height);
```

**Effect**: The console prints `48`. A toolbar 390 pt wide, with its top edge at y = 300 on the page.

`sizeToFit()` changes only the height; the width and position stay the same. Without calling it, the toolbar's height is whatever was written in `frame`.

## Placing it above the keyboard

[`UISearchBar`](../api/ui-search-bar.md)'s [`inputAccessoryView`](../api/ui-search-bar/inputaccessoryview.md) accepts a view that sticks to the top of the keyboard when the keyboard appears. Put a toolbar there, and you get a row of buttons above the keyboard:

```js
const search = new UISearchBar();
const bar = new UIToolbar();
const done = UIBarButtonItem.systemItem('done');
done.addEventListener('click', () => search.resignFirstResponder());
bar.items = [UIBarButtonItem.flexibleSpace(), done];
bar.sizeToFit();
search.inputAccessoryView = bar;
```

**Effect**: When the search field is tapped and the keyboard appears, there is a toolbar above the keyboard with "Done" at the right end. Tap it, and the keyboard is dismissed. **This example is not verified in the simulator.**

## See also

- [`UIToolbar`](../api/ui-toolbar.md): all properties and methods
- [`UIBarButtonItem`](../api/ui-bar-button-item.md): how to create a `UIBarButtonItem` and which system icons are available
- [Auto Layout](../api/auto-layout.md): how to constrain the left, right, and bottom edges
