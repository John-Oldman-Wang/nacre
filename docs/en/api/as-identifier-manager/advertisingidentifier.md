---
type: reference
native: ASIdentifierManager.advertisingIdentifier
---

# `ASIdentifierManager`: `advertisingIdentifier` property

The **`advertisingIdentifier`** property is this device's advertising identifier: a UUID in text form.

## Value

A string of 36 characters with uppercase letters, like `'6D92078A-8246-4BA4-AE5B-76104861E7DC'`.

- Read-only; assigning to it throws `TypeError`.
- `'00000000-0000-0000-0000-000000000000'` when no identifier is available, not `null`.
- Each read gives the current value.

You read all zeros when:

- Running in the simulator (always all zeros in the simulator, regardless of authorization status)
- The app hasn't requested authorization yet
- The user declined
- A configuration on the device restricts the advertising identifier

The first two have been verified in the simulator; the last two come from Apple's documentation and are **not verified in the simulator**.

### Observing changes

There is no event when this value changes. It follows the [authorization status](../app-tracking-transparency/trackingauthorizationstatus.md); read it again when the authorization status may have changed, such as when the app becomes active again. After the user revokes authorization, reading gives all zeros, so don't store the value long-term as if it stays valid.

## Examples

```js
const ZERO = '00000000-0000-0000-0000-000000000000';

/** @returns {string | null} */
function advertisingId() {
  const id = ASIdentifierManager.sharedManager().advertisingIdentifier;
  return id === ZERO ? null : id;
}

console.log(advertisingId());
```

**Effect**: When the user has agreed to tracking and it runs on a device, it prints a UUID. Otherwise it prints `null`. The output on a device is **not verified**.

## Corresponding iOS API

`ASIdentifierManager.advertisingIdentifier.UUIDString`. The native value is an `NSUUID`; here you get its string form directly.

## See also

- [`ATTrackingManager.trackingAuthorizationStatus`](../app-tracking-transparency/trackingauthorizationstatus.md): the authorization status
- [Get the advertising identifier, and do without it when it isn't available](../../guides/tracking-authorization.md#get-the-advertising-identifier-and-skip-it-if-unavailable)
- [Installing `@nacrejs/app-tracking-transparency`](../app-tracking-transparency.md#installation)
