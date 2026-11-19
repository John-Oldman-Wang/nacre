# Requesting tracking authorization

This guide shows how to use [`ATTrackingManager`](../api/app-tracking-transparency.md) to ask the user for tracking authorization at the right moment, and how to get the advertising identifier with [`ASIdentifierManager`](../api/as-identifier-manager.md). Details of each member are on these two classes' reference pages.

Before you start, install `@nacrejs/app-tracking-transparency` and add `NSUserTrackingUsageDescription` to `nacre.config.json`. See [Installation](../api/app-tracking-transparency.md#installation).

The behavior after the authorization alert appears comes from Apple's documentation; every effect in this guide that involves it is **not verified in the simulator**.

## Recommended approach

- **Request after the UI is shown, prompted by a user action.** The system doesn't show the alert while the app isn't active. Once the user has answered, requesting again shows no alert, so ask when the user understands why this app wants to track, for example by first showing a page of your own explanation and calling `requestTrackingAuthorization()` after the user taps "Continue".
- **Read the status first, then decide whether to request.** When the status isn't `'notDetermined'`, a request shows no alert. If the user has already denied, don't show a "Please allow tracking" entry point in the UI again; guide them to change it in the system Settings app instead.
- **Before using the advertising identifier, check whether it's all zeros.** All zeros means no identifier is available; don't report it as a device's identifier, or every unauthorized device will be counted as the same one.
- **Don't use the advertising identifier as the user's identity.** The user can revoke authorization at any time, after which it reads as all zeros. Login state and user identity should come from tokens issued by the server. When you only want to tell devices apart without involving ads, use `identifierForVendor` on [`UIDevice`](../api/ui-device.md); it doesn't require user authorization.

## First example

Start from a blank app and put a button on screen. Tapping it asks the user for tracking authorization, then prints the authorization status and the advertising identifier.

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/app-tracking-transparency" />

application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. A button
  const button = UIButton.buttonWithType('system');
  button.setTitle('Allow personalized ads', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 240, 44);
  page.view.addSubview(button);

  // 2. Request authorization when tapped
  button.addEventListener('click', async () => {
    console.log('Before request: ' + ATTrackingManager.trackingAuthorizationStatus);
    const status = await ATTrackingManager.requestTrackingAuthorization();
    console.log('After request: ' + status);

    // 3. A usable advertising identifier exists only if allowed
    if (status === 'authorized') {
      console.log(ASIdentifierManager.sharedManager().advertisingIdentifier);
    }
  });
});
```

**Effect** (**not verified in the simulator**):

- A text button, "Allow personalized ads", appears near the top left of the screen.
- The first tap prints `Before request: notDetermined` to the console, and the system shows an alert.
- If the user allows, the console prints `After request: authorized`, followed by the advertising identifier. On a device it is a UUID; in the simulator it is `00000000-0000-0000-0000-000000000000`.
- If the user doesn't allow, the console prints `After request: denied`.
- Later taps show no alert and print the previous result directly.

## Request only if not asked yet

```js
async function askOnce() {
  if (ATTrackingManager.trackingAuthorizationStatus !== 'notDetermined') {
    return ATTrackingManager.trackingAuthorizationStatus;
  }
  return ATTrackingManager.requestTrackingAuthorization();
}

askOnce().then((status) => {
  console.log(status);
});
```

**Effect**: If the user hasn't answered yet, the alert appears, and after the answer `authorized` or `denied` is printed. If they've already answered, nothing is requested and the current status is printed directly. **Not verified in the simulator.**

## Get the advertising identifier, and skip it if unavailable

```js
const ZERO = '00000000-0000-0000-0000-000000000000';

/** @returns {string | null} */
function advertisingId() {
  const id = ASIdentifierManager.sharedManager().advertisingIdentifier;
  return id === ZERO ? null : id;
}

console.log(advertisingId());
```

**Effect**: When the user has allowed tracking and the app runs on a device, prints a UUID such as `6D92078A-8246-4BA4-AE5B-76104861E7DC`, with uppercase letters. Otherwise prints `null`. **Not verified in the simulator.**

`advertisingIdentifier` gives the current value each time it is read. After the user revokes authorization, it reads as all zeros, so don't store a value you read long-term as if it stays valid.

## Re-read the status when returning to the foreground

The system doesn't notify the app when the status changes. The user has to leave the app to change authorization in Settings, so read it again whenever the app becomes active.

```js
let last = ATTrackingManager.trackingAuthorizationStatus;

application.addEventListener('active', () => {
  const now = ATTrackingManager.trackingAuthorizationStatus;
  if (now !== last) {
    console.log('Authorization status changed from ' + last + ' to ' + now);
    last = now;
  }
});
```

**Effect**: When the user switches to the system Settings app, changes this app's authorization, and switches back, the console prints one line, for example `Authorization status changed from authorized to denied`. If nothing changed, nothing is printed. **Not verified in the simulator.**

The `active` event fires each time the app becomes active; see [`application`](../api/application.md#foreground-background-and-run-state).

## Handle a failed request

```js
ATTrackingManager.requestTrackingAuthorization().then(
  (status) => {
    console.log(status);
  },
  (err) => {
    console.log('Request was not sent: ' + err.message);
  },
);
```

**Effect**: Normally prints the authorization status. When the app's Info.plist has no `NSUserTrackingUsageDescription`, the second callback runs and prints the explanation provided by the runtime. **Not verified in the simulator.**

A project generated by the CLI never reaches the second callback: generation already fails when this description is missing. It is there for the case where you set up your own Xcode project and drag the framework in.

## See also

- [`ATTrackingManager`](../api/app-tracking-transparency.md): authorization status and requests
- [`ASIdentifierManager`](../api/as-identifier-manager.md): the advertising identifier
- [Configure the app](project-config.md#writing-usage-descriptions): how to write `NSUserTrackingUsageDescription`
- [`application`](../api/application.md): `state` and the `active` event
