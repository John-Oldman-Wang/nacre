---
type: reference
native: NSBundle.bundleIdentifier
---

# `NSBundle`: `bundleIdentifier` property

The **`bundleIdentifier`** property is the bundle identifier.

## Value

A string or `null`, such as `com.example.shop`.

- Read-only; assigning to it throws `TypeError`.
- For the app's bundle, it is the same as [`application.bundleIdentifier`](../application/bundleidentifier.md).

## Examples

```js
console.log(NSBundle.mainBundle.bundleIdentifier);
```

**Result**: Prints the app's bundle identifier.

## Corresponding iOS API

`NSBundle.bundleIdentifier`.

## See also

- [`NSBundle`](../ns-bundle.md)
