---
type: reference
native: NSBundle.mainBundle.bundleIdentifier
---

# `Application`: `bundleIdentifier` property

The **`bundleIdentifier`** property is the app's bundle ID: the app's unique identifier in the system, written like a reversed domain name.

## Value

A string, such as `'com.example.shop'`.

- Read-only. Assigning to it throws `TypeError`.
- The value comes from `bundleId` in the project's [`nacre.config.json`](../../guides/project-config.md). Equal to `info.CFBundleIdentifier`.
- It doesn't change while the app runs, so there is no change event.

## Examples

```js
console.log(application.bundleIdentifier);
```

**Result**: an app whose bundle ID is `com.example.shop` prints `com.example.shop`.

## Corresponding iOS API

`NSBundle.mainBundle.bundleIdentifier`.

## See also

- [`info`](info.md)
