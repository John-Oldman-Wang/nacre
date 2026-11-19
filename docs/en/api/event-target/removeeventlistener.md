---
type: reference
native: EventTarget.removeEventListener
---

# `EventTarget`: `removeEventListener()` method

The **`removeEventListener()`** method removes a listener registered with [`addEventListener()`](addeventlistener.md).

## Syntax

```
removeEventListener(type, callback)
```

### Parameters

**`type`**

The event name; must match the one used when registering.

**`callback`**

Must be the same function used when registering.

### Return value

None (`undefined`).

### Exceptions

None. A function that was never registered doesn't throw; nothing happens.

## Examples

```js
const onWarning = () => {
  console.log('Low memory');
};
application.addEventListener('memorywarning', onWarning);
application.removeEventListener('memorywarning', onWarning);
```

**Effect**: nothing is printed when a memory warning arrives afterwards.

## Corresponding iOS API

Corresponds to native `removeTarget:action:` and Notification Center's `removeObserver:`.

## See also

- [`addEventListener()`](addeventlistener.md)
