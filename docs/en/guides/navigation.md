# Navigating between view controllers

This guide covers how to use the navigation controller [`UINavigationController`](../api/ui-navigation-controller.md) to build interfaces that go in level by level and come back level by level, like "list → detail → one level deeper": pushing, going back, knowing which view controller you're on, cleaning up when a view controller leaves, and navigating by path. For the title and buttons on the navigation bar, see [Putting buttons and a title in the navigation bar](bar-buttons.md).

## Recommended approach

- **Create a new view controller each time you enter; don't keep view controller objects.** Write "build a view controller" as a function and call it on every push. What you keep is data (which record is being viewed, what has been filled into a form), not view controllers. This has two benefits: after the user goes back, the memory used by the view controller that left is returned to the system; and the same kind of view controller can appear in the stack more than once — in "detail → related → another detail", the two detail view controllers are two objects that don't affect each other. When rebuilding a view controller is very expensive (it holds a loaded web page, or a long half-filled form), you can keep the view controller object in a variable and push the same object next time, at the cost of it occupying memory the whole time.
- **`nav.viewControllers` is always the source of truth.** When the user taps back or swipes back, your code isn't involved. Any "current path" you keep separately must be realigned with the real stack in [`show`](../api/ui-navigation-controller/show-event.md).
- **Things to stop while a view controller is not visible go in that view controller's own [`disappear`](../api/ui-view-controller/disappear-event.md); cleanup that should happen only when a view controller leaves the stack goes in `show`.** A view controller fires `disappear` both when it is covered by the next one and when it is popped off the stack, and the event can't tell which. For how to write it, see [Cleaning up when a view controller leaves the stack](#cleaning-up-when-a-view-controller-leaves-the-stack).

```js
/** @param {number} id */
function makeDetail(id) {
  const page = new UIViewController();
  page.title = 'Order ' + id;
  page.view.backgroundColor = 'systemBackground';
  return page;
}

/**
 * @param {UINavigationController} stack
 * @param {number} id
 */
function openDetail(stack, id) {
  stack.pushViewController(makeDetail(id), { animated: true });
}
```

**Effect**: Each call to `openDetail()` pushes a new detail view controller. After the user goes back, that view controller is collected.

## The first navigation stack

Starting from a blank app: create a navigation controller, put a button on the home view controller, tap the button to go to a detail view controller, and print a line to the console each time a transition finishes.

```js
application.addEventListener('sceneconnect', (e) => {
  // 1. Create the window and the home view controller
  const win = new UIWindow(e.scene);
  const home = new UIViewController();
  home.title = 'Home';
  home.view.backgroundColor = 'systemBackground';

  // 2. Create the navigation controller with home at the bottom of the stack, and make it the window's root view controller
  const nav = new UINavigationController(home);
  win.rootViewController = nav;
  win.makeKeyAndVisible();

  // 3. Put a button in the center of home; tapping it pushes the detail view controller
  const button = UIButton.buttonWithType('system');
  button.setTitle('View details', { forState: ['normal'] });
  button.translatesAutoresizingMaskIntoConstraints = false;
  home.view.addSubview(button);
  NSLayoutConstraint.activateConstraints([
    button.centerXAnchor.constraintEqualToAnchor(home.view.centerXAnchor),
    button.centerYAnchor.constraintEqualToAnchor(home.view.centerYAnchor),
  ]);

  button.addEventListener('click', () => {
    const detail = new UIViewController();
    detail.title = 'Details';
    detail.view.backgroundColor = 'systemTeal';
    nav.pushViewController(detail, { animated: true });
  });

  // 4. Get notified each time a transition finishes. Tapping back and swiping back also end up here
  nav.addEventListener('show', (event) => {
    console.log('Now showing', event.viewController.title, ', stack has', nav.viewControllers.length, 'view controllers');
  });
});
```

**Effect**

- A navigation bar runs across the top of the screen with "Home" in the middle. A blue "View details" is in the center of the view controller.
- Tap "View details" and an animation switches to the teal detail view controller. The navigation bar's title changes to "Details", and a back button labeled "Home" appears on the left. The console prints `Now showing Details , stack has 2 view controllers`.
- Tap the back button, or swipe right from the left edge of the view controller, to return to the home view controller. The console prints `Now showing Home , stack has 1 view controllers`.

The firing of `show` and the stack counts on push, back-button tap, and swipe back are measured. This code has not been run as a whole in the simulator; every API it uses has been run in the acceptance tests.

The examples below reuse `nav` and `home` from here. To try a section on its own, start with these lines:

```js
const home = new UIViewController();
const nav = new UINavigationController(home);
```

## Going to the next view controller

```js
const detail = new UIViewController();
detail.title = 'Details';
nav.pushViewController(detail, { animated: true });
```

**Effect**: The screen switches to `detail` with an animation.

When `animated` is omitted it is `false`, and the view controller switches directly, without animation. After a push you don't need to keep `detail`; see [Who keeps the view controllers in the stack alive](../api/ui-navigation-controller.md#who-keeps-the-view-controllers-in-the-stack-alive).

## Going back from code

```js
const popped = nav.popViewController({ animated: true });
console.log(popped === null ? 'already at the bottom' : popped.title);
```

**Effect**: When the stack holds more than one view controller, the screen goes back to the previous one and the console prints the popped view controller's title. When the stack holds only one, nothing happens and the console prints `already at the bottom`.

There are two methods for going back several levels at once:

```js
// Go back to the bottom of the stack
nav.popToRootViewController({ animated: true });

// Go back to a specific view controller
nav.popToViewController(home, { animated: true });
```

**Effect**: The screen goes back to the bottom view controller (in this example the two lines have the same effect, because `home` is the bottom). All the view controllers in between are popped at once.

## Cleaning up when a view controller leaves the stack

Some cleanup should happen only after a view controller leaves the stack, such as releasing resources it holds. The approach is to register a table of "view controller → cleanup function" and, on every `show`, check which view controllers in the table are no longer in the stack. If you only want to pause a timer while a view controller isn't visible, the view controller's own [`disappear`](../api/ui-view-controller/disappear-event.md) is simpler.

```js
/** @type {Map<UIViewController, () => void>} */
const cleanups = new Map();

nav.addEventListener('show', () => {
  const stack = nav.viewControllers;
  for (const [page, cleanup] of cleanups) {
    if (!stack.includes(page)) {
      cleanups.delete(page);
      cleanup();
    }
  }
});

function openTicker() {
  const page = new UIViewController();
  page.title = 'Quotes';
  page.view.backgroundColor = 'systemBackground';
  const timer = setInterval(() => console.log('refreshing quotes'), 1000);
  cleanups.set(page, () => clearInterval(timer));
  nav.pushViewController(page, { animated: true });
}

openTicker();
```

**Effect**: After entering the "Quotes" view controller, the console prints `refreshing quotes` every second. After the user taps back, swipes back, or code pops it, the output stops.

- The table holds the view controller object, so the view controller isn't collected before its cleanup function runs. After cleanup it is no longer in the table and can be collected.
- This pattern only handles "leaving the stack". When the view controller is covered by a newly pushed one, it is still in the stack and the cleanup function doesn't run. To pause while it is covered, compare `event.viewController` with this view controller in `show`.

This code has not been run as a whole in the simulator. The two things it relies on are measured: `show` fires when the user goes back, and `nav.viewControllers` read in the callback is the stack after going back.

## Navigating by path

Keep a table of "path → function that builds the view controller", and look up the path when navigating. The record of paths follows `nav.viewControllers`.

```js
/** @type {Record<string, () => UIViewController>} */
const routes = {
  '/settings': () => {
    const page = new UIViewController();
    page.title = 'Settings';
    page.view.backgroundColor = 'systemBackground';
    return page;
  },
  '/about': () => {
    const page = new UIViewController();
    page.title = 'About';
    page.view.backgroundColor = 'systemBackground';
    return page;
  },
};

// The path for each view controller in the stack. The bottom is '/'
const paths = ['/'];

/** @param {string} path */
function go(path) {
  const make = routes[path];
  if (!make) throw new Error('no route matches ' + path);
  paths.push(path);
  nav.pushViewController(make(), { animated: true });
}

// Tapping back and swiping back don't go through go(), so realign with the real stack here
nav.addEventListener('show', () => {
  while (paths.length > nav.viewControllers.length) paths.pop();
  console.log('current path', paths[paths.length - 1]);
});

go('/settings');
```

**Effect**: The screen goes to the "Settings" view controller, and the console prints `current path /settings`. After the user goes back, it prints `current path /`.

The acceptance tests include a version with the same structure plus path parameters (`acceptance/src/router.js`). It walks through "open the list → open a detail → swipe back" with real taps and swipes, and the paths and the stack count stay consistent throughout.

## Putting an already-shown view controller into a navigation stack

A view controller that is currently a window's root view controller can't be handed to a navigation controller directly. First make an empty navigation controller the root view controller, then push the original view controller.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const shown = new UIViewController();
  shown.view.backgroundColor = 'systemBackground';
  win.rootViewController = shown;
  win.makeKeyAndVisible();

  // Later, wrap it in a navigation stack
  const wrapper = new UINavigationController();
  win.rootViewController = wrapper;
  wrapper.pushViewController(shown, { animated: false });

  console.log(wrapper.topViewController === shown);
});
```

**Effect**: `shown` becomes the first view controller in the navigation stack, and a navigation bar appears at the top of the screen. The console prints `true`. Both steps run in the same piece of code, so no blank frame appears on screen.

> **Note:** Doing it in the reverse order throws. While `shown` is still the window's root view controller, `new UINavigationController(shown)` throws `TypeError: cannot construct UINavigationController with these arguments`, and `pushViewController(shown)` throws a `TypeError` starting with `pushViewController: `. In both cases the window and the stack stay as they are.

## Hiding the navigation bar

```js
nav.isNavigationBarHidden = true;
```

**Effect**: The navigation bar disappears immediately, and the view controller's content fills the space where the navigation bar was.

To hide or show it with an animation:

```js
nav.setNavigationBarHidden(false, { animated: true });
```

**Effect**: The navigation bar comes back with an animation. **The animation is not verified in the simulator.**

Once the navigation bar is hidden there is no back button. Whether swipe back still works then is **not verified in the simulator**.

## Hiding the navigation bar on the home view controller and showing it elsewhere

[`beforeshow`](../api/ui-navigation-controller/beforeshow-event.md) fires as the transition begins; the event object's `viewController` is the view controller about to be shown.

```js
nav.addEventListener('beforeshow', (event) => {
  nav.setNavigationBarHidden(event.viewController === home, { animated: true });
});
```

**Effect**: The home view controller has no navigation bar; the navigation bar appears when you go to another view controller and disappears again when you return home. The acceptance tests' interface does exactly this.

> **Note:** To tell which view controller is about to be shown, use `event.viewController`, not `nav.topViewController`.

## Replacing the whole stack at once

```js
const pageA = new UIViewController();
const pageB = new UIViewController();
pageA.title = 'A';
pageB.title = 'B';

nav.setViewControllers([home, pageA, pageB], { animated: true });
console.log(nav.viewControllers.length, nav.topViewController === pageB);
```

**Effect**: The stack becomes three view controllers, home, A, and B, and the screen shows B. The console prints `3 true`.

When you don't need an animation, you can also assign the property directly:

```js
nav.viewControllers = [home];
```

**Effect**: Only the home view controller is left in the stack, and the screen shows it immediately.

## See also

- [`UINavigationController`](../api/ui-navigation-controller.md): all members of the navigation controller, and the conditions for swipe back
- [Putting buttons and a title in the navigation bar](bar-buttons.md)
- [Building a view controller](pages.md): the appear and disappear events of a view controller
- [`UITabBarController`](../api/ui-tab-bar-controller.md): each tab often holds a navigation controller
