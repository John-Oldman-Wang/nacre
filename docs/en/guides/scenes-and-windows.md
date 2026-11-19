# Creating windows and handling scenes

This guide covers where an app's interface begins: waiting for the system to hand over a scene ([`UIWindowScene`](../api/ui-window-scene.md)), creating a window ([`UIWindow`](../api/ui-window.md)) on the scene, and what to do with the interface when the system destroys a scene and connects it again.

## Recommended approach

- **Put all interface-building code in the [`sceneconnect`](../api/application/sceneconnect-event.md) callback.** The scene doesn't exist yet when `main.js` runs. At the top level, do things that don't depend on a scene: register listeners, prepare data, send network requests.
- **Don't store the scene, window, or view controllers outside the `sceneconnect` callback.** The runtime already keeps them: while the scene exists they aren't reclaimed, and when the scene is destroyed they are reclaimed with it. Anything stored outside isn't reclaimed, even though it is no longer displayed.
- **What you should store is data.** Keep "what the user is looking at" as data outside the callback, and rebuild the interface from that data on every `sceneconnect`. This has two benefits: when the system destroys a scene, the memory the interface used really is returned, and the less memory the app uses in the background, the less likely the system is to terminate the whole app; and the first launch and scene rebuilding run the same code, so you don't need to distinguish "this is the first time" from "this is coming back".
- **The code in the callback must be able to run more than once.** After the system destroys a scene, it creates a new one and fires `sceneconnect` again.

```js
// Keep the interface state as data. It survives when the scene is destroyed
const state = { title: 'Home', visits: 0 };

/** @param {{ title: string, visits: number }} s */
function buildPage(s) {
  const page = new UIViewController();
  page.title = s.title;
  page.view.backgroundColor = 'systemBackground';
  return page;
}

application.addEventListener('sceneconnect', (e) => {
  state.visits += 1;
  const win = new UIWindow(e.scene);
  win.rootViewController = buildPage(state);
  win.makeKeyAndVisible();
});
```

**Effect**: The view controller is displayed after the app launches. Each time the scene is later destroyed and rebuilt, this callback runs again, rebuilds the interface from the data in `state`, and increments `state.visits`.

When rebuilding a view controller is very costly, you can store the view controller object outside the callback and put it into the new window after the scene is rebuilt — for example, when it contains a loaded web page, or a long form the user has half filled in. The cost is that this view controller and all its views keep occupying memory. Whether an old view controller displays correctly after being put into a new window is **not verified in the simulator**.

## The first window

Starting from a blank app, make a window and a view controller with a background color appear on screen. Every app starts with these lines.

```js
// 1. Wait for the system to hand over the scene
application.addEventListener('sceneconnect', (e) => {
  // 2. Create a window in this scene
  const win = new UIWindow(e.scene);

  // 3. Create a view controller
  const page = new UIViewController();

  // 4. Give the view controller's view a background color
  page.view.backgroundColor = 'systemBackground';

  // 5. Make it the window's root view controller
  win.rootViewController = page;

  // 6. Show the window
  win.makeKeyAndVisible();
});
```

**Effect**

- The screen changes from black to the system background color: white in light mode, black in dark mode.
- There is nothing else on screen. Later interface elements all go on `page.view`.

What each of the six steps does, and what happens without it:

| Step | What it does | Without it |
| --- | --- | --- |
| 1. Listen for `sceneconnect` | Gets the scene. When `main.js` starts running, no scene is connected yet, and `application.scenes` is an empty array | No scene, so no window can be created |
| 2. `new UIWindow(e.scene)` | Creates a window and puts it in the scene. The window is hidden at this point; `win.isHidden` is `true` | No window, so the following steps have no object to work with |
| 3. `new UIViewController()` | Creates a view controller. A view controller manages a full screen of content, and its `view` property is the root view of that screen | The window has no content to display |
| 4. Set `backgroundColor` | Gives the view controller's root view a background color. `'systemBackground'` is the system background color and follows dark mode; see [Colors](../api/ui-color.md) | The view controller's root view is transparent, and the screen stays black. **Not verified in the simulator** |
| 5. Set `rootViewController` | Hands the view controller to the window. The root view controller is the only entry point for the window's content; the window displays its `view` | The window has no content and the screen is black. No error. **Not verified in the simulator** |
| 6. `makeKeyAndVisible()` | Shows the window and makes it the [key window](../api/ui-window.md#key-window) | The screen is completely black, even if the first five steps are correct. No error |

> **Note:** Step 6 is the easiest to miss. Without it, the window is already in the scene and `rootViewController` reads fine, but `win.isHidden` is `true`, the screen is black, and there is no error at all.

After the callback ends, the local variables `win` and `page` no longer exist, but the window stays on screen.

## Why wait for `sceneconnect`

The app launches in this order: run `main.js` → the system creates a scene and hands it to the app. So reading `application.scenes` at the top level of `main.js` gives an empty array.

```js
console.log(application.scenes.length);

application.addEventListener('sceneconnect', (e) => {
  console.log(application.scenes[0] === e.scene);
});
```

**Effect**: The first line prints `0`. After the scene connects, the callback prints `true`.

A listener registered at the top level of `main.js` is always in time to receive this event. Don't read `application.scenes[0]` at the top level: you get `undefined`.

## Where data goes

Where data goes decides how long it is kept:

| Where | After the scene is destroyed | After the system terminates the app |
| --- | --- | --- |
| JS variables outside the callback | Kept | Gone |
| [`scene.session.userInfo`](../api/ui-scene-session/userinfo.md) | Kept | Kept. **Not verified in the simulator** |
| [`application.storage`](../api/storage.md) | Kept | Kept |

## Remembering what this scene was showing last time

Each scene has a session object, [`UISceneSession`](../api/ui-scene-session.md), obtained through `scene.session`. Its `userInfo` holds the app's own data.

```js
application.addEventListener('sceneconnect', (e) => {
  const session = e.scene.session;

  // Read the data stored last time
  const info = session.userInfo;
  if (info && info.kind === 'mailDetail') {
    console.log('Was viewing mail', info.mailId);
  } else {
    console.log('No record; showing the home view');
  }

  // Store this time's data
  session.userInfo = { kind: 'mailDetail', mailId: 42 };
});
```

**Effect**: After writing, reading `session.userInfo` in the same run gives what was written. Whether `userInfo` survives the scene disconnecting and reconnecting, or the app being terminated and reopened, is **not verified in the simulator**.

## Knowing when the app goes to the background and returns to the foreground

"Going to the background" means the user goes to the Home Screen or switches to another app. The interface is no longer displayed, and the system may suspend the app's code soon after.

```js
application.addEventListener('sceneconnect', (e) => {
  const scene = e.scene;
  scene.addEventListener('inactive', () => {
    console.log('About to leave the foreground; saving data');
  });
  scene.addEventListener('background', () => {
    console.log('Now in the background');
  });
  scene.addEventListener('foreground', () => {
    console.log('About to return to the foreground');
  });
  scene.addEventListener('active', () => {
    console.log('Interactive now; refreshing data');
  });
});
```

**Effect**

- When the user goes to the Home Screen, the console first prints `About to leave the foreground; saving data`, then `Now in the background`.
- When the user switches back to the app from the Home Screen, the console first prints `About to return to the foreground`, then `Interactive now; refreshing data`.

The order within each pair, on the scene, is **not verified in the simulator**. `inactive` doesn't fire only when going to the background: temporary interruptions such as pulling down Notification Center or an incoming call also make the scene lose active status, in which case there is only `inactive` and no `background` (**not verified in the simulator**). For the four events, see [`UIWindowScene`](../api/ui-window-scene.md#events).

## Running code when the window appears

Listen for the window's events. The listeners must be registered before `makeKeyAndVisible()`.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  win.rootViewController = new UIViewController();

  win.addEventListener('becomevisible', () => {
    console.log('Window shown, isHidden =', win.isHidden);
  });
  win.addEventListener('becomekey', () => {
    console.log('Window became the key window, isKeyWindow =', win.isKeyWindow);
  });

  win.makeKeyAndVisible();
});
```

**Effect**

- The console first prints `Window shown, isHidden = false`.
- Then it prints `Window became the key window, isKeyWindow = true`.

> **Note:** If you call `makeKeyAndVisible()` before registering the listeners, the two events have already fired, and the callbacks don't run.

## Creating a window first and putting it in a scene later

Don't pass a scene at construction; assign [`windowScene`](../api/ui-window/windowscene.md) later.

```js
application.addEventListener('sceneconnect', (e) => {
  const later = new UIWindow();
  console.log(later.windowScene);

  later.windowScene = e.scene;
  console.log(later.windowScene === e.scene);
});
```

**Effect**

- The console prints `null`, then `true`.
- Before `windowScene` is assigned, `later` is just a JS object, and accessing any member other than `windowScene` throws `TypeError`; see [`UIWindow()`](../api/ui-window/constructor.md).
- After assignment, `later` is used the same way as a window created with `new UIWindow(e.scene)`.

`new UIWindow(e.scene)` is recommended: in the `sceneconnect` callback the scene is always available.

## Replacing the whole view controller in a window

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const login = new UIViewController();
  win.rootViewController = login;
  win.makeKeyAndVisible();

  // After sign-in completes
  const main = new UIViewController();
  main.view.backgroundColor = 'systemBlue';
  win.rootViewController = main;
});
```

**Effect**: The screen content switches from the original view controller to the new blue one, with no transition animation. **Not verified in the simulator.**

The original root view controller is no longer kept by the window and is reclaimed when no variable holds it. Replacing the root view controller suits switching the whole interface, such as going from the sign-in interface to the main interface. For navigation with a back button, use a [`UINavigationController`](../api/ui-navigation-controller.md) as the root view controller; to temporarily cover the screen with a view controller, use [Presenting a modal view controller](modal-pages.md).

## Hiding a window

A window is a view; use the view's `isHidden` property.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  win.rootViewController = new UIViewController();
  win.makeKeyAndVisible();

  win.addEventListener('becomehidden', () => {
    console.log('Window hidden');
  });
  win.isHidden = true;
});
```

**Effect**: The window and all its content disappear from the screen, and the console prints `Window hidden`. Setting `isHidden` back to `false` shows it again and fires `becomevisible`. **This example is not verified in the simulator.**

## Showing one window above another

When you need a layer of content that always sits above every view controller, including modally presented ones — such as a global banner — create another window in the same scene. The one with the larger [`windowLevel`](../api/ui-window/windowlevel.md) is shown on top.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  win.rootViewController = new UIViewController();
  win.makeKeyAndVisible();

  const overlay = new UIWindow(e.scene);
  const overlayPage = new UIViewController();
  overlay.rootViewController = overlayPage;
  overlay.windowLevel = 1;
  overlay.isHidden = false;
});
```

**Effect**

- `overlay` is shown above `win`. `win`'s `windowLevel` is the default `0`.
- `overlayPage.view` has no background color, so `win` below shows through it.
- This uses `isHidden = false` rather than `makeKeyAndVisible()`, so `win` remains the key window.

**This example is not verified in the simulator.**

A property on the scene listing all its windows isn't provided yet. Windows are all created by the app's code; if you need them, record them yourself when creating them. Not recording them doesn't make the windows disappear.

## See also

- [`UIWindowScene`](../api/ui-window-scene.md): all members of the scene
- [`UIWindow`](../api/ui-window.md): all members of the window
- [`UISceneSession`](../api/ui-scene-session.md): the scene's session
- [`application`](../api/application.md): the `sceneconnect` / `scenedisconnect` events
- [Building a view controller](pages.md)
