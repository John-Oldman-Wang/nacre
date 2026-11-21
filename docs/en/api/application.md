---
type: reference
native: UIApplication
status: partial
---

# `Application`

**`Application`** represents the running app. Its only instance is the global object **`application`**: the runtime creates it when the app launches, there is exactly one per app, and it lives until the app ends. Any part of a script can use it directly; you don't create it, and you can't create another one.

`application` handles app-wide concerns:

- **App information**: bundle ID, version, and the contents of the configuration file.
- **App state**: whether the app is in the foreground or background, and which scenes currently exist.
- **App-level events**: the UI can be built, the app entered the background, memory is low, the app was opened by a link, there is an unhandled exception.
- **App-level capabilities**: entry points to local storage, files, and network status, asking the system to open a URL (opening outward; another app opening this app is the event in the previous item), and asking the system for extra time when moving to the background. With `@nacrejs/keychain` installed, the keychain entry point is here too; with `@nacrejs/push` installed, so is the remote notifications entry point.
- **Native module entry point**: methods provided by the app's own native code and third-party native SDKs are called from `application.nativeModules`.

The UI is not on `application`. The UI belongs to scenes ([`UIWindowScene`](ui-window-scene.md)): a scene represents one instance of the app's UI, the system creates it, and a window must be created on a scene to be displayed. `application` fires [`sceneconnect`](application/sceneconnect-event.md) when a scene becomes available and keeps track of the current scenes.

The runtime also provides several event-related classes, each with its own page: [`EventTarget`](event-target.md) (the base class for objects that fire events), [`Event`](event.md) (the base class for event objects), and the event objects for three of the events on `application`: [`ErrorEvent`](error-event.md), [`PromiseRejectionEvent`](promise-rejection-event.md), and [`OpenURLEvent`](open-url-event.md).

**Inheritance**: [`EventTarget`](event-target.md) → `Application`

For how to organize startup code and handle foreground, background, and memory warnings, see the guide [Handling the app lifecycle](../guides/app-lifecycle.md); for handling errors in one place, see [Handling errors in one place](../guides/handle-errors.md); for handling links that open the app, see [Handling links that open the app](../guides/open-links.md).

## Constructor

It can't be created with `new`. `new Application()` throws `TypeError: Illegal constructor`. Use the global `application` directly.

## Instance properties

App information. These four properties don't change while the app runs, so they have no change events:

| Property | Description |
| --- | --- |
| [`info`](application/info.md) <small>read-only</small> | The full contents of Info.plist |
| [`bundleIdentifier`](application/bundleidentifier.md) <small>read-only</small> | Bundle ID |
| [`version`](application/version.md) <small>read-only</small> | User-facing version number |
| [`build`](application/build.md) <small>read-only</small> | Build number |

App state:

| Property | Description |
| --- | --- |
| [`state`](application/state.md) <small>read-only</small> | The foreground/background state of all scenes combined |
| [`scenes`](application/scenes.md) <small>read-only</small> | The currently connected scenes |
| [`supportsMultipleScenes`](application/supportsmultiplescenes.md) <small>read-only</small> | Whether multiple scenes can exist at the same time |
| [`protectedDataAvailable`](application/protecteddataavailable.md) <small>read-only</small> | Whether encrypted, protected files can be read right now |
| [`backgroundTimeRemaining`](application/backgroundtimeremaining.md) <small>read-only</small> | How many more seconds the app can run in the background. `Infinity` in the foreground |

Device environment settings:

| Property | Description |
| --- | --- |
| [`layoutDirection`](application/layoutdirection.md) <small>read-only</small> | The writing direction of the UI |
| [`contentSizeCategory`](application/contentsizecategory.md) <small>read-only</small> | The text size level the user chose |
| [`backgroundRefreshStatus`](application/backgroundrefreshstatus.md) <small>read-only</small> | Whether the app can refresh content in the background |
| [`prefersReducedResourceUsage`](application/prefersreducedresourceusage.md) <small>read-only</small> | Whether the system recommends that the app reduce resource usage |
| [`idleTimerDisabled`](application/idletimerdisabled.md) | Whether automatic screen locking is prevented |

Capability entry points. Each read returns the same object:

| Property | Description |
| --- | --- |
| [`storage`](application/storage.md) <small>read-only</small> | Key-value storage |
| [`fileSystem`](application/filesystem.md) <small>read-only</small> | File reading and writing |
| [`network`](application/network.md) <small>read-only</small> | Network status: whether connected, which kind of network, whether metered |
| [`keychain`](application/keychain.md) <small>read-only</small> | Encrypted storage for tokens and passwords. **Only present in projects that install `@nacrejs/keychain`** |
| [`remoteNotifications`](application/remotenotifications.md) <small>read-only</small> | Remote notifications: registration, the device token, silent pushes. **Only present in projects that install `@nacrejs/push`** |
| [`nativeModules`](application/nativemodules.md) <small>read-only</small> | Native modules registered in this app |

## Instance methods

Also inherits [`addEventListener()`](event-target/addeventlistener.md), [`removeEventListener()`](event-target/removeeventlistener.md), and [`dispatchEvent()`](event-target/dispatchevent.md) from [`EventTarget`](event-target.md).

| Method | Description |
| --- | --- |
| [`openURL()`](application/openurl.md) | Hands a URL to the system to open |
| [`runBackgroundTask()`](application/runbackgroundtask.md) | Runs a function and, if the app moves to the background meanwhile, asks the system for extra time to finish it |

## Events

Event names are all lowercase, with no separators.

Scenes:

| Event | When it fires |
| --- | --- |
| [`sceneconnect`](application/sceneconnect-event.md) | The system has created a scene. Put UI code here |
| [`scenedisconnect`](application/scenedisconnect-event.md) | The system destroyed a scene |

Links:

| Event | When it fires |
| --- | --- |
| [`openurl`](application/openurl-event.md) | Another app or a link opened this app |

Foreground and background:

| Event | When it fires |
| --- | --- |
| [`inactive`](application/inactive-event.md) | The app is about to leave the active state |
| [`background`](application/background-event.md) | The app has entered the background |
| [`foreground`](application/foreground-event.md) | The app is about to return to the foreground |
| [`active`](application/active-event.md) | The app has entered the active state |
| [`beforeterminate`](application/beforeterminate-event.md) | The system is about to terminate the app |

System notifications:

| Event | When it fires |
| --- | --- |
| [`memorywarning`](application/memorywarning-event.md) | The system is low on memory, and the app should release caches |
| [`screenshot`](application/screenshot-event.md) | The user took a screenshot |
| [`significanttimechange`](application/significanttimechange-event.md) | The time changed significantly: midnight passed, the time zone changed, daylight saving time switched |
| [`contentsizecategorychange`](application/contentsizecategorychange-event.md) | The user changed the system text size |
| [`localechange`](application/localechange-event.md) | The user changed the region settings: country or region, currency, number and date formats |
| [`protecteddataavailable`](application/protecteddataavailable-event.md) | The device was unlocked, and encrypted, protected files can be read |
| [`protecteddataunavailable`](application/protecteddataunavailable-event.md) | The device is about to lock, and encrypted, protected files will become unreadable |
| [`backgroundrefreshstatuschange`](application/backgroundrefreshstatuschange-event.md) | The user changed the background refresh setting |
| [`reducedresourceusagechange`](application/reducedresourceusagechange-event.md) | The system's recommendation on resource usage changed |

Errors:

| Event | When it fires |
| --- | --- |
| [`error`](application/error-event.md) | There is an uncaught exception |
| [`unhandledrejection`](application/unhandledrejection-event.md) | A Promise was rejected without a handler attached |

`application` can also listen for and dispatch events you define yourself. The event name can be any string, as long as it differs from the ones above.

## Scenes

There are two ways to get a scene:

| Source | When it has a value |
| --- | --- |
| `e.scene` of the `sceneconnect` event | When the event fires |
| `application.scenes` | After `sceneconnect` fires. It's an empty array when the script starts running |

So the entry point for UI code is always `sceneconnect`. After the app launches, the runtime first runs all of `main.js`, and only then does the system create the scene. When a scene is destroyed, `scenedisconnect` fires and the scene is removed from `application.scenes` at the same time.

How `application` and scenes divide the work:

| | Responsible for |
| --- | --- |
| `application` | The whole app: information, the foreground/background state of all scenes combined, memory warnings, errors |
| Scene | One UI instance: its windows and its own foreground/background state |

## Foreground, background, and run state

An iOS app doesn't run all the time. When the user goes back to the Home Screen or switches to another app, the current app enters the background, and the system may then suspend it or terminate it outright.

[`application.state`](application/state.md) has three normal values:

| Value | Meaning |
| --- | --- |
| `'active'` | In the foreground and receiving user input |
| `'inactive'` | In the foreground but temporarily not receiving input. For example, while switching apps, during an incoming call, or with Notification Center pulled down |
| `'background'` | Not on screen. This is also the value when the script starts running |

Four events fire when the state changes. Two of them fire before the state changes:

| Event | Meaning | Value of `state` when the event arrives |
| --- | --- | --- |
| `inactive` | About to leave the active state | `'active'`, still the old value |
| `background` | Has entered the background | `'background'` |
| `foreground` | About to return to the foreground | `'background'`, still the old value |
| `active` | Has entered the active state | `'active'` |

Scenes also have four events with the same names. The ones on `application` reflect the state of all scenes combined; the ones on a scene reflect that one scene's state. The values read from the two can differ at the same moment; see [`UIWindowScene`](ui-window-scene.md#scene-state-and-app-state).

After the app enters the background, the system suspends it after a short while. Wrap work that has already started and needs a few more seconds to finish (an upload, writing a file) in [`runBackgroundTask()`](application/runbackgroundtask.md), and the system gives it extra time to finish; read how many seconds are left from [`backgroundTimeRemaining`](application/backgroundtimeremaining.md).

## System events can't be canceled

Events on `application` fall into two categories, which differ in whether `preventDefault()` works:

| Category | Includes | `cancelable` | `preventDefault()` |
| --- | --- | --- | --- |
| System notifications | `sceneconnect`, `openurl`, the foreground/background events, `memorywarning`, and so on: everything except the two below | `false` | Has no effect and doesn't throw |
| Error events | `error`, `unhandledrejection` | `true` | Prevents the runtime from printing the default error log |

System notifications can't be canceled because listeners don't run at the moment the system sends the notification. The runtime dispatches them later, when the system has already finished handling them. See [How the runtime works](how-it-works.md#events). The `target` of every system notification is `application`.

## Unhandled exceptions don't terminate the app

When an exception thrown in JS isn't caught by `try` / `catch`, the app doesn't exit. The code that threw stops running; everything else keeps working: listeners stay registered, timers keep firing, and the UI stays usable.

| Where the exception occurs | How the runtime handles it |
| --- | --- |
| Top level of `main.js`, timer callbacks, event listener callbacks (including the `sceneconnect` callback and button tap callbacks) | Fires [`error`](application/error-event.md) on `application`. If no listener cancels it, prints an error log starting with `Uncaught` to the console |
| A `Promise` is rejected with no handler attached. Exceptions thrown in `async` functions fall into this category | Fires [`unhandledrejection`](application/unhandledrejection-event.md) on `application`. If no listener cancels it, prints an error log starting with `Uncaught (in promise)` |

- When the top level of `main.js` throws, the top-level code after that line doesn't run. Listeners registered before it remain in effect.
- When an event listener throws, the other listeners for the same event still run, and `error` fires before the next listener runs.
- Calling `preventDefault()` in a listener for either event cancels only the default log the runtime prints. The exception has already happened, and the interrupted code doesn't resume.

## Examples

### The starting point of every app

Print the app's information, then create the window and view controller once the system is ready.

```js
console.log('Bundle ID', application.bundleIdentifier);
console.log('Version', application.version, 'Build', application.build);
console.log('Scene count', application.scenes.length);

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  console.log('UI ready, scene count', application.scenes.length);
});
```

**Effect**

- The console first prints three lines. For an app whose bundle ID is `com.example.shop`:
  - `Bundle ID com.example.shop`
  - `Version 0.1.0 Build 1`
  - `Scene count 0`
- The screen then changes from black to the system background color: white in light mode, black in dark mode.
- The console prints `UI ready, scene count 1`.

This code hasn't been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

## Corresponding iOS API

`application` isn't an item-by-item mapping of `UIApplication`. It gathers app-level capabilities that iOS spreads across several places onto one object.

| ObjC | JS |
| --- | --- |
| `NSBundle.mainBundle.infoDictionary` | `application.info` |
| `NSBundle.mainBundle.bundleIdentifier` | `application.bundleIdentifier` |
| `UIApplication.sharedApplication.applicationState` | `application.state` |
| `UIApplication.sharedApplication.connectedScenes` | `application.scenes` |
| `UIApplication.sharedApplication.supportsMultipleScenes` | `application.supportsMultipleScenes` |
| `UIApplication.sharedApplication.userInterfaceLayoutDirection` | `application.layoutDirection` |
| `UIApplication.sharedApplication.preferredContentSizeCategory` | `application.contentSizeCategory` |
| `UIApplication.sharedApplication.backgroundRefreshStatus` | `application.backgroundRefreshStatus` |
| `UIApplication.sharedApplication.protectedDataAvailable` | `application.protectedDataAvailable` |
| `UIApplication.sharedApplication.idleTimerDisabled = YES` | `application.idleTimerDisabled = true` |
| `[UIApplication.sharedApplication openURL:url options:@{} completionHandler:…]` | `application.openURL(url)` |
| `beginBackgroundTaskWithName:expirationHandler:`, `endBackgroundTask:` | `application.runBackgroundTask(work, { name })` |
| `UIApplication.sharedApplication.backgroundTimeRemaining` | `application.backgroundTimeRemaining` |
| `NSUserDefaults.standardUserDefaults` | `application.storage` |
| `UISceneWillConnectNotification` | `application.addEventListener('sceneconnect', …)` |
| `UISceneDidDisconnectNotification` | `application.addEventListener('scenedisconnect', …)` |
| `scene:openURLContexts:` | `application.addEventListener('openurl', …)` |
| `scene:continueUserActivity:` with activity type `NSUserActivityTypeBrowsingWeb` | `application.addEventListener('openurl', …)` |
| `URLContexts` and `userActivities` of `connectionOptions` in `scene:willConnectToSession:options:` | The same `openurl`, fired after `sceneconnect` |
| `CFBundleURLTypes` in Info.plist | `ios.urlSchemes` in `nacre.config.json` |
| `UIApplicationDidBecomeActiveNotification` | `application.addEventListener('active', …)` |
| `UIApplicationWillResignActiveNotification` | `application.addEventListener('inactive', …)` |
| `UIApplicationDidEnterBackgroundNotification` | `application.addEventListener('background', …)` |
| `UIApplicationWillEnterForegroundNotification` | `application.addEventListener('foreground', …)` |
| `UIApplicationDidReceiveMemoryWarningNotification` | `application.addEventListener('memorywarning', …)` |
| `UIApplicationUserDidTakeScreenshotNotification` | `application.addEventListener('screenshot', …)` |
| `UIApplicationSignificantTimeChangeNotification` | `application.addEventListener('significanttimechange', …)` |
| `UIContentSizeCategoryDidChangeNotification` | `application.addEventListener('contentsizecategorychange', …)` |
| `NSCurrentLocaleDidChangeNotification` | `application.addEventListener('localechange', …)` |
| `UIApplicationProtectedDataDidBecomeAvailable` | `application.addEventListener('protecteddataavailable', …)` |
| `UIApplicationProtectedDataWillBecomeUnavailable` | `application.addEventListener('protecteddataunavailable', …)` |
| `UIApplicationBackgroundRefreshStatusDidChangeNotification` | `application.addEventListener('backgroundrefreshstatuschange', …)` |
| `UIApplicationWillTerminateNotification` | `application.addEventListener('beforeterminate', …)` |

## Comparison with the browser

| Browser | Nacre |
| --- | --- |
| `window.addEventListener('error', …)` | `application.addEventListener('error', …)` |
| `window.addEventListener('unhandledrejection', …)` | `application.addEventListener('unhandledrejection', …)` |
| `document.visibilityState` and `visibilitychange` | `application.state` and the four foreground/background events |
| `navigator.wakeLock.request('screen')` | `application.idleTimerDisabled = true` |
| `rejectionhandled` event | None |

## See also

- [Handling the app lifecycle](../guides/app-lifecycle.md): launch, foreground and background, memory warnings, keeping the screen on, your own events
- [Handling errors in one place](../guides/handle-errors.md)
- [Handling links that open the app](../guides/open-links.md)
- [How the runtime works](how-it-works.md): how code runs and when events fire
- [`UIWindowScene`](ui-window-scene.md): the scene object from `sceneconnect`, and the scene's own foreground/background events
- [`EventTarget`](event-target.md), [`Event`](event.md): the event model
- [Traits](ui-trait-collection.md): dark or light, the screen scale
- [`UIDevice`](ui-device.md): device model and system version
