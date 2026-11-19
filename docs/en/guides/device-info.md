# Reading device and system information

This guide shows how to use [`UIDevice`](../api/ui-device.md) to check the system version and to give this device an identifier. The details of each property are on the [`UIDevice`](../api/ui-device.md) reference page.

## Recommended approach

- **Use the system version only for fallbacks, not to guess capabilities.** When a capability exists only on newer systems, read the major version from [`systemVersion`](../api/ui-device/systemversion.md) and take a different path on older versions. Compare numbers, not strings.
- **Read the version once and store it as a number.** These values don't change while the app runs. Compute the major version at the start of the script and use the variable afterward; there's no need to read and split it again every time.
- **To identify a user, don't use the device identifier.** [`identifierForVendor`](../api/ui-device/identifierforvendor.md) changes after the app is uninstalled and reinstalled, and is different on a new phone. Sign-in state and user identity should come from a token issued by your server. `identifierForVendor` is suited to uses that tolerate occasional changes, such as counting how many devices there are or giving a signed-out device a temporary number.

## First example

The following code prints information about the device and system. It needs no UI and goes at the top level of `main.js`.

```js
const device = UIDevice.currentDevice;

console.log(device.systemName + ' ' + device.systemVersion);
console.log(device.model);
console.log(device.userInterfaceIdiom);
```

**Result**: On an iPhone, the console prints three lines like `iOS 26.1`, `iPhone`, and `phone`.

The acceptance tests read these properties in the `sceneconnect` callback. Reading them at the top level of a script is **not verified in the simulator**.

The sections below reuse `device` from here.

## Doing something only on a certain system version or later

The first part of `systemVersion` is the major version. Extract it, convert it to a number, and then compare:

```js
const major = Number(device.systemVersion.split('.')[0]);

if (major >= 27) {
  console.log('iOS 27 features available');
} else {
  console.log('Using the fallback');
}
```

**Result**: On iOS 27 or later, prints `iOS 27 features available`; otherwise prints `Using the fallback`.

The major version is never lower than 26: the oldest system the runtime supports is iOS 26, and the app can't be installed on older systems.

> **Note:** Don't compare version strings directly. Compared as strings, `'9.0' > '26.0'` is `true`.

To compare the minor version too, convert each part to a number and compare them part by part:

```js
/**
 * @param {string} a
 * @param {string} b
 * @returns {number} positive if a is newer than b, negative if older, 0 if equal
 */
function compareVersion(a, b) {
  const x = a.split('.').map(Number);
  const y = b.split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const diff = (x[i] || 0) - (y[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

console.log(compareVersion(device.systemVersion, '26.2') >= 0);
```

**Result**: Prints `true` if the system is iOS 26.2 or newer, and `false` otherwise. **This example is not verified in the simulator.**

## Giving this device an identifier

```js
const id = device.identifierForVendor;
if (id !== null) {
  console.log(id);
}
```

**Result**: Prints a UUID like `6F9619FF-8B86-D011-B42D-00C04FC964FF`, with uppercase letters. Reading it several times in the same run gives the same value.

It can be `null`: after the device restarts and before the user unlocks it for the first time, the system can't provide this value yet, so check before using it. For when this value changes, see [`identifierForVendor`](../api/ui-device/identifierforvendor.md).

For an identifier that doesn't depend on system rules, generate one yourself ([`crypto.randomUUID()`](../api/crypto.md)) and save it. A value saved in [local storage](../api/storage.md) is deleted along with the app when it's uninstalled (**not verified in the simulator**; this comes from the iOS definition). Whether a value saved in the [Keychain](../api/keychain.md) (requires installing `@nacrejs/keychain` first) survives uninstallation isn't promised by Apple, so you can't rely on it. When you need an identifier that stays the same across uninstalls and across devices, only your server can issue one, per account.

## See also

- [`UIDevice`](../api/ui-device.md)
- [`crypto`](../api/crypto.md)
- [Local storage](../api/storage.md), [Keychain](../api/keychain.md)
