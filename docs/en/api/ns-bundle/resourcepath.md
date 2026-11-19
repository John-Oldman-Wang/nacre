---
type: reference
native: NSBundle.resourcePath
---

# `NSBundle`: `resourcePath` property

The **`resourcePath`** property is the absolute path of the directory in the bundle that holds resources.

## Value

A string or `null`.

- Read-only; assigning to it throws `TypeError`.
- In the app's bundle, it is the same as [`bundlePath`](bundlepath.md) (verified by testing).

## Examples

```js
const main = NSBundle.mainBundle;
console.log(main.resourcePath === main.bundlePath);
```

**Result**: Prints `true`.

## Corresponding iOS API

`NSBundle.resourcePath`.

## See also

- [`NSBundle`](../ns-bundle.md)
