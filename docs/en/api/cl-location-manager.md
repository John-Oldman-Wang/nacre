---
type: reference
native: CLLocationManager
status: partial
---

# `CLLocationManager`

**`CLLocationManager`** represents an entry point through which the app asks the system for location. Through it you can ask whether the user allows the app to use location, get the current location once, and receive location updates continuously.

The location group has four types, each with its own page:

- `CLLocationManager`: this page.
- [`CLLocation`](cl-location.md): a location. Latitude and longitude, altitude, the accuracy of each quantity, speed, direction of travel, and when the location was measured.
- [`CLLocationCoordinate2D`](cl-location-coordinate-2d.md): latitude and longitude, in degrees.
- [`CLLocationError`](cl-location-error.md): the error you get when location fails, a [`DOMException`](dom-exception.md) or an [`NSError`](ns-error.md).

This group covers only "while using the app" location: getting the location while the app is in the foreground and the user is using it.

> **Note:** The members' shapes, default values, and errors for invalid values, as well as getting a location once when already authorized and the location update event, have been verified in acceptance tests in the simulator (iPhone Air). The authorization prompt, the behavior after the user denies, and how often locations arrive come from Apple's headers and documentation, and each is marked "not verified in the simulator".

**Inheritance**: `EventTarget` → `NSObject` → `CLLocationManager`

For how to request authorization, get the location, and handle errors, see the guide [Getting the user's location](../guides/get-location.md).

## Installation

Location isn't in the core; it's available only after you install the `@nacrejs/core-location` package. Without it, there's no global `CLLocationManager`, and type checking reports that the name can't be found. Three steps.

**1. Install the package.**

```bash
npm install @nacrejs/core-location
```

**Effect**: the next time `ios/` is generated, the project embeds one more framework, `NacreCoreLocation.framework`. Projects that don't install it don't have it in their build output.

**2. Write a sentence for the user.** When the system asks the user whether to allow location, the prompt shows a sentence provided by the app explaining why it needs the location. This sentence goes in `nacre.config.json`, under the system-defined key `NSLocationWhenInUseUsageDescription`:

```json
{
  "name": "Shop",
  "bundleId": "com.example.shop",
  "ios": {
    "infoPlist": {
      "NSLocationWhenInUseUsageDescription": "Show stores near you"
    }
  }
}
```

**Effect**: if the package is installed but this sentence is missing, generating `ios/` reports an error and stops:

```
nacre: @nacrejs/core-location needs NSLocationWhenInUseUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

For writing one sentence per language, see [Configuring the app](../guides/project-config.md#writing-usage-descriptions).

**3. Bring in the types.** Add a line at the top of the entry file:

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/core-location" />
```

**Effect**: `CLLocationManager` gets completion and checking in the editor. Without this line, `tsc` reports `Cannot find name 'CLLocationManager'`.

## Constructor

[`CLLocationManager()`](cl-location-manager/constructor.md)

Creates a location entry point. We recommend creating only one for the whole app.

## Instance properties

Also inherits properties from `NSObject`.

| Property | Description |
| --- | --- |
| [`authorizationStatus`](cl-location-manager/authorizationstatus.md) <small>read-only</small> | Whether the user allows the app to use location |
| [`accuracyAuthorization`](cl-location-manager/accuracyauthorization.md) <small>read-only</small> | Whether the user granted precise or approximate location |
| [`desiredAccuracy`](cl-location-manager/desiredaccuracy.md) | How many meters the location should ideally be accurate to |
| [`distanceFilter`](cl-location-manager/distancefilter.md) | During continuous updates, how far the device must move before a new location is reported |
| [`location`](cl-location-manager/location.md) <small>read-only</small> | The most recent location |

## Instance methods

Also inherits `addEventListener()`, `removeEventListener()`, and `dispatchEvent()` from `EventTarget`.

| Method | Description |
| --- | --- |
| [`requestWhenInUseAuthorization()`](cl-location-manager/requestwheninuseauthorization.md) | Requests "while using the app" location from the user. Returns a Promise |
| [`requestLocation()`](cl-location-manager/requestlocation.md) | Gets the location once. Returns a Promise |
| [`startUpdatingLocation()`](cl-location-manager/startupdatinglocation.md) | Starts continuous updates; locations arrive through the `locationupdate` event |
| [`stopUpdatingLocation()`](cl-location-manager/stopupdatinglocation.md) | Stops continuous updates |

## Events

Listen with `addEventListener()`. None of the three events can be canceled, and callbacks run on the turn after the event occurs.

| Event | When it fires |
| --- | --- |
| [`locationupdate`](cl-location-manager/locationupdate-event.md) | There's a new location |
| [`locationerror`](cl-location-manager/locationerror-event.md) | Location failed |
| [`authorizationchange`](cl-location-manager/authorizationchange-event.md) | The authorization status or precision changed; it also fires once after the `manager` is created |

These three are what the system fires. Listening for other names doesn't throw: they're treated as custom events and fire only when you dispatch them yourself with `dispatchEvent()`. The error event is called `locationerror`; listening for `error` here receives nothing.

## Authorization

The app can't read the location directly; it first needs the user's consent. Whether the user consented is recorded in the **authorization status**, read from [`authorizationStatus`](cl-location-manager/authorizationstatus.md); reading it doesn't show anything. Only the two statuses `'authorizedWhenInUse'` and `'authorizedAlways'` can get the location.

[`requestWhenInUseAuthorization()`](cl-location-manager/requestwheninuseauthorization.md) asks the user. The system asks each app only once: it shows a prompt when the status is `'notDetermined'`, and later calls show nothing and immediately give the current status. After the user denies, the app has no way to show the prompt again; only the user can change it in the system Settings app.

The user can also decide whether to give the app precise or approximate location, read from [`accuracyAuthorization`](cl-location-manager/accuracyauthorization.md). The app can't require the user to give precise location.

Both the authorization status and the precision can change while the app runs (the user switches to Settings and changes them). When they change, [`authorizationchange`](cl-location-manager/authorizationchange-event.md) fires.

## Getting once and continuous updates

| Mode | Method | Where the location comes from | When it stops |
| --- | --- | --- | --- |
| Once | [`requestLocation()`](cl-location-manager/requestlocation.md) | The Promise fulfills with a [`CLLocation`](cl-location.md) | The system stops on its own after getting a location |
| Continuous | [`startUpdatingLocation()`](cl-location-manager/startupdatinglocation.md) | [`locationupdate`](cl-location-manager/locationupdate-event.md) fires for each new location | Only stops when you call [`stopUpdatingLocation()`](cl-location-manager/stopupdatinglocation.md); the location hardware stays on in the meantime |

The two modes can't be used at the same time on one `manager`: calling `requestLocation()` during continuous updates rejects the Promise with `name` `'InvalidStateError'`; calling `startUpdatingLocation()` or `stopUpdatingLocation()` while `requestLocation()` hasn't settled cancels that request and rejects its Promise with `name` `'AbortError'`.

## When a `manager` is garbage collected

A `manager` that's continuously updating (after `startUpdatingLocation()` and before `stopUpdatingLocation()`), or that has an unsettled Promise, is kept alive by the runtime; it doesn't stop working just because no variable in your code points to it.

At other times a `manager` is like any ordinary object: when no variable points to it, it's collected, and the listeners attached to it disappear with it. If you only listen for `authorizationchange` and do nothing else, store the `manager` in a long-lived variable.

## Examples

### Get the location once when a button is tapped

The following code starts from a blank app and places a line of text and a button in the middle of the screen. Tapping the button requests authorization, then gets the location once and displays it.

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/core-location" />

// One for the whole app, stored at the top level
const manager = new CLLocationManager();
// Within 100 meters is good enough: faster and more power-efficient than the default best accuracy
manager.desiredAccuracy = 100;

application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. A line of text and a button
  const label = new UILabel();
  label.text = 'No location yet';
  label.numberOfLines = 0;
  label.textAlignment = 'center';
  const button = UIButton.buttonWithType('system');
  button.setTitle('Where am I', { forState: ['normal'] });
  for (const view of [label, button]) {
    view.translatesAutoresizingMaskIntoConstraints = false;
    page.view.addSubview(view);
  }
  NSLayoutConstraint.activateConstraints([
    label.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    label.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
    button.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    button.topAnchor.constraintEqualToAnchor(label.bottomAnchor, { constant: 16 }),
  ]);

  button.addEventListener('click', async () => {
    // 2. Request authorization. If already asked, the current status comes back immediately without a repeat prompt
    const status = await manager.requestWhenInUseAuthorization();
    if (status !== 'authorizedWhenInUse' && status !== 'authorizedAlways') {
      label.text = 'No location permission (' + status + ')';
      return;
    }

    // 3. Get the location once
    label.text = 'Locating…';
    try {
      const here = await manager.requestLocation();
      label.text = here.coordinate.latitude.toFixed(5) + ', ' +
                   here.coordinate.longitude.toFixed(5) +
                   '\nAccuracy ' + here.horizontalAccuracy + ' m';
    } catch (err) {
      label.text = 'Location failed: ' + (err instanceof Error ? err.name : String(err));
    }
  });
});
```

**Effect** (not verified in the simulator)

- The middle of the screen shows "No location yet", with a blue "Where am I" below it.
- The first time the button is tapped, the system shows a prompt containing the sentence written in `nacre.config.json`.
- After the user allows, the text changes to "Locating…" and, a few seconds later, to two lines: the latitude and longitude (five decimal places), and "Accuracy … m".
- If the user denies, the text changes to "No location permission (denied)". Tapping the button again shows no prompt, and the text doesn't change.
- When no location can be obtained, the text changes to "Location failed: LocationUnknownError".

### Receiving locations continuously

```js
const tracker = new CLLocationManager();
tracker.addEventListener('locationupdate', (e) => {
  const latest = e.locations[e.locations.length - 1];
  console.log(latest.coordinate.latitude, latest.coordinate.longitude);
});
tracker.startUpdatingLocation();
```

**Effect**: when authorized and the system has a location, prints a line with the latitude and longitude for each new location, until `tracker.stopUpdatingLocation()` is called.

For more patterns, see the guide [Getting the user's location](../guides/get-location.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[CLLocationManager alloc] init]` | `new CLLocationManager()` |
| `manager.authorizationStatus` (`kCLAuthorizationStatusAuthorizedWhenInUse`) | `manager.authorizationStatus` (`'authorizedWhenInUse'`) |
| `manager.accuracyAuthorization` (`CLAccuracyAuthorizationFullAccuracy`) | `manager.accuracyAuthorization` (`'fullAccuracy'`) |
| `[manager requestWhenInUseAuthorization]`, with the result from the delegate | `manager.requestWhenInUseAuthorization()`, returning a Promise |
| `manager.desiredAccuracy = kCLLocationAccuracyBest` | `manager.desiredAccuracy = 'best'` |
| `manager.desiredAccuracy = kCLLocationAccuracyBestForNavigation` | `manager.desiredAccuracy = 'bestForNavigation'` |
| `manager.desiredAccuracy = kCLLocationAccuracyReduced` | `manager.desiredAccuracy = 'reduced'` |
| `manager.desiredAccuracy = kCLLocationAccuracyHundredMeters` | `manager.desiredAccuracy = 100` |
| `manager.distanceFilter = kCLDistanceFilterNone` | `manager.distanceFilter = 'none'` |
| `manager.location` | `manager.location` |
| `[manager startUpdatingLocation]` / `[manager stopUpdatingLocation]` | `manager.startUpdatingLocation()` / `manager.stopUpdatingLocation()` |
| `[manager requestLocation]`, with the result from the delegate | `manager.requestLocation()`, returning a Promise |
| `manager.delegate = self` | Not needed; use `addEventListener` |
| `locationManager:didUpdateLocations:` | `locationupdate` event, `e.locations` |
| `locationManager:didFailWithError:` | `locationerror` event, `e.error` |
| `locationManagerDidChangeAuthorization:` | `authorizationchange` event |
| `error.code == kCLErrorDenied` | `error.name === 'NotAllowedError'`; the system's `NSError` is in `error.cause` |

## See also

- [Getting the user's location](../guides/get-location.md): complete patterns for requesting authorization, getting once, continuous updates, and handling errors
- [`CLLocation`](cl-location.md): the location type
- [`CLLocationError`](cl-location-error.md): what each error `name` means
- [Configuring the app: name, languages, usage descriptions](../guides/project-config.md): where `NSLocationWhenInUseUsageDescription` goes and how to write one sentence per language
- [Core and capability packages](capabilities.md): which capabilities must be installed separately, and what else to do after installing
- [Enums](enums.md): why values such as authorization statuses are strings, and what happens when they're wrong
- [How the runtime works](how-it-works.md): why event callbacks run on the next turn
