---
type: reference
native: UINavigationItem
status: partial
---

# `UINavigationItem`

**`UINavigationItem`** represents a view controller's configuration for the navigation bar: the title in the center, the subtitle, the text on the next view controller's back button, and which buttons are on the left and right. The navigation bar is the strip that a [`UINavigationController`](ui-navigation-controller.md) draws at the top of the screen.

There is only one navigation bar, but each view controller has its own configuration. Every [`UIViewController`](ui-view-controller.md) comes with a `UINavigationItem`, read from [`navigationItem`](ui-view-controller/navigationitem.md). Whichever view controller the navigation controller shows, the navigation bar shows that view controller's configuration. When the view controller changes, the navigation bar's content changes with it; no code is needed.

The buttons on either side are [`UIBarButtonItem`](ui-bar-button-item.md)s.

**Inheritance**: `EventTarget` → `NSObject` → `UINavigationItem`

For changing the title, adding buttons, and changing the back button, see the guide [Putting buttons and a title in the navigation bar](../guides/bar-buttons.md).

## Constructor

Cannot be created with `new`. `new UINavigationItem()` throws `TypeError: Illegal constructor: UINavigationItem is created by the runtime, not by new`. Read it from a view controller's [`navigationItem`](ui-view-controller/navigationitem.md): there is one per view controller, and every read returns the same object.

## Instance properties

None of these properties fires an event when it changes: only code changes them.

| Property | Description |
| --- | --- |
| [`title`](ui-navigation-item/title.md) | The text in the center of the navigation bar |
| [`subtitle`](ui-navigation-item/subtitle.md) | A line of small text below the title |
| [`backButtonTitle`](ui-navigation-item/backbuttontitle.md) | The text on the **next** view controller's back button |
| [`hidesBackButton`](ui-navigation-item/hidesbackbutton.md) | Hides the back button while this view controller is at the top of the stack |
| [`titleView`](ui-navigation-item/titleview.md) | A view shown in the center of the navigation bar in place of the title text |
| [`leftBarButtonItems`](ui-navigation-item/leftbarbuttonitems.md) | The buttons on the left |
| [`rightBarButtonItems`](ui-navigation-item/rightbarbuttonitems.md) | The buttons on the right |

## When the configuration takes effect

`navigationItem` exists as soon as the view controller is created, and can be read and written even when the view controller is not on a navigation stack. At that point no navigation bar shows it; the settings are kept and shown when the view controller enters a navigation stack and becomes the top. So the whole configuration can be set before pushing.

Whether the navigation bar updates immediately when you change it while the view controller is on screen is **not verified in the simulator**.

## The system adds the back button

The back button is not part of the current view controller's configuration. When the navigation stack has more than one view controller, the system automatically puts a back button on the left of the navigation bar; tapping it pops the current view controller.

The text on the back button comes from the **previous** view controller, not the current one:

1. If the previous view controller set [`backButtonTitle`](ui-navigation-item/backbuttontitle.md), that is used.
2. Otherwise, the previous view controller's title is used.

## Two ways to set the title

The navigation bar's title can be written from two properties: the view controller's [`title`](ui-view-controller/title.md) and the `navigationItem`'s [`title`](ui-navigation-item/title.md). They are two separate pieces of data, synced in one direction only (verified by testing):

| Operation | `page.title` | `page.navigationItem.title` |
| --- | --- | --- |
| Write `page.title` | New value | Also becomes the new value |
| Write `page.navigationItem.title` | Unchanged | New value |
| Write `page.navigationItem.title` as `null` | Unchanged | `null`; it does not fall back to `page.title` |

The navigation bar shows `navigationItem.title`. Use only one of the two; `page.title` is recommended, for the reasons in the guide's [Recommended approach](../guides/bar-buttons.md#recommended-approach).

## Left buttons and going back

The left side of the navigation bar is normally where the back button goes. By iOS's rules:

| The view controller's settings | Back button | [Swipe back](ui-navigation-controller.md) |
| --- | --- | --- |
| Nothing set | Shown | Available |
| `leftBarButtonItems` has buttons | Not shown; its place goes to those buttons | Not available |
| `hidesBackButton` is `true` | Not shown | Not available |

The last two rows are **not verified in the simulator**. Once the left side is replaced with other buttons, the system no longer treats "going back" as the view controller's default action, so the view controller must provide its own way back.

## Examples

```js
const page = new UIViewController();
page.title = 'Settings';
page.navigationItem.subtitle = '12 items';
page.navigationItem.rightBarButtonItems = [new UIBarButtonItem({ title: 'Done' })];

console.log(page.navigationItem instanceof UINavigationItem);
console.log(page.navigationItem === page.navigationItem);
console.log(page.navigationItem.title);
```

**Result**: The console prints `true`, `true`, `Settings` in order. After the view controller is pushed onto a navigation stack, the center of the navigation bar shows "Settings", with a line of small text "12 items" below, and "Done" on the right.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `vc.navigationItem.rightBarButtonItems = @[a, b]` | `vc.navigationItem.rightBarButtonItems = [a, b]` |
| `vc.navigationItem.rightBarButtonItem = a` | `vc.navigationItem.rightBarButtonItems = [a]` |
| `vc.navigationItem.titleView = v` | `vc.navigationItem.titleView = v` |
| `vc.navigationItem.backButtonTitle = @"Back"` | `vc.navigationItem.backButtonTitle = 'Back'` |

## See also

- [Putting buttons and a title in the navigation bar](../guides/bar-buttons.md)
- [`UIBarButtonItem`](ui-bar-button-item.md): the buttons on either side
- [`UIViewController`](ui-view-controller.md): the view controller; `title` and `navigationItem` are on it
- [`UINavigationController`](ui-navigation-controller.md): shows the navigation bar; push, pop, swipe back
