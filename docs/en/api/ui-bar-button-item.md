---
type: reference
native: UIBarButtonItem
status: partial
---

# `UIBarButtonItem`

**`UIBarButtonItem`** represents a button on the navigation bar. The navigation bar is the strip [`UINavigationController`](ui-navigation-controller.md) draws at the top of the screen, with a centered title, a back button on the left, and buttons on the left and right. When the user taps a button, the button fires the [`click`](ui-bar-button-item/click-event.md) event.

Three classes describe what's on the navigation bar:

- [`UINavigationItem`](ui-navigation-item.md) represents a view controller's configuration on the navigation bar: the title, subtitle, back button text, and which buttons are on the left and right. Each view controller comes with one, read from its [`navigationItem`](ui-view-controller/navigationitem.md).
- `UIBarButtonItem` (this page) represents one of the buttons.
- [`UIBarItem`](ui-bar-item.md) is the common parent class of `UIBarButtonItem` and [`UITabBarItem`](ui-tab-bar-item.md), providing four properties: `title`, `image`, `isEnabled`, and `tag`.

A button is displayed only after it's put in the view controller's [`rightBarButtonItems`](ui-navigation-item/rightbarbuttonitems.md) or [`leftBarButtonItems`](ui-navigation-item/leftbarbuttonitems.md).

**Inheritance**: `EventTarget` → `NSObject` → [`UIBarItem`](ui-bar-item.md) → `UIBarButtonItem`

For how to put buttons on the navigation bar and change the title and back button, see the guide [Putting buttons and a title in the navigation bar](../guides/bar-buttons.md).

## Constructor

[`UIBarButtonItem()`](ui-bar-button-item/constructor.md)

Creates a button. You can give the text, icon, and style together, or a view to use in place of the button.

## Static methods

| Method | Description |
| --- | --- |
| [`UIBarButtonItem.systemItem()`](ui-bar-button-item/systemitem.md) | Creates a system-provided button, such as add, share, or done |
| [`UIBarButtonItem.flexibleSpace()`](ui-bar-button-item/flexiblespace.md) | Creates a blank space whose width stretches automatically |
| [`UIBarButtonItem.fixedSpace()`](ui-bar-button-item/fixedspace.md) | Creates a fixed-width blank space |

## Instance properties

Also inherits properties from [`UIBarItem`](ui-bar-item.md): [`title`](ui-bar-item/title.md), [`image`](ui-bar-item/image.md), [`isEnabled`](ui-bar-item/isenabled.md), [`tag`](ui-bar-item/tag.md).

| Property | Description |
| --- | --- |
| [`style`](ui-bar-button-item/style.md) | The style: plain, or emphasizing the view controller's primary action |
| [`width`](ui-bar-button-item/width.md) | The width. Only meaningful for fixed-width spaces |
| [`isHidden`](ui-bar-button-item/ishidden.md) | Temporarily not displayed |
| [`customView`](ui-bar-button-item/customview.md) | A view used in place of the system-drawn button |

## Events

| Event | When it fires |
| --- | --- |
| [`click`](ui-bar-button-item/click-event.md) | The user tapped this button |

## A button isn't a view

A `UIBarButtonItem` only describes "a button goes here, with this text and this style"; the system draws the button from that description. It isn't a [`UIView`](ui-view.md):

- It has no `frame` or `backgroundColor`, and you can't `addSubview()` to it. The system arranges the button's position and size.
- It has none of [`UIControl`](ui-control.md)'s touch events, only `click`.

To put something you draw entirely yourself on the navigation bar, give a view to [`customView`](ui-bar-button-item/customview.md).

## Examples

### "Save" at the top right of an edit screen

Starting from a blank app: the home view controller has a button that opens the "Edit" view controller; the "Edit" navigation bar has a "Save" button on the right, which prints a line to the console and returns to the home view controller when tapped.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const home = new UIViewController();
  home.title = 'Home';
  home.view.backgroundColor = 'systemBackground';
  const nav = new UINavigationController(home);
  win.rootViewController = nav;
  win.makeKeyAndVisible();

  function makeEditor() {
    const page = new UIViewController();
    page.title = 'Edit';
    page.view.backgroundColor = 'systemBackground';
    const save = new UIBarButtonItem({ title: 'Save', style: 'prominent' });
    save.addEventListener('click', () => {
      console.log('Saved');
      nav.popViewController({ animated: true });
    });
    page.navigationItem.rightBarButtonItems = [save];
    return page;
  }

  const open = UIButton.buttonWithType('system');
  open.setTitle('Edit', { forState: ['normal'] });
  open.translatesAutoresizingMaskIntoConstraints = false;
  home.view.addSubview(open);
  NSLayoutConstraint.activateConstraints([
    open.centerXAnchor.constraintEqualToAnchor(home.view.centerXAnchor),
    open.centerYAnchor.constraintEqualToAnchor(home.view.centerYAnchor),
  ]);
  open.addEventListener('click', () => {
    nav.pushViewController(makeEditor(), { animated: true });
  });
});
```

**Effect**

- The home navigation bar shows "Home" in the center, with no buttons on either side.
- Tapping "Edit" opens the edit view controller. The navigation bar shows "Edit" in the center, a back button labeled "Home" on the left, and a "Save" button on the right.
- Tapping "Save" prints `Saved` to the console, and the screen returns to the home view controller.

That buttons on the right of the navigation bar display and can be tapped has been verified with real taps in the acceptance tests. How the `'prominent'` style looks is **not verified in the simulator**. This code hasn't been run as a whole in the simulator; every API it uses has been run in the acceptance tests.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UIBarButtonItem alloc] initWithTitle:@"Save" style:UIBarButtonItemStyleProminent target:self action:@selector(save)]` | `new UIBarButtonItem({ title: 'Save', style: 'prominent' })`, then `addEventListener('click', save)` |
| `[[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemAdd target:… action:…]` | `UIBarButtonItem.systemItem('add')` |
| `[[UIBarButtonItem alloc] initWithCustomView:v]` | `new UIBarButtonItem({ customView: v })` |
| `[UIBarButtonItem flexibleSpaceItem]` | `UIBarButtonItem.flexibleSpace()` |
| `[UIBarButtonItem fixedSpaceItemOfWidth:20]` | `UIBarButtonItem.fixedSpace(20)` |
| `item.style = UIBarButtonItemStyleDone` | `item.style = 'done'` (reads back `'prominent'`) |
| `item.enabled = NO` | `item.isEnabled = false` |
| `item.hidden = YES` | `item.isHidden = true` |
| `item.target` / `item.action` | Not exposed. Use `addEventListener()` |
| `UIBarButtonItemStyleBordered` | Not exposed. Deprecated by Apple |

## See also

- [Putting buttons and a title in the navigation bar](../guides/bar-buttons.md): buttons, icons, system-provided buttons, disabling, the back button
- [`UINavigationItem`](ui-navigation-item.md): where buttons go
- [`UIBarItem`](ui-bar-item.md): the parent class; `title`, `image`, `isEnabled`, `tag`
- [`UINavigationController`](ui-navigation-controller.md): displays the navigation bar
- [`UIButton`](ui-button.md): buttons inside a view controller. The tap event has the same name
