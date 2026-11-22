# Calling native modules from JS

This guide covers how to use native modules from the JS side: checking whether a module exists, calling methods, handling errors reported by native code, passing binary data, listening for events, and wrapping a module in functions. It uses [`application.nativeModules`](../api/native-modules.md) and [`NativeModule`](../api/native-module.md). For how to write the native side and package it, see [Writing your own native module](native-modules.md).

## Recommended approach

- **When writing a package that provides a native module, wrap its methods as functions in the package's own JS.** People using the package call ordinary functions without needing to know the module and method names, and the argument and return types can be spelled out. For how, see [Wrapping a module in functions](#wrapping-a-module-in-functions).
- **When you're not sure whether a module is installed, ask with [`has()`](../api/native-modules/has.md) first.** Calling [`get()`](../api/native-modules/get.md) directly with an unregistered name throws `TypeError`.
- **Use synchronous methods only for things that can be answered quickly.** While a synchronous method runs, JS and the UI wait for it to return.
- **Have native code hand large binary data back as an asynchronous method's return value.** In that case it isn't encoded and is copied only once; see [Passing and receiving binary data](#passing-and-receiving-binary-data).

## First example

The examples below use the example module `@nacrejs/example-module`. It registers the name `example`, and most of its methods hand back the value they receive. First install it in your project and regenerate `ios/`.

```js
/// <reference types="@nacrejs/types" />

const modules = application.nativeModules;
console.log(modules.names.join(', '));

const example = modules.get('example');
console.log(example.methods.sync.join(', '));

// Synchronous method: get the return value on the spot
console.log(example.call('add', 1, 2));

// Asynchronous method: returns a Promise
example.callAsync('echoLater', 'hello', 500).then((value) => {
  console.log('After 500 ms:', value);
});

// Events
example.addEventListener('tick', (e) => {
  console.log('Got tick, data is', JSON.stringify(e.detail));
});
example.call('emit', 'tick', { n: 1 });
```

**Effect**

- The console prints, in order: the registered module names (including `example`), the example module's synchronous method names, `3`, and `Got tick, data is {"n":1}`.
- About half a second later, it prints `After 500 ms: hello`.

This code has not been run as a whole in the simulator. Each member it uses has been run in the acceptance tests.

The sections below reuse `example` from here.

## Checking whether a module exists

```js
if (application.nativeModules.has('example')) {
  console.log(application.nativeModules.get('example').name);
} else {
  console.log('This app doesn\'t have the example module installed');
}
```

**Effect**: Projects with `@nacrejs/example-module` installed print `example`; those without it print `This app doesn't have the example module installed`.

## Handling errors reported by native code

When the native side reports an error, a synchronous method throws it, and an asynchronous method's Promise is rejected. In both cases you get an `Error` whose `name` and `message` come from native code, plus `code` when native code provided an error code.

```js
try {
  example.call('fail', 'NotFound', 'no such thing', 404);
} catch (err) {
  const e = /** @type {NativeModuleError} */ (err);
  console.log(e.name, e.message, e.code);
}

example.callAsync('failLater', 'Offline', 'no network').catch((err) => {
  const e = /** @type {NativeModuleError} */ (err);
  console.log(e.name, e.message, 'code' in e);
});
```

**Effect**: The console prints `NotFound no such thing 404`, followed by `Offline no network false`.

For what's on the error object, see [Errors reported by native code](../api/native-module.md#errors-from-native-code). The module keeps working normally after an error.

## Passing and receiving binary data

Pass binary data as an `ArrayBuffer` or a view of one (`Uint8Array`, etc.); the native side receives the bytes. Binary data handed back by native code is an `ArrayBuffer` on the JS side.

```js
const digest = example.call('sha256', new Uint8Array([97, 98, 99]));
if (digest instanceof ArrayBuffer) {
  console.log(digest.byteLength);
}
```

**Effect**: The console prints `32`.

- Binary data can be inside arrays and objects.
- When you pass a view, only the bytes it covers are passed, not the whole underlying `ArrayBuffer`.
- The `ArrayBuffer` JS receives is a separate copy; modifying it doesn't affect the data on the native side.
- For large data (hundreds of KB or more), have native code hand it back directly as an asynchronous method's return value: in that case it isn't encoded and is copied only once. Otherwise, each chunk is encoded once and decoded once, and the larger the data, the slower it is. The actual time taken is **not measured**.

## Passing values like dates and `Map`

Arguments can only be `null`, booleans, finite numbers, strings, arrays, plain objects, and binary data; see [What values can be passed](../api/native-module.md#values-that-can-be-passed). Convert values like dates and `Map` into a passable form yourself first.

```js
const when = new Date();
const tags = new Map([['a', 1]]);
example.call('echo', { at: when.getTime(), tags: Array.from(tags) });
```

**Effect**: Native code receives `{ at: milliseconds, tags: [['a', 1]] }`. Passing `when` or `tags` directly throws `TypeError` on the spot, and the native method isn't called.

## Listening for events and stopping

```js
/** @param {CustomEvent} e */
const onTick = (e) => {
  console.log('tick', e.detail);
};
example.addEventListener('tick', onTick);
example.call('emit', 'tick', 1);
console.log('emit has returned');

setTimeout(() => {
  example.removeEventListener('tick', onTick);
}, 1000);
```

**Effect**: The console first prints `emit has returned`, then `tick 1`. One second later the listener is removed, and later `tick` events print nothing.

- Events aren't delivered at the moment native code emits them: the runtime queues them until the currently running JS finishes. So a listener's callback never interrupts code that is running.
- Events native code emits while there are no listeners aren't kept. A listener added later doesn't receive the ones emitted before it was added.

## Wrapping a module in functions

When writing a package that provides a native module, wrap its methods as functions in the package's own JS, and spell out the argument and return types.

```js
const native = () => application.nativeModules.get('example');

/**
 * @param {ArrayBuffer | ArrayBufferView} data
 * @returns {ArrayBuffer}
 */
export function sha256(data) {
  return /** @type {ArrayBuffer} */ (native().call('sha256', data));
}
```

**Effect**: People using the package write `sha256(bytes)` and get an `ArrayBuffer`.

`get()` returns the same object for the same name every time, so you can fetch it fresh on each call without storing it yourself.

## See also

- [`application.nativeModules`](../api/native-modules.md): getting a module by name
- [`NativeModule`](../api/native-module.md): calling methods, listening for events, what values can be passed, errors reported by native code
- [Writing your own native module](native-modules.md): the native side
