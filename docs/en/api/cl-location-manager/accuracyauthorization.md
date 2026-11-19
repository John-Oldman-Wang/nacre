---
type: reference
native: CLLocationManager.accuracyAuthorization
---

# `CLLocationManager`: `accuracyAuthorization` property

The **`accuracyAuthorization`** property indicates whether the user gave the app precise location or approximate location.

## Value

A string, one of the following:

| Value | Meaning |
| --- | --- |
| `'fullAccuracy'` | Precise location |
| `'reducedAccuracy'` | Approximate location: accurate to about 5 km, updated less often, and a received location may be up to 20 minutes old. These three figures come from Apple's headers and are **not verified in the simulator** |

- Read-only. Assigning to it throws `TypeError`.
- No default value; it depends on the user's choice. The app can't require the user to give precise location.
- Fires [`authorizationchange`](authorizationchange-event.md) when it changes.

## Examples

```js
const manager = new CLLocationManager();
if (manager.accuracyAuthorization === 'reducedAccuracy') {
  console.log('Approximate location only; not showing the street address');
}
```

**Effect**: prints one line when the user gave only approximate location.

## Corresponding iOS API

`CLLocationManager.accuracyAuthorization`. `CLAccuracyAuthorizationFullAccuracy` is written as `'fullAccuracy'` and `CLAccuracyAuthorizationReducedAccuracy` as `'reducedAccuracy'`.

## See also

- [`desiredAccuracy`](desiredaccuracy.md): with `'reduced'` you get the same as when the user gave only approximate location
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
