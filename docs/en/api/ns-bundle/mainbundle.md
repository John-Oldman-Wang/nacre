---
type: reference
native: NSBundle.mainBundle
---

# `NSBundle.mainBundle` static property

The **`mainBundle`** static property is the app's own bundle.

## Value

An [`NSBundle`](../ns-bundle.md).

- Read-only; assigning to it throws `TypeError`.
- Every read gives the same object.

## Examples

```js
console.log(NSBundle.mainBundle === NSBundle.mainBundle, NSBundle.mainBundle.bundlePath.endsWith('.app'));
```

**Result**: Prints `true true`.

## Corresponding iOS API

`NSBundle.mainBundle`.

## See also

- [`NSBundle`](../ns-bundle.md)
