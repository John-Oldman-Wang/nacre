---
type: reference
status: partial
---

# `NativeModule`

**`NativeModule`** represents a native module registered in the app: a piece of code written in ObjC or Swift that provides a set of methods and a set of events under a name. You get one from [`application.nativeModules.get()`](native-modules/get.md).

A module provides three things:

- **Sync methods**: called with [`call()`](native-module/call.md). The call returns only after the native side finishes, and the return value is the value the native side gives back.
- **Async methods**: called with [`callAsync()`](native-module/callasync.md), which returns a Promise.
- **Events**: listened to with [`addEventListener()`](native-module/addeventlistener.md). The event object's `detail` is the data the native side provides.

The module name, method names, and event names are all set by the native side when it registers. On the JS side you read them from [`name`](native-module/name.md), [`methods`](native-module/methods.md), and [`events`](native-module/events.md).

**Inheritance**: `EventTarget` → `NativeModule`

For how to call methods and how to handle errors and binary data, see the guide [Calling native modules from JS](../guides/call-native-modules.md).

## Constructor

It can't be created with `new`: `new NativeModule()` throws `TypeError: Illegal constructor: NativeModule is created by the runtime, use application.nativeModules.get(name)`. Get it from [`application.nativeModules.get()`](native-modules/get.md); the same name returns the same object every time.

## Instance properties

These three values never change after you get the module object, so there's no change notification.

| Property | Description |
| --- | --- |
| [`name`](native-module/name.md) <small>read-only</small> | The name used at registration |
| [`methods`](native-module/methods.md) <small>read-only</small> | Sync and async method names |
| [`events`](native-module/events.md) <small>read-only</small> | The event names this module fires |

## Instance methods

| Method | Description |
| --- | --- |
| [`call()`](native-module/call.md) | Calls a sync method and gets the return value immediately |
| [`callAsync()`](native-module/callasync.md) | Calls an async method and returns a Promise |
| [`addEventListener()`](native-module/addeventlistener.md) | Listens to the module's events |
| [`removeEventListener()`](native-module/removeeventlistener.md) | Stops listening |

It also inherits `dispatchEvent()` from `EventTarget`.

## Events

Events are defined by the module itself; their names are listed in [`events`](native-module/events.md). For the event object, see [`addEventListener()`](native-module/addeventlistener.md#event-object).

## Sync and async methods

Whether a method is sync or async is decided by the native side when it registers. Sync methods can only be called with `call()`, and async methods only with `callAsync()`. Calling the wrong one throws a `TypeError` immediately, and the message says which one to use.

While a sync method runs, both JS and the UI wait for it to return. So the native side makes only things that can be answered very quickly into sync methods (reading a value already in memory, doing a small calculation), and makes everything else async.

## Values that can be passed

Arguments, return values, and an event's `detail` can only be the following types, nested in any combination:

| Value in JS | Passing to native | Returned from native |
| --- | --- | --- |
| `null` | Allowed | Is `null` |
| `true` / `false` | Allowed | Is a boolean |
| Finite number | Allowed | Is a number |
| String | Allowed | Is a string |
| Array | Allowed | Is an array |
| Plain object (written as `{}`, or with no prototype) | Allowed | Is a plain object |
| `ArrayBuffer` | Allowed | Is an `ArrayBuffer` |
| Views such as `Uint8Array` and `DataView` | Allowed; the bytes the view covers are passed | Comes back as an `ArrayBuffer`, not a view |
| `undefined` | Becomes `null` as an argument or array element; as an object member it's the same as omitting the member | Never appears |

No other values can be passed: functions, `NaN`, `Infinity`, `BigInt`, `Symbol`, `Date`, `Map`, `Set`, regular expressions, `Error`, `Promise`, class instances, native objects (views, colors, `Blob`, and so on), self-referencing structures, and strings containing lone surrogates. Passing one throws a `TypeError` immediately and the native method isn't called. For the exact error messages, see [`call()`](native-module/call.md#exceptions).

- **The order of object members isn't guaranteed.** An object sent over and returned may have its members in a different order than when it was written.
- **Integers beyond `Number.MAX_SAFE_INTEGER` lose precision.** A 64-bit integer from the native side comes back as a JS number. Have the native side send large integers as strings.
- **The same object can appear in two places.** On the native side it becomes two values with the same content.
- **Binary data can be placed inside arrays and objects.** The `ArrayBuffer` JS receives is a separate copy; modifying it doesn't affect the data on the native side.

When the native side returns a value that isn't in the table (a date object, for example), a sync method throws a `TypeError`, and an async method's Promise rejects with a `TypeError`. When an event carries such data, the event is dropped, the runtime prints a warning, and later events arrive as usual. The value is never replaced with something else.

## Errors from native code

An error reported by the native side is an `Error` on the JS side: thrown by a sync method, or the rejection reason of an async method's Promise. In the type definitions it's called `NativeModuleError`:

| Property | Type | When present | Meaning |
| --- | --- | --- | --- |
| `name` | String | Always | The error name given by the native side. `'Error'` when the native side gives no name |
| `message` | String | Always | The description given by the native side |
| `code` | Number | Only when the native side gives one | The error code given by the native side |
| `domain` | String | When the error comes from iOS or a third-party SDK | The iOS error domain, such as `'NSCocoaErrorDomain'`. Together with `code`, it identifies the kind of error |

- When `name` is `'TypeError'` or `'RangeError'`, the error object is an instance of that class, and `err instanceof TypeError` holds. With any other name it's an instance of `Error`; tell them apart by `err.name`.
- If the native method throws an ObjC exception, JS also gets an `Error` whose `name` is the exception's name. The app doesn't exit. **Not verified in the simulator.**
- The module keeps working after an error.

## Examples

First install the example module `@nacrejs/example-module` in the project and regenerate `ios/`. It registers under the name `example`.

```js
/// <reference types="@nacrejs/types" />

const example = application.nativeModules.get('example');
console.log(example.name, example.methods.async.join(', '));

console.log(example.call('add', 1, 2));

example.callAsync('echoLater', 'hello', 500).then((value) => {
  console.log(value);
});
```

**Effect**

- First prints `example` and the example module's async method names, then prints `3`.
- About half a second later prints `hello`.

## Corresponding iOS API

There's no corresponding system API. The native side registers methods and events using the runtime's public header `NacreModule.h`; see [Writing your own native module](../guides/native-modules.md).

## See also

- [`application.nativeModules`](native-modules.md): gets a module by name
- [Calling native modules from JS](../guides/call-native-modules.md): handling errors, passing binary data, listening to events, wrapping a module in functions
- [How the runtime works](how-it-works.md): JS and the UI run on the same thread, so the UI waits while a sync method runs
