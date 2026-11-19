---
type: reference
---

# `NativeModule`: `call()` method

The **`call()`** method calls one of this module's sync methods. It returns only after the native side finishes, and the return value is the value the native side gives back.

While a sync method runs, both JS and the UI wait for it to return.

## Syntax

```
call(method, ...args)
```

### Parameters

**`method`**

The method name, a string. It must be in [`methods.sync`](methods.md). A non-string is converted to a string first.

**`args`**

Arguments passed to the native side, any number of them. Each must be a [value that can be passed](../native-module.md#values-that-can-be-passed).

### Return value

The value given by the native side; see [Values that can be passed](../native-module.md#values-that-can-be-passed). `null` when the native side returns nothing.

### Exceptions

**`TypeError`**

In the following cases the native method isn't called:

- No method name: `call: a method name is required`.
- The module has no such method: `call: native module "example" has no method "nope"; sync methods: …; async methods: …`, listing all method names.
- The method is async: `call: "echoLater" is an async method of native module "example"; use callAsync("echoLater", …) instead`.
- An argument contains a value that can't be passed; the message says which argument and where in it: `example.echo: argument 1.list[1].fn is a function; only null, booleans, finite numbers, strings, arrays, plain objects and ArrayBuffers (or views on them) can be passed to a native module`.
- It isn't called on the module object (for example, `call` taken off and called on its own): `call: Illegal invocation`.

After the native side has run:

- The native side returned a value that can't be passed: `TypeError`.

**Errors from the native side**

When the native side reports an error, the error it gives is thrown; see [Errors from native code](../native-module.md#errors-from-native-code).

## Examples

### Calling a sync method

```js
const example = application.nativeModules.get('example');
console.log(example.call('add', 1, 2));
```

**Result**: Prints `3`.

### Passing a value that can't be passed

```js
const example = application.nativeModules.get('example');
try {
  example.call('echo', /** @type {any} */ ({ list: [1, { fn() {} }] }));
} catch (err) {
  console.log(String(err));
}
```

**Result**: Prints `TypeError: example.echo: argument 1.list[1].fn is a function; only null, booleans, finite numbers, strings, arrays, plain objects and ArrayBuffers (or views on them) can be passed to a native module`.

### Native error

```js
const example = application.nativeModules.get('example');
try {
  example.call('fail', 'NotFound', 'no such thing', 404);
} catch (err) {
  const e = /** @type {NativeModuleError} */ (err);
  console.log(e.name, e.message, e.code);
}
```

**Result**: Prints `NotFound no such thing 404`.

## Corresponding iOS API

There's no corresponding system API. For how the native side registers sync methods, see [Writing your own native module](../../guides/native-modules.md).

## See also

- [`callAsync()`](callasync.md): calls async methods
- [Values that can be passed](../native-module.md#values-that-can-be-passed)
- [Errors from native code](../native-module.md#errors-from-native-code)
