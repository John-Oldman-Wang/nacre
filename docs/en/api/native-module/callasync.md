---
type: reference
---

# `NativeModule`: `callAsync()` method

The **`callAsync()`** method calls one of this module's async methods and returns a Promise. JS keeps running while the native side works.

## Syntax

```
callAsync(method, ...args)
```

### Parameters

**`method`**

The method name, a string. It must be in [`methods.async`](methods.md). A non-string is converted to a string first.

**`args`**

Arguments passed to the native side, any number of them. Each must be a [value that can be passed](../native-module.md#values-that-can-be-passed).

### Return value

A `Promise`.

- It fulfills with the value given by the native side, or `null` when the native side gives none.
- It rejects when the native side reports an error; for the reason, see [Errors from native code](../native-module.md#errors-from-native-code).
- It rejects with a `TypeError` when the native side returns a value that can't be passed.
- When the native side drops the call without delivering a result or reporting an error, it rejects, and the `message` contains `finished without calling resolve or reject`. The Promise never stays pending forever.
- When the native side delivers a result twice, the first one counts.

Even when the native side delivers the result right away, the Promise fulfills only after the currently running JS finishes.

### Exceptions

**`TypeError`**

The following cases **throw immediately** instead of returning a Promise, and the native method isn't called:

- No method name: `callAsync: a method name is required`.
- The module has no such method: `callAsync: native module "example" has no method "nope"; sync methods: …; async methods: …`.
- The method is sync: `callAsync: "add" is a sync method of native module "example"; use call("add", …) instead`.
- An argument contains a value that can't be passed; the message is written the same way as in [`call()`](call.md#exceptions).

## Description

For large binary data (several hundred KB or more), have the native side return it directly as an async method's return value: in that case it isn't encoded and is copied only once. In every other case (binary data in arguments, sync method return values, event data, binary data nested in arrays and objects), each chunk is encoded once and decoded once, which gets slower as the data grows. The actual timing is **not measured**.

## Examples

### Calling an async method

```js
const example = application.nativeModules.get('example');
example.callAsync('echoLater', 'hello', 500).then((value) => {
  console.log(value);
});
console.log('callAsync returned');
```

**Result**: Prints `callAsync returned` first, then `hello` about half a second later.

### Native error

```js
const example = application.nativeModules.get('example');
example.callAsync('failLater', 'Offline', 'no network').catch((err) => {
  const e = /** @type {NativeModuleError} */ (err);
  console.log(e.name, e.message, 'code' in e);
});
```

**Result**: Prints `Offline no network false`. The native side gave no error code, so there's no `code`.

## Corresponding iOS API

There's no corresponding system API. For how the native side registers async methods, see [Writing your own native module](../../guides/native-modules.md).

## See also

- [`call()`](call.md): calls sync methods
- [Errors from native code](../native-module.md#errors-from-native-code)
