---
type: reference
---

# `NativeModule`: `methods` property

The **`methods`** property lists this module's method names in two groups: sync and async.

## Value

An object `{ sync, async }`:

- `sync`: an array of sync method names, sorted by name. Call these with [`call()`](call.md).
- `async`: an array of async method names, sorted by name. Call these with [`callAsync()`](callasync.md).

Notes:

- Read-only; assigning to it throws `TypeError`.
- The object and both arrays are frozen.
- Every read returns the same object.
- It never changes after you get the module object, so there's no change notification.

## Examples

```js
const example = application.nativeModules.get('example');
console.log(example.methods.sync.includes('add'));
console.log(example.methods.async.includes('echoLater'));
console.log(example.methods === example.methods);
```

**Result**: Prints `true`, `true`, `true` in order.

## Corresponding iOS API

There's no corresponding system API. Method names and whether each is sync or async are set by the native side at registration.

## See also

- [Sync and async methods](../native-module.md#sync-and-async-methods)
