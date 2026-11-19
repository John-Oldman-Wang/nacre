---
type: reference
native: ATTrackingManager
status: partial
---

# `ATTrackingManager`

**`ATTrackingManager`** represents the user's answer to "may this app track me", and is responsible for asking the user for it.

"Tracking" is a specific term in iOS: linking user or device data collected by this app with data collected by other companies' apps and websites, for targeted advertising or measuring advertising; or sharing that data with data brokers. iOS requires an app to get the user's consent before doing this. The system records whether consent was given; the app can only read it, not change it.

The same package also contains [`ASIdentifierManager`](as-identifier-manager.md): it gives this device's advertising identifier. The app can read the real advertising identifier only after the user consents to tracking.

> **Note:** These two classes are not in the core; they are available only after you install the `@nacrejs/app-tracking-transparency` package. Without it, there are no global `ATTrackingManager` and `ASIdentifierManager`, and type checking also reports that these two names cannot be found. For how to install it, see "[Installation](#installation)" below.

The shape of the class members and the errors for invalid values are verified in the simulator (iPhone Air) acceptance tests. Behavior after the authorization alert appears requires someone to operate it; it comes from Apple's documentation and is marked "**not verified in the simulator**" in each place.

**Inheritance**: `EventTarget` → `NSObject` → `ATTrackingManager`

For how to request authorization at the right moment, see the guide [Requesting tracking authorization](../guides/tracking-authorization.md).

## Installation

Step one: install the package in your project:

```bash
npm install @nacrejs/app-tracking-transparency
```

**Effect**: The next time `ios/` is generated, the project embeds one more framework, `NacreAppTrackingTransparency.framework`. Projects that do not install it do not include it in the app.

Step two: add a sentence to `nacre.config.json` telling the user why you want to track. The key is `NSUserTrackingUsageDescription`:

```json
{
  "name": "Shop",
  "bundleId": "com.example.shop",
  "ios": {
    "languages": ["en", "zh-Hans"],
    "infoPlist": {
      "NSUserTrackingUsageDescription": {
        "en": "Your data is used to show you more relevant ads.",
        "zh-Hans": "用于向你展示更相关的广告。"
      }
    }
  }
}
```

**Effect**: In the system alert, this sentence appears below the title; when the phone is set to Simplified Chinese, the Chinese sentence is shown. How the alert looks on screen is **not verified in the simulator**.

This sentence is required. If the package is installed but the sentence is missing, generating `ios/` reports an error and stops; the measured error is:

```
nacre: @nacrejs/app-tracking-transparency needs NSUserTrackingUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

When only one language is supported, the value can be written directly as a string. For the rules on writing it per language, see [Configuring the app](../guides/project-config.md#writing-usage-descriptions).

Step three: add a line at the top of the entry file to bring in the types:

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/app-tracking-transparency" />
```

**Effect**: The editor offers completion and checking for `ATTrackingManager` and `ASIdentifierManager`. Without this line, `tsc` reports `Cannot find name 'ATTrackingManager'` (measured).

## Constructor

It cannot be created with `new`. `ATTrackingManager` has no instances; its members are all on the class.

- `new ATTrackingManager()` throws `TypeError: Illegal constructor: ATTrackingManager has no instances; use ATTrackingManager.trackingAuthorizationStatus and ATTrackingManager.requestTrackingAuthorization()`.
- Subclassing it and calling `new` throws `TypeError` with a message starting with `Illegal constructor:`. Native classes cannot be subclassed; see [Native classes](native-classes.md).

## Static properties

[`ATTrackingManager.trackingAuthorizationStatus`](app-tracking-transparency/trackingauthorizationstatus.md) <small>read-only</small>

The current authorization state. Reading it does not show the alert.

## Static methods

[`ATTrackingManager.requestTrackingAuthorization()`](app-tracking-transparency/requesttrackingauthorization.md)

Asks the user for tracking authorization and returns a Promise that fulfills with the authorization state after the request.

## Events

There are no events. The system does not notify the app when the authorization state changes: changes caused by a request come from the Promise of `requestTrackingAuthorization()`; for changes the user makes in the system Settings, read `trackingAuthorizationStatus` again when the app becomes active.

## The four authorization states

The authorization state is a string with one of these four values:

| Value | Meaning | Requesting authorization now | Advertising identifier |
| --- | --- | --- | --- |
| `'notDetermined'` | The user has not answered yet. The app has never asked, or the system dismissed the alert before the user answered | Shows the alert | All zeros |
| `'restricted'` | The device is restricted (for example by parental controls or corporate device management), and the system does not allow the app to ask | Does not show the alert | All zeros |
| `'denied'` | The user declined, or turned off "Allow Apps to Request to Track" in system settings | Does not show the alert | All zeros |
| `'authorized'` | The user agreed | Does not show the alert | The real value |

This table comes from Apple's documentation and the descriptions in the system headers, and is **not verified in the simulator**. For the "Advertising identifier" column, see [`advertisingIdentifier`](as-identifier-manager/advertisingidentifier.md).

The user can change their mind after answering: authorization for this app can be turned on or off at any time in the system Settings.

## Examples

### Requesting authorization with a button

The code below starts from a blank app and places a button on the screen. Tapping it asks the user for tracking authorization and then prints the authorization state and the advertising identifier. Before running it, complete the three steps in "[Installation](#installation)".

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/app-tracking-transparency" />

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('Allow personalized ads', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 240, 44);
  page.view.addSubview(button);

  button.addEventListener('click', async () => {
    console.log('Before the request: ' + ATTrackingManager.trackingAuthorizationStatus);
    const status = await ATTrackingManager.requestTrackingAuthorization();
    console.log('After the request: ' + status);
    if (status === 'authorized') {
      console.log(ASIdentifierManager.sharedManager().advertisingIdentifier);
    }
  });
});
```

**Effect** (**not verified in the simulator**):

- A text button "Allow personalized ads" appears near the top left of the screen.
- The first time it is tapped, the console prints `Before the request: notDetermined` and the system shows the alert.
- If the user chooses Allow, the console prints `After the request: authorized`, followed by the advertising identifier. On a device it is a UUID; in the simulator it is `00000000-0000-0000-0000-000000000000`.
- If the user chooses not to allow, the console prints `After the request: denied`.
- Tapping the button again afterward does not show the alert again; it prints the previous result directly.

For more patterns, see the guide [Requesting tracking authorization](../guides/tracking-authorization.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `ATTrackingManager.trackingAuthorizationStatus` | `ATTrackingManager.trackingAuthorizationStatus` |
| `ATTrackingManagerAuthorizationStatusNotDetermined` | `'notDetermined'` |
| `ATTrackingManagerAuthorizationStatusRestricted` | `'restricted'` |
| `ATTrackingManagerAuthorizationStatusDenied` | `'denied'` |
| `ATTrackingManagerAuthorizationStatusAuthorized` | `'authorized'` |
| `[ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:^(ATTrackingManagerAuthorizationStatus status) { … }]` | `ATTrackingManager.requestTrackingAuthorization().then((status) => { … })` |
| `NSUserTrackingUsageDescription` in Info.plist | `ios.infoPlist.NSUserTrackingUsageDescription` in `nacre.config.json` |

## See also

- [Requesting tracking authorization](../guides/tracking-authorization.md): when to ask, asking only once, re-reading on return to the foreground
- [`ASIdentifierManager`](as-identifier-manager.md): the advertising identifier, the other class in the same package
- [Core and capability packages](capabilities.md): `@nacrejs/app-tracking-transparency` is a capability package; how capability packages are used
- [Configuring the app: name, languages, usage descriptions](../guides/project-config.md): where `NSUserTrackingUsageDescription` goes and how to write it per language
- [`application`](application.md): `state` and the `active` event, for telling whether the app is active
