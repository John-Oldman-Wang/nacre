# Remote notifications

This guide covers how to make an app receive pushes sent by a server: installing the package, writing the entitlement, signing with a provisioning profile that has push enabled, getting the device token to your server, and handling visible pushes and silent pushes. Registration and the token live on [`RemoteNotifications`](../api/remote-notifications.md), the event object of a silent push is [`PushEvent`](../api/push-event.md), and visible pushes arriving and being tapped are reported by [`UNUserNotificationCenter`](../api/un-user-notification-center.md).

A **remote notification** (push) is a message sent by a server and delivered to the phone through Apple's push service (APNs). The server identifies which app on which device to send to by a **device token**, a string of characters the app gets after registering with Apple.

In this guide, registering and getting the token have been measured on a real device. Actually sending a push from a server to a phone has not been verified, and system behavior after a push arrives is marked "**not verified on a device**". Behavior in the simulator has not been verified.

## Recommended approach

- **Call `register()` on every launch**, compare the token you get with the one you last gave your server, and send it again if it differs. The token exists only within this launch, and it also changes after the app is reinstalled.
- **Visible pushes need authorization to show notifications first**, requested with `requestAuthorizationWithOptions()` from `@nacrejs/user-notifications`. Silent pushes need no authorization.
- **Put the silent push listener at the top level of the entry file**, write the work as an `async` function, hand it to `waitUntil()`, and set a timeout on network requests.
- **Write `development` for `aps-environment` during development, and `production` for the version you ship.**

## First example

Starting from a blank app, show the registration result in the middle of the screen: the token received, or the reason it failed. Before trying this example, install the package, write the entitlement, and sign the app as described in the next two sections.

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/push" />

const push = application.remoteNotifications;

application.addEventListener('sceneconnect', (e) => {
  // Create the window and the page. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // A line of text showing the registration result
  const label = new UILabel();
  label.text = 'Registering for pushes…';
  label.numberOfLines = 0;
  label.textAlignment = 'center';
  label.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(label);
  NSLayoutConstraint.activateConstraints([
    label.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
    label.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor, { constant: 20 }),
    label.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor, { constant: -20 }),
  ]);

  // Register with Apple; resolves to the device token
  push.register().then(
    (token) => {
      label.text = 'Token: ' + token;
    },
    (err) => {
      label.text = 'Registration failed: ' + (err instanceof Error ? err.message : String(err));
    },
  );
});
```

**Effect**

- The middle of the screen first shows "Registering for pushes…".
- When the provisioning profile used for signing has push enabled, it changes to "Token: " followed by 64 lowercase hexadecimal characters.
- When the profile lacks the push capability, it changes to "Registration failed: " followed by the reason the system gives. On a Chinese-language system the reason is `未找到应用程序的“aps-environment”的授权字符串`.

This code hasn't been run as a whole. Both results of `register()` in it have been measured on a real device.

The examples below reuse `push` from here. The sections that use visible pushes also need `@nacrejs/user-notifications`. To try a section on its own, start with these lines:

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/push" />
/// <reference types="@nacrejs/user-notifications" />

const push = application.remoteNotifications;
```

## Installing the package and writing the entitlement

```bash
npm install @nacrejs/push
```

**Effect**: The next time `ios/` is generated, the project embeds an extra `NacrePush.framework`, and `application.remoteNotifications` becomes available.

Then write the `aps-environment` entitlement in `nacre.config.json`. An entitlement is a special capability the app requests from the system, written into the app when it is signed:

```json
{
  "name": "Shop",
  "bundleId": "com.example.app",
  "ios": {
    "entitlements": { "aps-environment": "development" }
  }
}
```

**Effect**: The generated app carries this entitlement. If the package is installed but this entry is missing, generation reports: `nacre: @nacrejs/push needs the entitlement aps-environment. Put it in ios.entitlements in nacre.config.json`.

| Value | When to use it | Which Apple push server the token belongs to |
| --- | --- | --- |
| `development` | During development, when signing with a development profile and installing on your own phone | The development environment, `api.sandbox.push.apple.com` |
| `production` | The version you ship, signed with a distribution profile | The production environment, `api.push.apple.com` |

Tokens don't carry over between the two environments: the token an app with `development` receives must be sent to by the server through the development environment. This comes from Apple's documentation. `production` is **not verified**.

## Signing with a provisioning profile that has push enabled

A **provisioning profile** is a file issued by Apple that specifies which bundle identifier's app can be installed on which devices and which capabilities it can use. When the app contains `aps-environment`, the profile used for signing must have the push capability; otherwise `register()` is rejected.

Do two things under "Certificates, Identifiers & Profiles" on the Apple Developer website:

1. Under Identifiers, register an App ID whose bundle ID is the `bundleId` in `nacre.config.json` (for example `com.example.app`), and check Push Notifications in the capability list.
2. Under Profiles, generate a development profile for this App ID, select your development certificate and the phones to install on, and download it.

Then open the generated project in Xcode, sign with this profile under Signing & Capabilities, and install the app on the phone.

**Effect**: `register()` resolves to a token (measured).

- The App ID must use the full bundle ID. A wildcard App ID (one whose bundle ID is written like `com.example.*`) can't enable push; when signing with its profile, `register()` is rejected (measured).
- To ship, generate a distribution profile under Profiles and change `aps-environment` to `production`.

## Sending the token to your server

The token exists only within this launch; the runtime doesn't save it for the app. Register on every launch, compare with the token last given to your server, and send it again if it differs:

```js
async function syncPushToken() {
  const token = await push.register();
  if (application.storage.get('pushToken') === token) return;
  const response = await fetch('https://api.example.com/push-tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  application.storage.set('pushToken', token);
}

syncPushToken().catch((err) => {
  console.log('push token not sent', err instanceof Error ? err.message : String(err));
});
```

**Effect**: On the first launch, it gives the token to the server and records it. On later launches, if the token hasn't changed, it doesn't send it again. After the app is reinstalled the token differs (measured), so it is sent once more. If sending fails, nothing is recorded, and it tries again on the next launch.

- After the user signs in, give the token to the server along with the account, so the server knows whom to send to. When the user signs out, have the server delete this device's token.
- `register()` shows no prompt, so calling it at the top level of the entry file is fine.
- If the system never responds, `register()` keeps waiting.

## When the token changes

When the token differs from the previous value of `token`, `application.remoteNotifications` fires [`tokenchange`](../api/remote-notifications/tokenchange-event.md):

```js
push.addEventListener('tokenchange', () => {
  console.log('token changed', push.token);
});
```

**Effect**: It prints once when the first token of each launch arrives, because `token` starts as `null` on every launch. Receiving the same token again later in the same launch prints nothing.

Every token is obtained through `register()`, so comparing in the result of `register()`, as in the previous section, is enough. `tokenchange` suits code that puts "the token is available" and "send it to the server" in two different places.

## How the server sends a push

This section covers what the server side has to do; the app's code doesn't change. Its content comes from Apple's documentation and is **not verified**.

The server sends an HTTP/2 request to Apple's push server at the path `/3/device/<token>`; for the development and production servers, see the table above. The request needs authentication: under Keys on the Apple Developer website, generate a key with Apple Push Notifications service enabled, and the server signs with it. In the request headers:

| Header | What to write |
| --- | --- |
| `apns-topic` | The app's bundle ID, for example `com.example.app` |
| `apns-push-type` | `alert` for visible pushes, `background` for silent pushes |
| `apns-priority` | `5` for silent pushes |

The request body is the push content. A visible push:

```json
{
  "aps": { "alert": { "title": "Order shipped", "body": "A1024 has been handed to the courier" }, "sound": "default" },
  "orderId": "A1024"
}
```

**Effect**: A banner appears on the phone with the title "Order shipped" and the body "A1024 has been handed to the courier", and the default sound plays. `orderId`, outside `aps`, is the server's own data; the app reads it in the notification's `userInfo`. **Not verified on a device.**

A silent push:

```json
{ "aps": { "content-available": 1 }, "orderId": "A1024" }
```

**Effect**: Nothing appears on the phone; the app receives the `push` event, and `event.data.orderId` is `'A1024'`. **Not verified on a device.**

## Visible pushes: requesting authorization, arrival, and taps

Visible pushes arriving and being tapped are reported, like local notifications, by [`UNUserNotificationCenter`](../api/un-user-notification-center.md) from `@nacrejs/user-notifications`. Showing them requires the user to allow this app to send notifications. First install `@nacrejs/user-notifications`:

```bash
npm install @nacrejs/user-notifications
```

**Effect**: The project embeds an extra `NacreUserNotifications.framework`, and `UNUserNotificationCenter` becomes available.

Then request authorization and listen for the user tapping a push:

```js
const center = UNUserNotificationCenter.currentNotificationCenter();

center.addEventListener('notificationclick', (event) => {
  const request = event.response.notification.request;
  if (request.trigger instanceof UNPushNotificationTrigger) {
    console.log('tapped push', String(request.content.userInfo.orderId));
  }
});

async function enablePush() {
  const granted = await center.requestAuthorizationWithOptions(['alert', 'sound', 'badge']);
  console.log('notifications allowed', granted);
  const token = await push.register();
  console.log('token', token);
}
```

**Effect** (**not verified on a device**)

- When `enablePush()` is called and the user hasn't been asked yet, the system shows a prompt asking whether to allow this app to send notifications. After the user chooses, it prints `notifications allowed true` or `notifications allowed false`, then registers and prints the token. Give the token to your server as in [Sending the token to your server](#sending-the-token-to-your-server).
- After the user allows it, the push from the previous section appears on the phone as a banner. When the user taps it, it prints `tapped push A1024`.
- When the user doesn't allow it, registration still succeeds and the token can still be given to the server, but visible pushes aren't shown.
- The tap is received even when it launched the app.

The push content is in `request.content.userInfo`; it is the JSON object the server sent. For how pushes arriving while the app is open are shown, and when to request authorization, see [Sending local notifications](local-notifications.md).

## Silent pushes

A silent push shows nothing; the system wakes the app in the background to do one thing, such as fetching new data before the user opens the app. It needs three things:

**1. Declare the background mode in `nacre.config.json`.**

```json
{
  "ios": {
    "entitlements": { "aps-environment": "development" },
    "infoPlist": { "UIBackgroundModes": ["remote-notification"] }
  }
}
```

**Effect**: The app's Info.plist gets the background mode `remote-notification`. The system wakes the app for silent pushes only when the app declares it. This comes from Apple's documentation and is **not verified on a device**.

**2. The content the server sends contains `"content-available": 1`**; for the headers, see [How the server sends a push](#how-the-server-sends-a-push).

**3. Listen for `push` at the top level of the entry file, and use `waitUntil()` to make the system wait.**

```js
async function refreshOrders() {
  const response = await fetch('https://api.example.com/orders', {
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  application.storage.set('orders', await response.text());
}

push.addEventListener('push', (event) => {
  console.log('silent push', JSON.stringify(event.data));
  event.waitUntil(refreshOrders());
});
```

**Effect** (**not verified on a device**): When a silent push arrives, the app is woken in the background, prints the push content, and fetches the orders once and stores them. If the request succeeds, the system gets "new data"; if the request fails, the server returns an error, or it takes longer than 20 seconds, the system gets "failed". When the user opens the app later, it reads the orders directly from `application.storage`.

A few rules:

- **Put the listener at the top level of the entry file, added synchronously.** When the app isn't running, the system launches it in the background for this push. If the listener is inside `sceneconnect` or after some `await`, this push is handled as "no new data". **Not verified on a device.**
- **Call `waitUntil()` right away inside the listener.** If the listener is an `async` function and calls it only after an `await`, dispatch has already ended and the call throws `InvalidStateError` (measured).
- **The time the system waits is limited**; Apple's documentation says about 30 seconds. Set a shorter timeout on network requests. **Not verified on a device.**
- How the result is computed: if all the Promises given to `waitUntil()` are fulfilled, it is "new data"; if one is rejected, "failed"; if it isn't called, "no new data" (measured, with the step where the push arrives simulated).
- The system limits how many silent pushes it delivers and doesn't guarantee each one arrives; Apple's documentation suggests no more than two or three per hour. After the user swipes the app away in the app switcher, silent pushes no longer wake it. **Not verified on a device.**
- Store the fetched data in [`application.storage`](../api/storage.md) or in [files](../api/filesystem.md), and show it when the user opens the app.

## Stopping pushes

```js
push.unregister();
console.log(push.isRegistered);
```

**Effect**: Prints `false` (measured). This device receives no remote notifications for this app until `register()` is called again.

Apple's documentation recommends doing this only in rare cases, such as when a new version of the app no longer uses pushes at all. When the user signs out, have the server delete this device's token while the app stays registered.

## See also

- [`RemoteNotifications`](../api/remote-notifications.md): registration, the token, the two events, and how to install this package
- [`PushEvent`](../api/push-event.md): the event object of a silent push, and the result
- [`UNUserNotificationCenter`](../api/un-user-notification-center.md): requesting authorization; visible pushes arriving and being tapped
- [Sending local notifications](local-notifications.md): how notifications are shown while the app is open, opening the matching page after a tap
- [Configuring the app](project-config.md): how to write `ios.entitlements` and `ios.infoPlist`
