---
type: reference
native: UITabBarController
status: partial
---

# `UITabBarController`

**`UITabBarController`** represents an interface with a tab bar, called a tab bar controller. It is itself a view controller ([`UIViewController`](ui-view-controller.md)) and manages a group of view controllers: a row of tabs at the bottom of the screen, called the **tab bar**, with one view controller per tab; whichever tab the user taps, the screen shows that view controller. Main interfaces such as "Home, Market, Me" use it.

The system provides the tab bar and the switching when a tab is tapped. Your code does not need to listen for taps or swap view controllers itself.

The title, icon, and badge shown on each tab are determined by the corresponding view controller, set on its [`tabBarItem`](ui-view-controller/tabbaritem.md), of type [`UITabBarItem`](ui-tab-bar-item.md). The tab bar itself is a [`UITabBar`](ui-tab-bar.md), read from [`tabBar`](ui-tab-bar-controller/tabbar.md), and used to change colors.

It is a view controller, so it has all the members of `UIViewController`: it can be a window's root view controller and can be presented modally.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIViewController`](ui-view-controller.md) → `UITabBarController`

For how to make a set of tabs, add badges, and put navigation stacks in tabs, see the guide [Building bottom tabs](../guides/tabs.md).

## Constructor

[`UITabBarController()`](ui-tab-bar-controller/constructor.md)

Creates a tab bar controller with no view controllers.

## Instance properties

Also inherits the properties of [`UIViewController`](ui-view-controller.md).

| Property | Description |
| --- | --- |
| [`viewControllers`](ui-tab-bar-controller/viewcontrollers.md) | The view controllers, in the left-to-right order of the tabs |
| [`selectedIndex`](ui-tab-bar-controller/selectedindex.md) | Which one is selected, counting from 0 |
| [`selectedViewController`](ui-tab-bar-controller/selectedviewcontroller.md) | The selected view controller |
| [`tabBar`](ui-tab-bar-controller/tabbar.md) <small>read-only</small> | The row of tabs |
| [`isTabBarHidden`](ui-tab-bar-controller/istabbarhidden.md) | Whether the tab bar is hidden |
| [`tabBarMinimizeBehavior`](ui-tab-bar-controller/tabbarminimizebehavior.md) | Whether the tab bar shrinks to a small strip when content scrolls |

## Instance methods

Also inherits the methods of [`UIViewController`](ui-view-controller.md).

| Method | Description |
| --- | --- |
| [`setViewControllers()`](ui-tab-bar-controller/setviewcontrollers.md) | Replaces all view controllers, optionally animated |
| [`setTabBarHidden()`](ui-tab-bar-controller/settabbarhidden.md) | Hides or shows the tab bar, optionally animated |

## Events

| Event | When it fires |
| --- | --- |
| [`tabselect`](ui-tab-bar-controller/tabselect-event.md) | The user tapped a tab. Does not fire when code switches tabs |
| [`beforedismiss`](ui-view-controller/beforedismiss-event.md), [`dismiss`](ui-view-controller/dismiss-event.md), [`dismissattempt`](ui-view-controller/dismissattempt-event.md) | Inherited from [`UIViewController`](ui-view-controller.md): dismissal events when presented modally |
| [`beforeappear`](ui-view-controller/beforeappear-event.md), [`appear`](ui-view-controller/appear-event.md), [`beforedisappear`](ui-view-controller/beforedisappear-event.md), [`disappear`](ui-view-controller/disappear-event.md) | Inherited from [`UIViewController`](ui-view-controller.md): appearing and disappearing |
| [`traitchange`](ui-view-controller/traitchange-event.md) | Inherited from [`UIViewController`](ui-view-controller.md): the traits changed |

Listening for other names does not throw: they are treated as custom events and fire only when you dispatch them yourself with `dispatchEvent()`.

## View controllers are not destroyed when switching tabs

The tab bar controller keeps every view controller in `viewControllers`. Once handed over, you do not need to keep them yourself; as long as they are in `viewControllers` they are not reclaimed, whether or not they are currently selected. The acceptance tests verify this: after putting them in and dropping the references to them, reading them back from `tabs.viewControllers` returns the same objects, with the data attached to them still there.

So when the user switches from one tab to another, the view controller left behind stays in memory, with its views, data, and event listeners unchanged. Switching back shows the same view controller object. Timers and network polling running on a view controller keep running after switching away; the tab bar controller does not stop them.

Once a view controller is replaced out of `viewControllers`, the tab bar controller no longer keeps it. If nothing else in your code keeps it, it is reclaimed (verified in the acceptance tests).

## Knowing when the selection changes

The selected tab can change in two ways, with different notifications:

| Who changed it | Whether `tabselect` fires |
| --- | --- |
| The user tapped a tab | Fires. The event object's `viewController` is the view controller tapped |
| Code wrote `selectedIndex` or `selectedViewController` | Does not fire (measured: two consecutive writes, neither received) |

When the event fires, the switch has already happened; you cannot use it to prevent the switch.

## View controllers determine how tabs look

`UITabBarController` itself has no property like "what the second tab is called". It reads the `tabBarItem` of each view controller in `viewControllers`:

| What to change | Where to write it |
| --- | --- |
| A tab's title, icon, badge | That view controller's `tabBarItem` |
| Which tabs there are, in what order | `tabs.viewControllers` |
| Which one is selected now | `tabs.selectedIndex` |
| The colors of the whole row of tabs | `tabs.tabBar` |

When a view controller has no `tabBarItem` set, the system creates one automatically, with the view controller's `title` as its title and no icon. The tab bar looks only at the level placed directly in `viewControllers`: when that is a navigation controller, set `tabBarItem` on the navigation controller.

## Examples

### Three tabs

Starting from a blank app, make an interface with three tabs.

```js
application.addEventListener('sceneconnect', (e) => {
  /**
   * @param {string} title
   * @param {string} symbol icon name from SF Symbols
   * @param {string} color
   */
  function makePage(title, symbol, color) {
    const page = new UIViewController();
    page.view.backgroundColor = color;
    page.tabBarItem = new UITabBarItem({
      title,
      image: UIImage.systemImageNamed(symbol),
    });
    return page;
  }

  const home = makePage('Home', 'house', 'systemIndigo');
  const market = makePage('Market', 'chart.line.uptrend.xyaxis', 'systemTeal');
  const profile = makePage('Me', 'person', 'systemOrange');

  const tabs = new UITabBarController();
  tabs.viewControllers = [home, market, profile];

  const win = new UIWindow(e.scene);
  win.rootViewController = tabs;
  win.makeKeyAndVisible();

  tabs.addEventListener('tabselect', () => {
    console.log('Now on tab ' + tabs.selectedIndex);
  });
});
```

**Effect**

- Three tabs appear at the bottom of the screen: Home, Market, and Me, each with an icon.
- At first "Home" is shown, and the whole screen is indigo.
- Tapping "Market" turns the whole screen teal, and the console logs `Now on tab 1`.

This code has not been run as a whole in the simulator. How the tab bar looks is **not verified in the simulator**; reading and writing `viewControllers`, `selectedIndex`, and `tabBarItem` are checked in the acceptance tests. SF Symbols is the system's built-in icon library, accessed by name; see [`UIImage`](ui-image.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UITabBarController alloc] init]` | `new UITabBarController()` |
| `tabs.viewControllers = @[a, b, c]` | `tabs.viewControllers = [a, b, c]` |
| `[tabs setViewControllers:@[a, b] animated:YES]` | `tabs.setViewControllers([a, b], { animated: true })` |
| `tabs.selectedIndex = 1` | `tabs.selectedIndex = 1` |
| `tabs.selectedIndex == NSNotFound` | `tabs.selectedIndex === -1` |
| `tabs.selectedViewController` | `tabs.selectedViewController` |
| `tabs.tabBar.tintColor = UIColor.systemPinkColor` | `tabs.tabBar.tintColor = 'systemPink'` |
| `tabs.tabBarHidden = YES` | `tabs.isTabBarHidden = true` |
| `[tabs setTabBarHidden:YES animated:YES]` | `tabs.setTabBarHidden(true, { animated: true })` |
| `tabs.tabBarMinimizeBehavior = UITabBarMinimizeBehaviorOnScrollDown` | `tabs.tabBarMinimizeBehavior = 'onScrollDown'` |
| `- tabBarController:didSelectViewController:` | `tabs.addEventListener('tabselect', …)` |
| `vc.tabBarItem.badgeValue = @"3"` | `vc.tabBarItem.badgeValue = '3'` |
| `vc.tabBarController` | `vc.tabBarController` |

## See also

- [Building bottom tabs](../guides/tabs.md): badges, switching from code, navigation stacks in each tab, colors, hiding the tab bar
- [`UITabBarItem`](ui-tab-bar-item.md): a single tab
- [`UITabBar`](ui-tab-bar.md): the tab bar itself
- [`UIViewController`](ui-view-controller.md): view controllers. `tabBarItem` and `tabBarController` are on it; to draw your own row of tabs, use its parent and child view controllers
- [`UINavigationController`](ui-navigation-controller.md): each tab often holds a navigation stack
- [`UIWindow`](ui-window.md): where `rootViewController` is set
