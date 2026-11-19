# Getting the user's location

This guide shows how to get the user's location with [`CLLocationManager`](../api/cl-location-manager.md): request authorization, get the location once, keep receiving it as the user moves, pick out usable locations, and handle errors. A location is a [`CLLocation`](../api/cl-location.md); errors are [`CLLocationError`](../api/cl-location-error.md).

Before you start, install `@nacrejs/core-location` and add `NSLocationWhenInUseUsageDescription` to `nacre.config.json`. See [`CLLocationManager`](../api/cl-location-manager.md#installation).

## Recommended approach

- **Use one `manager` for the whole app**, and keep it in a top-level module variable after creating it. A `manager` that only has listeners attached is garbage-collected when no variable refers to it, and its listeners go with it.
- **Request authorization when the user does something that needs the location** (taps "Nearby stores"), not at launch. At that point the user knows why the app wants the location and is more willing to allow it; a user who picks "Allow Once" also gets to use that one time right away.
- **Use [`requestLocation()`](../api/cl-location-manager/requestlocation.md) when you need only one location.** The system stops on its own after it gets a location, so there is nothing to remember to turn off. [`startUpdatingLocation()`](../api/cl-location-manager/startupdatinglocation.md) keeps the location hardware on until you call `stopUpdatingLocation()`, using power the whole time.
- **Ask only for the accuracy you need.** [`desiredAccuracy`](../api/cl-location-manager/desiredaccuracy.md) defaults to `'best'`. For uses like finding nearby stores, set it to `100` (meters); locating is faster and uses less power.

| What you want to do | What to use | Where the location comes from |
| --- | --- | --- |
| Know where the user is now: find nearby stores, fill in a delivery address | `requestLocation()` | The Promise fulfills with a `CLLocation` |
| Follow the user as they move: record a running route, navigation | `startUpdatingLocation()`, then `stopUpdatingLocation()` when done | Each time there is a new location, `manager` fires a `locationupdate` event |

## First example

Start from a blank app with a line of text and a button in the middle of the screen. Tapping the button requests authorization, then gets the location once and displays it.

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/core-location" />

// One for the whole app, kept at the top level
const manager = new CLLocationManager();
// An error within 100 meters is good enough: faster and uses less power than the default best accuracy
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
    // 2. Request authorization. If already asked, you get the current status right away; no repeated prompt
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
- The first time the button is tapped, the system shows an alert containing the sentence written in `nacre.config.json`.
- After the user allows it, the text changes to "Locating…", and a few seconds later to two lines: the latitude and longitude (five decimal places), and "Accuracy … m".
- If the user denies it, the text changes to "No location permission (denied)". Tapping the button again shows no alert, and the text stays the same.
- If no location can be obtained, the text changes to "Location failed: LocationUnknownError".

The examples below all reuse this `manager`.

## When to request authorization

[`requestWhenInUseAuthorization()`](../api/cl-location-manager/requestwheninuseauthorization.md) shows an alert only when the authorization status is `'notDetermined'`; later calls return the current status right away. So it is safe to call it every time before you use the location.

- **Once the user denies it, the app has no way to show the alert again.** Only the user can change it in the system Settings app. What the app can do is explain in its UI why it needs the location.
- **The user can pick "Allow Once".** The status is then `'authorizedWhenInUse'`, and it goes back to `'notDetermined'` the next time the app launches. **Not verified in the simulator.**
- **A request made while the app is in the background is rejected** with `name` `'InvalidStateError'`: the system asks only while the user is using the app.

## Check permission when a view controller appears

```js
const status = manager.authorizationStatus;
if (status === 'notDetermined') {
  console.log('Not asked yet; request when the user taps the relevant button');
} else if (status === 'denied' || status === 'restricted') {
  console.log('Location unavailable; explain why in the UI');
} else {
  console.log('Location available');
}
```

**Effect**: The console prints one of the three lines. Reading [`authorizationStatus`](../api/cl-location-manager/authorizationstatus.md) never shows an alert.

## Get the location once

```js
manager.requestLocation().then(
  (here) => {
    console.log(here.coordinate.latitude, here.coordinate.longitude);
  },
  (err) => {
    console.log('Failed: ' + err.name);
  });
```

**Effect**: On success, prints two numbers: latitude and longitude. On failure, prints `Failed: ` followed by the error name. Without authorization it prints `Failed: NotAllowedError`; in that case no alert is shown and there is no wait.

Getting a location once usually takes a few seconds. When the system cannot determine a location, the Promise is rejected with `name` `'LocationUnknownError'`. **The time taken and the timeout are not verified in the simulator.**

## Receive locations continuously

```js
manager.addEventListener('locationupdate', (e) => {
  const latest = e.locations[e.locations.length - 1];
  console.log(latest.coordinate.latitude, latest.coordinate.longitude,
              latest.timestamp.toISOString());
});
manager.startUpdatingLocation();

// When you're done
manager.stopUpdatingLocation();
```

**Effect**: After `startUpdatingLocation()`, one line is printed for each new location: latitude, longitude, and the time it was measured. After `stopUpdatingLocation()`, nothing more is printed (**not verified in the simulator**).

- `e.locations` holds the locations reported this time, at least one, and **the last one is the newest**. The system sometimes reports several locations together.
- The first location received after starting may be one the system saved earlier rather than a fresh measurement. If freshness matters, check `timestamp`; see [Pick out usable locations](#pick-out-usable-locations).
- Without authorization, `startUpdatingLocation()` does not throw, and no locations arrive. The system reports this through the `locationerror` event; see [Handle errors](#handle-errors).
- Call `stopUpdatingLocation()` when leaving the view controller that uses the location. Otherwise location stays on.
- Calling `requestLocation()` during continuous updates rejects the Promise with `name` `'InvalidStateError'`. To get the latest location, read `e.locations` in the event.

## Report less often and save power

```js
manager.desiredAccuracy = 100;   // An error within 100 meters is fine
manager.distanceFilter = 50;     // Report only after moving more than 50 meters
```

**Effect**: The system can locate in a more power-efficient way and reports locations less often. The values written read back unchanged. How much power is saved is **not verified in the simulator**.

`desiredAccuracy` is the accuracy you want, not a guarantee. How accurate a location the system delivers actually is shows in each location's [`horizontalAccuracy`](../api/cl-location/horizontalaccuracy.md).

## Pick out usable locations

```js
/** @param {CLLocation} location */
function usable(location) {
  // Latitude and longitude are invalid
  if (location.horizontalAccuracy === null) return false;
  // Error is more than 200 meters
  if (location.horizontalAccuracy > 200) return false;
  // Measured more than 30 seconds ago
  if (Date.now() - location.timestamp.getTime() > 30000) return false;
  return true;
}

manager.addEventListener('locationupdate', (e) => {
  const good = e.locations.filter(usable);
  if (good.length > 0) console.log('Usable locations:', good.length);
});
```

**Effect**: Only locations with an error within 200 meters, measured within the last 30 seconds, are counted. **Not verified in the simulator.**

Eight values in a location are `null` when the system cannot measure them; check before using them. See [`null` in a location](../api/cl-location.md#null-in-a-location).

## Listen for authorization changes

```js
manager.addEventListener('authorizationchange', () => {
  console.log(manager.authorizationStatus, manager.accuracyAuthorization);
});
```

**Effect**: Prints one line whenever the authorization status or the precise/approximate setting changes, for example `denied fullAccuracy`. The event object does not carry these two values; read them from `manager`. Receiving the event after the user changes settings is **not verified in the simulator**.

After `manager` is created, the system proactively reports the current status once. To receive that one, add the listener in the same synchronous code as `new CLLocationManager()`; a listener added later, as here, receives only subsequent changes.

When the user grants only an approximate location ([`accuracyAuthorization`](../api/cl-location-manager/accuracyauthorization.md) is `'reducedAccuracy'`), the error is around 5 kilometers. The app cannot require the user to grant a precise location; design the UI to work with the approximate location.

## Handle errors

```js
manager.addEventListener('locationerror', (e) => {
  if (e.error.name === 'NotAllowedError') {
    manager.stopUpdatingLocation();
    console.log('No permission; stopping location updates');
  } else if (e.error.name === 'LocationUnknownError') {
    console.log('Location temporarily unavailable; the system keeps trying');
  } else {
    console.log('Location error', e.error.name, e.error.code);
  }
});
```

**Effect** (not verified in the simulator): When an error occurs during continuous updates, one of the three lines is printed. `'LocationUnknownError'` is temporary and doesn't require stopping; `'NotAllowedError'` means there is no permission, so keeping updates on is pointless.

The error event is called `locationerror`, not `error`. Listening for `error` does not throw, but nothing ever arrives. For the meaning of each `name`, see [`CLLocationError`](../api/cl-location-error/name.md).

## Tell whether a location is simulated

```js
manager.requestLocation().then((here) => {
  const source = here.sourceInformation;
  if (source !== null && source.isSimulatedBySoftware) {
    console.log('This location is simulated by software');
  }
}, () => {});
```

**Effect**: Prints a line when the location is simulated (a location set in the simulator, or changed with developer tools). **Not verified in the simulator.**

## Try it in the simulator

The simulator has no location hardware; its location is set by you: pick one in the simulator's Features → Location menu, or set it with a command. With no location set, no location can be obtained. **Not verified in the simulator.**

A location set with a command in the simulator has no altitude; `altitude` reads `null`.

## See also

- [`CLLocationManager`](../api/cl-location-manager.md): all properties, methods, and events
- [`CLLocation`](../api/cl-location.md): what each value in a location means
- [`CLLocationError`](../api/cl-location-error.md): error categories
- [Configure the app](project-config.md#writing-usage-descriptions): how to write usage descriptions, including per language
