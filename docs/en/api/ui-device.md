---
type: reference
native: UIDevice
status: partial
---

# `UIDevice`

**`UIDevice`** represents the device the app is running on. From it you read the kind of device, the operating system's name and version, and an identifier for telling devices apart.

There is only one `UIDevice` object in the whole app, provided by the runtime and obtained from [`UIDevice.currentDevice`](ui-device/currentdevice.md).

All seven pieces of information are read-only and don't change while the app is running; read them once and keep them.

**Inheritance**: `EventTarget` → `NSObject` → `UIDevice`

For how to check the system version and give the device an identifier, see the guide [Reading device and system information](../guides/device-info.md).

## Constructor

It can't be created with `new`. `new UIDevice()` throws `TypeError: Illegal constructor: UIDevice is created by the runtime, not by new`. Get the instance from [`UIDevice.currentDevice`](ui-device/currentdevice.md).

## Static properties

[`UIDevice.currentDevice`](ui-device/currentdevice.md) <small>read-only</small>

The device the app is running on. Every read returns the same object.

## Instance properties

Also inherits properties from `NSObject`. The properties below are all read-only and don't change while the app is running.

| Property | Description |
| --- | --- |
| [`systemName`](ui-device/systemname.md) <small>read-only</small> | The operating system's name; `'iOS'` on iPhone |
| [`systemVersion`](ui-device/systemversion.md) <small>read-only</small> | The operating system's version, a string such as `'26.1'` |
| [`model`](ui-device/model.md) <small>read-only</small> | The kind of device; `'iPhone'` on iPhone. Not the specific model |
| [`localizedModel`](ui-device/localizedmodel.md) <small>read-only</small> | `model` translated into the system language |
| [`name`](ui-device/name.md) <small>read-only</small> | The device's name. The name the user gave the device can't be read |
| [`userInterfaceIdiom`](ui-device/userinterfaceidiom.md) <small>read-only</small> | The kind of interface; `'phone'` on iPhone |
| [`identifierForVendor`](ui-device/identifierforvendor.md) <small>read-only</small> | A UUID shared on this device by apps from the same developer; may be `null` |

## Examples

The code below prints device and system information. It needs no UI and goes at the top level of `main.js`.

```js
const device = UIDevice.currentDevice;

console.log(device.systemName + ' ' + device.systemVersion);
console.log(device.model);
console.log(device.userInterfaceIdiom);
```

**Result**: On iPhone, the console prints three lines like:

```
iOS 26.1
iPhone
phone
```

The acceptance tests read these properties in the `sceneconnect` callback. Reading them at the top level of a script is **not verified in the simulator**.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `UIDevice.currentDevice` | `UIDevice.currentDevice` |
| `device.systemVersion` | `device.systemVersion` |
| `device.userInterfaceIdiom == UIUserInterfaceIdiomPhone` | `device.userInterfaceIdiom === 'phone'` |
| `device.identifierForVendor.UUIDString` | `device.identifierForVendor` |
| `if (@available(iOS 27.0, *))` | Compare the major version number from `systemVersion` |

## See also

- [Reading device and system information](../guides/device-info.md): comparing system versions, giving the device an identifier
- [`application`](application.md): information about the app itself, such as the version number and bundle ID
- [`crypto`](crypto.md): `randomUUID()`, for generating an identifier yourself
- [Local storage](storage.md), [Keychain](keychain.md): saving an identifier you generated
- [`UITraitCollection`](ui-trait-collection.md): the screen scale and whether it's dark or light, which aren't on `UIDevice`
