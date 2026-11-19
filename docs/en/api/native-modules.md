---
type: reference
status: partial
---

# `application.nativeModules`

**`application.nativeModules`** represents all native modules registered in this app. A native module is a piece of code written in ObjC or Swift, registered under a name, that provides a set of methods callable from JS and a set of events. The app team's own native code and third-party services that only ship a native SDK (risk control, crash reporting, payments, and the like) are all exposed to JS through it.

There is only one `application.nativeModules` in the whole app, and it is available at any time, including at the top level of a script. Its class is `NativeModules`. Use [`get()`](native-modules/get.md) to get a module by name; you get a [`NativeModule`](native-module.md) object, and calling methods and listening for events both happen on `NativeModule`.

Modules come in with npm packages. A package that provides a native module is the same kind of package as a [capability package](capabilities.md): after installing it and regenerating `ios/` once, its native code is compiled into the app, and the module is registered when the app launches. For packages that aren't installed, their modules don't exist.

Such packages usually include a JS layer that wraps `call('methodName', …)` into ordinary functions. People using the package call those functions and don't need to touch `application.nativeModules` directly. Those who use it directly are the people writing such packages.

**Inheritance**: `NSObject` → `NativeModules`

For how to call modules from the JS side and handle errors and binary data, see the guide [Calling native modules from JS](../guides/call-native-modules.md). For how to write the native side and make it into a package, see [Writing your own native module](../guides/native-modules.md).

## Constructor

Can't be created with `new`: `new NativeModules()` throws `TypeError: Illegal constructor: NativeModules is created by the runtime, not by new`. The only instance comes from the `nativeModules` property of [`application`](application.md); every read returns the same object, and there is no setter.

## Properties

| Property | Description |
| --- | --- |
| [`names`](native-modules/names.md) <small>read-only</small> | The registered module names, sorted by name |

## Functions

| Function | Description |
| --- | --- |
| [`has()`](native-modules/has.md) | Whether a module with a given name is registered |
| [`get()`](native-modules/get.md) | Gets a module by name |

## Examples

The following uses the example module `@nacrejs/example-module`. It registers under the name `example`, and most of its methods hand back the values they receive unchanged. First install it in the project and regenerate `ios/`.

```js
/// <reference types="@nacrejs/types" />

const modules = application.nativeModules;
console.log(modules.names.join(', '));

const example = modules.get('example');
console.log(example.methods.sync.join(', '));

// Synchronous method: get the return value right away
console.log(example.call('add', 1, 2));

// Asynchronous method: returns a Promise
example.callAsync('echoLater', 'hello', 500).then((value) => {
  console.log('after 500 ms:', value);
});

// Events
example.addEventListener('tick', (e) => {
  console.log('got tick, data is', JSON.stringify(e.detail));
});
example.call('emit', 'tick', { n: 1 });
```

**Effect**

- The console prints, in order, the registered module names (including `example`), the example module's synchronous method names, `3`, and `got tick, data is {"n":1}`.
- About half a second later it prints `after 500 ms: hello`.

This code has not been run as a whole in the simulator. Every member it uses has been run in the acceptance tests.

## Corresponding iOS API

The native side registers modules with the runtime's public header `NacreModule.h`; there is no corresponding system API. For how to write the native side, see [Writing your own native module](../guides/native-modules.md).

## See also

- [`NativeModule`](native-module.md): a single module; calling methods, listening for events, what values can be passed, errors reported by the native side
- [Calling native modules from JS](../guides/call-native-modules.md): checking whether a module exists, handling errors, passing binary data, wrapping a module in functions
- [Writing your own native module](../guides/native-modules.md): how to write the native side, register it, and make it into a package
- [Core and capability packages](capabilities.md): how packages are installed into a project
- [`application`](application.md): the object `nativeModules` lives on
