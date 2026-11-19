---
type: reference
native: ASIdentifierManager
status: partial
---

# `ASIdentifierManager`

**`ASIdentifierManager`** gives this device's advertising identifier.

The "advertising identifier" is a UUID the system assigns to the device. All apps on the same device read the same value, and ad platforms use it to tell whether two ad impressions happened on the same device. When the user hasn't agreed to tracking, the app reads an all-zero value, `'00000000-0000-0000-0000-000000000000'`. Whether the user has agreed to tracking is requested and read through [`ATTrackingManager`](app-tracking-transparency.md).

Install `@nacrejs/app-tracking-transparency` first; for how, see [`ATTrackingManager`](app-tracking-transparency.md#installation). For what capability packages are, see [Core and capability packages](capabilities.md).

**Inheritance**: `EventTarget` → `NSObject` → `ASIdentifierManager`

## Constructor

It can't be created with `new`. There is only the one instance the system provides; get it from [`ASIdentifierManager.sharedManager()`](as-identifier-manager/sharedmanager.md).

`new ASIdentifierManager()` throws `TypeError: Illegal constructor: ASIdentifierManager is created by the runtime, not by new`.

## Static methods

[`ASIdentifierManager.sharedManager()`](as-identifier-manager/sharedmanager.md)

Gets the system's single instance. Every call gives the same object.

## Instance properties

Also inherits the properties of `NSObject`.

| Property | Description |
| --- | --- |
| [`advertisingIdentifier`](as-identifier-manager/advertisingidentifier.md) <small>read-only</small> | The advertising identifier. All zeros when no identifier is available |

## Examples

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/app-tracking-transparency" />

const ZERO = '00000000-0000-0000-0000-000000000000';
const id = ASIdentifierManager.sharedManager().advertisingIdentifier;
console.log(id === ZERO ? 'No advertising identifier available' : id);
```

**Effect**: When the user has agreed to tracking and it runs on a device, it prints a UUID like `6D92078A-8246-4BA4-AE5B-76104861E7DC`. In the simulator, or before authorization has been requested, it prints `No advertising identifier available`. The output on a device is **not verified**.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[ASIdentifierManager sharedManager]` | `ASIdentifierManager.sharedManager()` |
| `manager.advertisingIdentifier.UUIDString` | `manager.advertisingIdentifier` |

## See also

- [`ATTrackingManager`](app-tracking-transparency.md): requests tracking authorization; the advertising identifier has its real value only after authorization
- [Requesting tracking authorization](../guides/tracking-authorization.md): get the advertising identifier, and do without it when it isn't available
- [`UIDevice`](ui-device.md): `identifierForVendor`, a device identifier that needs no authorization
