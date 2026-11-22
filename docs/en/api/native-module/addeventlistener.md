---
type: reference
---

# `NativeModule`: `addEventListener()` method

The **`addEventListener()`** method listens to events fired by this module. It works like any other `EventTarget`; the event object has an extra `detail`, which is the data provided by the native side.

## Syntax

```
addEventListener(type, callback[, options])
```

### Parameters

**`type`**

The event name, a string. The event names the module fires are listed in [`events`](events.md).

You can also listen to names not in `events` without an error: such a name is treated as a custom event. The native side never fires it; it triggers only when you fire it yourself with `dispatchEvent()`.

**`callback`**

The function called when the event arrives. It receives an [event object](#event-object). Passing `null` does nothing.

**`options`** <small>optional</small>

Same as `addEventListener()` on `EventTarget`, for example `{ once: true }`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

`type` starts with `@`: `addEventListener has no value "@x"; names starting with @ are reserved for the runtime`.

## Event object

A [`CustomEvent`](../custom-event.md), with one extra read-only field, `detail`:

| Field | Type | Meaning |
| --- | --- | --- |
| `type` | String | The event name |
| `target` | `NativeModule` | The module that fired the event |
| [`detail`](../custom-event/detail.md) | See [Values that can be passed](../native-module.md#values-that-can-be-passed) | The data provided by the native side. `null` when the native side provides none |

The event can't be canceled: `cancelable` is `false`, and calling `preventDefault()` has no effect.

## Description

- **An event isn't delivered at the moment the native side fires it.** It's delivered after the currently running JS finishes, so a callback never interrupts code in the middle of running.
- **Events fired in a row arrive in the order they were fired.**
- **Events fired by the native side while there's no listener aren't kept.** A listener added later doesn't receive events fired before it was added.
- Events fired by the native side on a background thread are delivered as usual, and the callback runs on the main thread.

## Examples

```js
const example = application.nativeModules.get('example');
example.addEventListener('tick', (e) => {
  console.log('tick', JSON.stringify(e.detail));
});
example.call('emit', 'tick', { n: 1 });
console.log('emit returned');
```

**Result**: Prints `emit returned` first, then `tick {"n":1}`.

## Corresponding iOS API

There's no corresponding system API. For how the native side fires events, see [Writing your own native module](../../guides/native-modules.md).

## See also

- [`removeEventListener()`](removeeventlistener.md)
- [`events`](events.md)
