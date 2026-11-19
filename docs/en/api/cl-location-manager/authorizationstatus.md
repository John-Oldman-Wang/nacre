---
type: reference
native: CLLocationManager.authorizationStatus
---

# `CLLocationManager`: `authorizationStatus` property

The **`authorizationStatus`** property indicates whether the user allows the app to use location. Reading it doesn't show anything.

## Value

A string, one of the following five:

| Value | Meaning | Can get location |
| --- | --- | --- |
| `'notDetermined'` | The user hasn't been asked yet | No |
| `'authorizedWhenInUse'` | The user allows the app to use location while in use | Yes |
| `'denied'` | The user denied, or location services are turned off system-wide | No |
| `'restricted'` | Restrictions on the device don't allow location (parental controls, enterprise management); the user can't change it | No |
| `'authorizedAlways'` | The user allows the app to use location at any time. This package never requests it; you read it when the user manually changes it to "Always" in Settings | Yes |

- Read-only. Assigning to it throws `TypeError`.
- No default value; it depends on the user's choice.
- When the user chooses "Allow Once" it's `'authorizedWhenInUse'`, and it reverts to `'notDetermined'` the next time the app launches. **Not verified in the simulator.**
- Fires [`authorizationchange`](authorizationchange-event.md) when it changes. Receiving the event after the user changes it in Settings is **not verified in the simulator**.

## Examples

```js
const manager = new CLLocationManager();
const status = manager.authorizationStatus;
if (status === 'notDetermined') {
  console.log('Not asked yet');
} else if (status === 'denied' || status === 'restricted') {
  console.log('Location not allowed');
} else {
  console.log('Location allowed');
}
```

**Effect**: the console prints one of the three lines. No prompt is shown.

## Corresponding iOS API

`CLLocationManager.authorizationStatus`. `kCLAuthorizationStatusAuthorizedWhenInUse` is written as `'authorizedWhenInUse'`, and likewise for the rest.

## See also

- [`requestWhenInUseAuthorization()`](requestwheninuseauthorization.md): asking the user
- [Authorization](../cl-location-manager.md#authorization)
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
