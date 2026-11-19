---
type: reference
native: UIToolbar
status: partial
---

# `UIToolbar`

**`UIToolbar`** represents a toolbar: a horizontal bar with a number of buttons arranged from left to right. Each button is a [`UIBarButtonItem`](ui-bar-button-item.md), the same kind of object as the buttons on the navigation bar.

The app decides where the toolbar goes; commonly it's at the bottom of a view controller or above the keyboard. A toolbar isn't a control and doesn't fire events itself: taps come from each `UIBarButtonItem` inside it, so listen for `click` on whichever button you want to hear from.

The space between buttons is also an item: a flexible space, `UIBarButtonItem.flexibleSpace()`, fills the remaining width, and a fixed space, `UIBarButtonItem.fixedSpace(width)`, takes the given width. The toolbar has no alignment or spacing properties.

The values and state changes on this group of pages (defaults, sizes, read/write results, errors) were measured in an app in the simulator (iPhone Air, iOS 27.2) on toolbars not placed in a window. The on-screen appearance (how buttons are arranged, colors, animations) and real taps are **not verified in the simulator**.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIToolbar`

For how to arrange buttons and place a toolbar at the bottom of a view controller or above the keyboard, see the guide [Building a toolbar](../guides/toolbars.md).

## Constructor

[`UIToolbar()`](ui-toolbar/constructor.md)

Creates an empty toolbar with a 0 × 0 `frame`.

## Instance properties

Also inherits properties from [`UIView`](ui-view.md). Inherited properties commonly used with toolbars are `frame`, `isHidden`, and `intrinsicContentSize`.

| Property | Description |
| --- | --- |
| [`items`](ui-toolbar/items.md) | The items on the toolbar, from left to right. Reading gives a snapshot |
| [`barStyle`](ui-toolbar/barstyle.md) | The bar's light/dark style |
| [`isTranslucent`](ui-toolbar/istranslucent.md) | Whether the bar's background is translucent |
| [`tintColor`](ui-toolbar/tintcolor.md) | The color of button text and icons |
| [`barTintColor`](ui-toolbar/bartintcolor.md) | The bar's own background color |

## Instance methods

Also inherits methods from [`UIView`](ui-view.md), such as `sizeToFit()`.

| Method | Description |
| --- | --- |
| [`setItems()`](ui-toolbar/setitems.md) | Replaces the items, optionally with animation |

## Events

The toolbar itself has no events. Listen for `click` on each [`UIBarButtonItem`](ui-bar-button-item.md).

## Size

A new toolbar's `frame` is 0 × 0. Its own preferred height is 48 pt, with no preference for width: `intrinsicContentSize` reads back a width of -1 (no preference) and a height of 48.

- When positioning with [Auto Layout](auto-layout.md), constrain the left and right edges and the top (or bottom); the height doesn't need a constraint.
- When positioning with `frame`, first write `frame` to give the position and width, then call `sizeToFit()` once. `sizeToFit()` changes only the height; the width and position stay the same.

48 pt was measured in the iPhone Air simulator (iOS 27.2); whether it's the same on other models and system versions is **not verified**. When you need the height, read `intrinsicContentSize.height`; don't hard-code this number.

## Examples

### A toolbar at the bottom of a view controller

Starting from a blank app, place a toolbar at the bottom of the view controller with a plus on the left and a trash can on the right.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const toolbar = new UIToolbar();
  const add = UIBarButtonItem.systemItem('add');
  add.addEventListener('click', () => console.log('New'));
  const trash = UIBarButtonItem.systemItem('trash');
  trash.addEventListener('click', () => console.log('Delete'));
  toolbar.items = [add, UIBarButtonItem.flexibleSpace(), trash];

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

- A 48 pt tall bar appears at the bottom of the view controller, with a plus at the left end and a trash can at the right end.
- Tapping the plus prints `New` to the console; tapping the trash can prints `Delete`.

This code hasn't been run as a whole in the simulator.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UIToolbar alloc] init]` | `new UIToolbar()` |
| `toolbar.items = @[a, b]` | `toolbar.items = [a, b]` |
| `toolbar.items = nil` | `toolbar.items = null` (reads back as `[]`) |
| `[toolbar setItems:@[a, b] animated:YES]` | `toolbar.setItems([a, b], { animated: true })` |
| `toolbar.barStyle = UIBarStyleBlack` | `toolbar.barStyle = 'black'` |
| `toolbar.translucent = NO` | `toolbar.isTranslucent = false` |
| `toolbar.tintColor = UIColor.systemRedColor` | `toolbar.tintColor = 'systemRed'` |
| `toolbar.barTintColor = nil` | `toolbar.barTintColor = null` |
| `[UIBarButtonItem flexibleSpaceItem]` | `UIBarButtonItem.flexibleSpace()` |
| `[UIBarButtonItem fixedSpaceItemOfWidth:24]` | `UIBarButtonItem.fixedSpace(24)` |

## See also

- [Building a toolbar](../guides/toolbars.md): arranging buttons, placing it at the bottom of a view controller and above the keyboard
- [`UIBarButtonItem`](ui-bar-button-item.md): how to create a `UIBarButtonItem` and what members it has
- [`UISearchBar`](ui-search-bar.md): its `inputAccessoryView` can hold a toolbar
- [`UIView`](ui-view.md): the toolbar's parent class; position, size, hiding
