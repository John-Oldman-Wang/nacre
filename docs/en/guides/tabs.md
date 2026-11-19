# Building bottom tabs

This guide covers how to use the tab bar controller [`UITabBarController`](../api/ui-tab-bar-controller.md) to build a main interface with a row of tabs at the bottom of the screen, like "Home, Market, Me": setting how tabs look, adding badges, switching, and putting a navigation stack in each tab. A tab's appearance is a [`UITabBarItem`](../api/ui-tab-bar-item.md), and the tab bar itself is a [`UITabBar`](../api/ui-tab-bar.md).

## Recommended approach

- **Make the tab bar controller the window's root view controller, and put a navigation controller in each tab.** A tab usually needs to let users drill down level by level. Put [`UINavigationController`](../api/ui-navigation-controller.md)s in `viewControllers`; view controllers are pushed and popped in their own navigation stacks, and the tab bar at the bottom stays in place. For how, see [Putting a navigation stack in each tab](#putting-a-navigation-stack-in-each-tab).
- **Set a view controller's [`tabBarItem`](../api/ui-view-controller/tabbaritem.md) before handing it to the tab bar controller.** For view controllers without one, the system automatically creates a text-only tab, with no icon, from the view controller's `title`.
- **Write what needs to happen after the selection changes as one function, and call it from both places.** [`tabselect`](../api/ui-tab-bar-controller/tabselect-event.md) fires when the user taps a tab; it doesn't fire when code switches tabs. So call it once in the `tabselect` callback, and call it yourself after code writes `selectedIndex`; only then do both paths give the same result:

```js
/**
 * @param {UITabBarController} tabs
 */
function watchSelection(tabs) {
  function selectionChanged() {
    console.log('Now on tab ' + tabs.selectedIndex);
  }

  tabs.addEventListener('tabselect', selectionChanged);

  return {
    /** @param {number} index */
    select(index) {
      tabs.selectedIndex = index;
      selectionChanged();
    },
  };
}
```

**Effect**: whether the user taps a tab or code calls `select()` on the returned object, the console prints a line with the currently selected index.

- **To pause work in a view controller that's switched away from, use the view controller's own appear and disappear events.** When switching tabs, the view controller being left fires [`disappear`](../api/ui-view-controller/disappear-event.md), and the one being switched to fires [`beforeappear`](../api/ui-view-controller/beforeappear-event.md) (verified by testing). The tab bar controller doesn't stop timers and network polling for view controllers; see [Pausing refreshes when switched away](#pausing-refreshes-when-switched-away).

## First set of tabs

Starting from a blank app, build an interface with three tabs.

```js
application.addEventListener('sceneconnect', (e) => {
  /**
   * Creates a view controller and sets how it looks on the tab bar
   * @param {string} title
   * @param {string} symbol an icon name from SF Symbols
   * @param {string} color
   */
  function makePage(title, symbol, color) {
    const page = new UIViewController();
    page.view.backgroundColor = color;
    // 1. This view controller's tab: title and icon
    page.tabBarItem = new UITabBarItem({
      title,
      image: UIImage.systemImageNamed(symbol),
    });
    return page;
  }

  // 2. Three view controllers
  const home = makePage('Home', 'house', 'systemIndigo');
  const market = makePage('Market', 'chart.line.uptrend.xyaxis', 'systemTeal');
  const profile = makePage('Me', 'person', 'systemOrange');

  // 3. Hand them to UITabBarController; the order is the left-to-right order of the tabs
  const tabs = new UITabBarController();
  tabs.viewControllers = [home, market, profile];

  // 4. Make it the window's root view controller
  const win = new UIWindow(e.scene);
  win.rootViewController = tabs;
  win.makeKeyAndVisible();

  // 5. Get notified when the user taps a tab
  tabs.addEventListener('tabselect', () => {
    console.log('Now on tab ' + tabs.selectedIndex);
  });
});
```

**Effect**

- Three tabs appear at the bottom of the screen: Home, Market, Me, each with an icon.
- "Home" is shown at first, and the whole screen is indigo.
- Tapping "Market" turns the whole screen teal, and the console prints `Now on tab 1`.

This code hasn't been run as a whole in the simulator. The tab bar's appearance is **not verified in the simulator**; reading and writing `viewControllers`, `selectedIndex`, and `tabBarItem` have been checked in the acceptance tests. SF Symbols is the system's built-in icon library, from which images are fetched by name; see [`UIImage`](../api/ui-image.md).

The examples below reuse `tabs`, `home`, `market`, and `profile` from here. To try a section on its own, write these lines first:

```js
const home = new UIViewController();
const market = new UIViewController();
const profile = new UIViewController();
const tabs = new UITabBarController();
tabs.viewControllers = [home, market, profile];
```

## Adding a badge to a tab

```js
market.tabBarItem.badgeValue = '3';
```

**Effect**: a red circle with 3 in it appears at the top right of the "Market" tab. **The appearance is not verified in the simulator.**

To remove the badge, write `null`:

```js
market.tabBarItem.badgeValue = null;
```

**Effect**: the badge disappears.

## Switching to a tab in code

```js
tabs.selectedIndex = 2;
console.log(tabs.selectedViewController === profile);
```

**Effect**: the interface switches to "Me". The console prints `true`.

> **Note:** Switching in code **doesn't** fire the `tabselect` event. That event fires only when the user taps a tab (verified by testing). When you need to do the same thing in both cases, see [Recommended approach](#recommended-approach).

## Knowing when the user switched tabs

```js
tabs.addEventListener('tabselect', (ev) => {
  const event = /** @type {UITabBarControllerEvent} */ (ev);
  console.log(event.viewController === tabs.selectedViewController);
});
```

**Effect**: each time the user taps a tab, the console prints `true`. `event.viewController` is the view controller that was tapped.

## Pausing refreshes when switched away

```js
/** @type {number | undefined} */
let ticker;
market.addEventListener('beforeappear', () => {
  ticker = setInterval(() => console.log('Refreshing market data'), 1000);
});
market.addEventListener('disappear', () => {
  clearInterval(ticker);
});
```

**Effect**: while the "Market" tab is on screen, `Refreshing market data` is printed every second; it stops after switching to another tab and starts again when switching back. **This code hasn't been run as a whole in the simulator**; that these two events fire when switching tabs is verified by testing.

## Putting a navigation stack in each tab

When a tab needs to let users drill down level by level, put a [`UINavigationController`](../api/ui-navigation-controller.md) in `viewControllers` instead of the view controller itself:

```js
const list = new UIViewController();
list.title = 'List';

const nav = new UINavigationController(list);
nav.tabBarItem = new UITabBarItem({
  title: 'Market',
  image: UIImage.systemImageNamed('chart.line.uptrend.xyaxis'),
});

tabs.viewControllers = [home, nav, profile];
```

**Effect**: the middle tab has a navigation bar titled "List". When new view controllers are pushed inside it, the tab bar at the bottom stays in place. **Not verified in the simulator.**

> **Note:** In this case `tabBarItem` must be set on `nav`, not on `list`. The tab bar only looks at the level placed directly in `viewControllers`.

## Changing the color of the selected tab

```js
tabs.tabBar.tintColor = 'systemPink';
tabs.tabBar.unselectedItemTintColor = 'systemGray';
```

**Effect**: the selected tab (icon and text) is pink, and the others are gray. **The actual color effect is not verified in the simulator**; reading and writing the two properties have been checked.

For how to write colors, see [Colors](../api/ui-color.md).

## Hiding the tab bar

```js
tabs.setTabBarHidden(true, { animated: true });
```

**Effect**: the tab bar disappears with an animation. Call it again with `false` to bring it back. **The animation is not verified in the simulator.**

Without animation, write [`isTabBarHidden`](../api/ui-tab-bar-controller/istabbarhidden.md) directly:

```js
tabs.isTabBarHidden = true;
```

**Effect**: the tab bar disappears immediately.

## Minimizing the tab bar when content scrolls

```js
tabs.tabBarMinimizeBehavior = 'onScrollDown';
```

**Effect**: when content in the view controller scrolls down, the tab bar shrinks to a small strip to make room for the content; it's restored when scrolling up. **Not verified in the simulator.**

For the four values, see [`tabBarMinimizeBehavior`](../api/ui-tab-bar-controller/tabbarminimizebehavior.md).

## Replacing the set of view controllers

```js
const settings = new UIViewController();
settings.tabBarItem = new UITabBarItem({ title: 'Settings', image: UIImage.systemImageNamed('gearshape') });

tabs.setViewControllers([home, settings], { animated: true });
console.log(tabs.viewControllers.length);
console.log(market.tabBarController);
```

**Effect**: the tab bar becomes two tabs: Home and Settings. The console prints `2` and `null`. The replaced `market` no longer belongs to `tabs`.

## See also

- [`UITabBarController`](../api/ui-tab-bar-controller.md): all members of the tab bar controller
- [`UITabBarItem`](../api/ui-tab-bar-item.md), [`UITabBar`](../api/ui-tab-bar.md)
- [Navigating between view controllers](navigation.md): navigation stacks in tabs
- [Building a view controller](pages.md): view controller appear and disappear events
