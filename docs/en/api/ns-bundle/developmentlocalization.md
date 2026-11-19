---
type: reference
native: NSBundle.developmentLocalization
---

# `NSBundle`: `developmentLocalization` property

The **`developmentLocalization`** property is the language used during development.

## Value

A string or `null`.

- Read-only; assigning to it throws `TypeError`.
- When none of the user's preferences is supported by the bundle, the system uses this one. When running the acceptance app on the iPhone Air simulator (iOS 27.2), it is `'en'`.

## Examples

```js
console.log(NSBundle.mainBundle.developmentLocalization);
```

**Result**: Prints `en` when running the acceptance app on the iPhone Air simulator (iOS 27.2).

## Corresponding iOS API

`NSBundle.developmentLocalization`.

## See also

- [`NSBundle`](../ns-bundle.md)
