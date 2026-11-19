# Handling the app lifecycle

This guide shows where code goes as the app moves from launch to the background, back to the foreground, and through low memory: building the UI, saving data, releasing caches, keeping the screen on, and passing messages between parts of the app. Everything used here is on the global object [`application`](../api/application.md). For details on creating windows, see [Creating windows and handling scenes](scenes-and-windows.md).

## Recommended approach

- **Put the code that builds the UI in the [`sceneconnect`](../api/application/sceneconnect-event.md) callback, and register the listener at the top level of `main.js`.** The runtime finishes executing all of `main.js` before the system creates a scene. Events are not replayed: if you register only after some Promise fulfills, you may already have missed it.
- **Finish saving data you need to keep in [`background`](../api/application/background-event.md).** Write it to [`application.storage`](../api/storage.md), whose writes are synchronous. Don't wait for [`beforeterminate`](../api/application/beforeterminate-event.md): it isn't necessarily fired when the app is terminated in the background.
- **On [`memorywarning`](../api/application/memorywarning-event.md), drop data you can get again.** The runtime doesn't release anything on the app's behalf.
- **Keep app-wide shared data in your module's own variables, not on `application`.** `application` is an ordinary JS object and you can add properties to it, but the type definitions don't include them, so every read and write needs a cast; and `application` exists for as long as the app runs, so anything attached to it is never garbage-collected. In particular, don't attach scenes, windows, or view controllers to it.

## First app

Start from a blank app: print the app's information, and once the system is ready, create the window and view controller.

```js
// 1. Read the app's information. These are readable as soon as the script starts
console.log('Bundle ID', application.bundleIdentifier);
console.log('Version', application.version, 'Build', application.build);

// 2. There is no scene yet, so the UI can't be built yet
console.log('Scene count', application.scenes.length);

// 3. The system fires sceneconnect once the scene is ready. UI code goes here
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  console.log('UI built, scene count', application.scenes.length);
});
```

**Effect**

- The console first prints three lines. For an app with bundle ID `com.example.shop`:
  - `Bundle ID com.example.shop`
  - `Version 0.1.0 Build 1`
  - `Scene count 0`
- Then the screen changes from black to the system background color: white in light mode, black in dark mode.
- The console prints `UI built, scene count 1`.

This code has not been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

The callback may run more than once: when the system destroys a scene and recreates it, `sceneconnect` fires again. Each time, the callback builds the UI from scratch with `e.scene`; see [Create windows and handle scenes](scenes-and-windows.md#recommended-approach).

## Read the app's name and version

```js
console.log(application.bundleIdentifier);
console.log(application.version);
console.log(application.build);
console.log(application.info.CFBundleDisplayName);
```

**Effect**: The console prints the bundle ID, version number, build number, and app name in order, for example `com.example.shop`, `0.1.0`, `1`, `Shop`. These four values come from the project's [`nacre.config.json`](project-config.md). What the app name reads as is **not verified in the simulator**.

The app's display name has no property of its own; read it from [`info`](../api/application/info.md).

## Know when the app goes to the background and returns to the foreground

```js
for (const type of ['inactive', 'background', 'foreground', 'active']) {
  application.addEventListener(type, (e) => {
    console.log(e.type, 'state now =', application.state);
  });
}
```

**Effect**: When the user goes to the Home Screen and then taps the icon to return to the app, the console prints in order:

- `inactive state now = active`
- `background state now = background`
- `foreground state now = background`
- `active state now = active`

`inactive` and `foreground` mean "about to", so `state` still has the old value when these two events arrive. `inactive` doesn't fire only before going to the background: it also fires on an incoming call or when Notification Center is pulled down, after which the app may go straight back to active. At launch the app also fires `foreground` and `active` in order.

## Save data when entering the background

```js
application.addEventListener('background', () => {
  application.storage.set('draft', 'Half-written content');
});
```

**Effect**: Each time the app enters the background, the draft is saved to local storage. If the system later terminates the app, it can be read the next time the app opens.

After the app enters the background, the system suspends it after a short time: JS no longer runs and timers no longer fire. When the user returns, the app resumes where it was suspended, and the variables in JS are all still there. The system may also terminate the app directly in the background, without any notification; the next time it opens, `main.js` runs from the beginning. **These points come from iOS's definitions and are not verified in the simulator.** So write what you need to keep to storage in `background`. There is not yet a way to request more execution time after entering the background.

## Release caches on a memory warning

```js
/** @type {Map<string, string>} */
const cache = new Map();

application.addEventListener('memorywarning', () => {
  cache.clear();
  console.log('Cache cleared');
});
```

**Effect**: When the system issues a memory warning, the console prints `Cache cleared`.

To trigger it in the simulator, choose Simulate Memory Warning from the Device menu. What you should drop is data you can get again: cached images, data that has been parsed but can be parsed again, and view controllers that aren't on screen.

## Keep the screen on

iOS locks the screen automatically after a period without touches. You can turn this off while playing video or showing a QR code.

```js
application.idleTimerDisabled = true;
```

**Effect**: While the app is in the foreground, the device no longer locks automatically. **Not verified in the simulator.**

This setting applies to the whole app and doesn't reset on its own. Set it back to `false` when leaving the view controller that needs the screen on; otherwise the device never locks while the app is in the foreground, which uses more power.

## Read the device's environment settings

```js
console.log(application.layoutDirection);
console.log(application.contentSizeCategory);
console.log(application.backgroundRefreshStatus);
console.log(application.protectedDataAvailable);
```

**Effect**: The console prints four lines, each the value on the current device. For example, when the system language is written left to right and the text size is the default, the first two lines are `ltr` and `UICTContentSizeCategoryL`. **The actual values of the last two lines are not verified in the simulator.**

Whether it's dark or light, and the screen's scale, are not on `application`; read them from the `traitCollection` of a scene or view; see [Traits](../api/ui-trait-collection.md). For the device model and system version, see [`UIDevice`](../api/ui-device.md). The system language can't be read yet.

## Save data

`application` has two entry points for storing data, and a third once `@nacrejs/keychain` is installed:

| Property | What it stores | Documentation |
| --- | --- | --- |
| [`application.storage`](../api/application/storage.md) | Settings and small state. Key-value pairs, read and written synchronously | [Local storage](../api/storage.md) |
| [`application.fileSystem`](../api/application/filesystem.md) | Files. Everything returns a Promise | [File system](../api/filesystem.md) |
| [`application.keychain`](../api/application/keychain.md) | Tokens and passwords, stored encrypted. Everything returns a Promise. **Install `@nacrejs/keychain` first**; without it, this property doesn't exist | [Keychain](../api/keychain.md) |

```js
application.storage.set('theme', 'dark');
console.log(application.storage.get('theme'));
```

**Effect**: The console prints `dark`. The value is still there after closing and reopening the app.

## Pass messages between parts of the app

`application` can listen for and dispatch events you define. An event name can be any string, as long as it differs from the [existing event names](../api/application.md#events). Two parts of the app that don't reference each other can use this to notify each other.

```js
application.addEventListener('login', (e) => {
  console.log('Received', e.type);
});

application.dispatchEvent(new Event('login'));
```

**Effect**: Before `dispatchEvent()` returns, the console prints `Received login`.

Events you dispatch yourself are synchronous. To let listeners cancel one, pass `{ cancelable: true }` when constructing it; see [`dispatchEvent()`](../api/event-target/dispatchevent.md). If you don't want to go through `application`, you can also create your own with `new EventTarget()`.

## See also

- [`Application`](../api/application.md): all members of `application`
- [Creating windows and handling scenes](scenes-and-windows.md)
- [Handling errors in one place](handle-errors.md)
- [Handling links that open the app](open-links.md)
