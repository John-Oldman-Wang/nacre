---
type: reference
---

# `NativeModule`: `removeEventListener()` method

The **`removeEventListener()`** method removes a listener added with [`addEventListener()`](addeventlistener.md). After removal, that callback no longer receives events.

## Syntax

```
removeEventListener(type, callback)
```

### Parameters

**`type`**

The event name, a string.

**`callback`**

The function originally passed to `addEventListener()`. If it was never added, nothing happens.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

Once all listeners for an event name are removed, the native side stops sending that event over. Events fired in the meantime aren't kept, and a listener added later doesn't receive them.

## Examples

```js
const example = application.nativeModules.get('example');
/** @param {NativeModuleEvent} e */
const onTick = (e) => {
  console.log('tick', e.detail);
};
example.addEventListener('tick', onTick);

setTimeout(() => {
  example.removeEventListener('tick', onTick);
}, 1000);
```

**Effect**: After one second the listener is removed, and later `tick` events print nothing.

## Corresponding iOS API

There's no corresponding system API.

## See also

- [`addEventListener()`](addeventlistener.md)
