---
type: reference
---

# `NativeModule`: `events` property

The **`events`** property lists the event names this module fires.

## Value

An array of strings, sorted by name.

- Read-only.
- The array is frozen.
- It never changes after you get the module object, so there's no change notification.

Names not listed here can be listened to as well; they're treated as custom events. See [`addEventListener()`](addeventlistener.md).

## Examples

```js
const example = application.nativeModules.get('example');
console.log(example.events.join(', '));
```

**Result**: Prints the event names declared by the example module, including `tick`.

## Corresponding iOS API

There's no corresponding system API. Event names are set by the native side at registration.

## See also

- [`addEventListener()`](addeventlistener.md)
