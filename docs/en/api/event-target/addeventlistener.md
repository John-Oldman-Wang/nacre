---
type: reference
native: EventTarget.addEventListener
---

# `EventTarget`: `addEventListener()` method

The **`addEventListener()`** method registers a listener that's called when an event with a given name is dispatched on this object.

## Syntax

```
addEventListener(type, callback)
addEventListener(type, callback, { once })
```

### Parameters

**`type`**

The event name, a string. For the names of events the system fires, see the "Events" section of each class; it can also be a name you define yourself. Listening for an unrecognized name doesn't throw: it's treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`.

**`callback`**

A function that receives the event object. Passing `null` does nothing.

**`options.once`**

A boolean, optional. `true` means the listener is removed automatically after firing once.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- Too few arguments: `Failed to execute 'addEventListener': 2 arguments required.`
- `callback` isn't a function: `Failed to execute 'addEventListener': parameter 2 is not of type 'Function'.`

## Description

- For the same event name, registering the same function more than once counts only once (verified by testing).
- Callbacks for native events don't run synchronously at the moment something happens; they run later. See [How the runtime works](../how-it-works.md#events).
- An exception thrown by a listener doesn't affect the other listeners for the same event; the runtime fires [`error`](../application/error-event.md) on `application`.

## Examples

```js
application.addEventListener('memorywarning', () => {
  console.log('Low memory');
}, { once: true });
```

**Effect**: prints `Low memory` the first time a memory warning arrives, and never again.

## Corresponding iOS API

Native target-action, Notification Center's `addObserver:`, and delegate methods all become `addEventListener()` in JS. The comparison table on each class page gives the specific correspondence.

## See also

- [`removeEventListener()`](removeeventlistener.md)
