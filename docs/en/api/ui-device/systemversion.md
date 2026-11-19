---
type: reference
native: UIDevice.systemVersion
---

# `UIDevice`: `systemVersion` property

The **`systemVersion`** property is the operating system's version.

## Value

A string such as `'26.1'` or `'26.1.2'`, not a number.

- Read-only. Assigning to it throws `TypeError`, and the value is unchanged.
- It doesn't change while the app is running, so there is no change notification.
- The major version is never less than 26: the lowest system the runtime supports is iOS 26, and the app can't be installed on lower systems.

> **Note:** Don't compare version strings directly. String comparison starts from the first character, so `'9.0' > '26.0'` is `true`. Convert each part to a number before comparing; for how, see [Comparing system versions](../../guides/device-info.md#doing-something-only-on-a-certain-system-version-or-later).

## Examples

```js
const major = Number(UIDevice.currentDevice.systemVersion.split('.')[0]);
console.log(major >= 27 ? 'iOS 27 features available' : 'Using the fallback');
```

**Result**: Prints `iOS 27 features available` on iOS 27 or later; otherwise prints `Using the fallback`.

## Corresponding iOS API

`UIDevice.systemVersion`. In ObjC, the system version is usually checked with `@available(iOS 27.0, *)`; here you compare the major version number from `systemVersion`.

## See also

- [Reading device and system information](../../guides/device-info.md): comparing version numbers part by part
- [`systemName`](systemname.md)
