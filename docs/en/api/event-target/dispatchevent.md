---
type: reference
native: EventTarget.dispatchEvent
---

# `EventTarget`: `dispatchEvent()` method

The **`dispatchEvent()`** method dispatches an event synchronously: it calls every listener on this object for this event name in turn and returns only after all of them have run.

## Syntax

```
dispatchEvent(event)
```

### Parameters

**`event`**

An instance of [`Event`](../event.md) or one of its subclasses.

### Return value

A boolean. Returns `false` when a listener called `preventDefault()` and the event's `cancelable` is `true`; returns `true` otherwise (verified by testing).

### Exceptions

**`TypeError`**

The argument isn't an `Event`: `Failed to execute 'dispatchEvent': parameter 1 is not of type 'Event'.`

## Description

- An exception thrown by one listener doesn't affect the listeners after it and isn't thrown out of `dispatchEvent()`. The runtime fires [`error`](../application/error-event.md) on `application` for it (verified by testing).
- A listener removed during dispatch doesn't run this time if its turn hasn't come yet. A listener added during dispatch doesn't run this time; it runs on the next dispatch. Both match the browser.
- Don't give custom events the same names as events the system fires.

## Examples

```js
application.addEventListener('beforelogout', (e) => {
  e.preventDefault();
});

const event = new Event('beforelogout', { cancelable: true });
const ok = application.dispatchEvent(event);
console.log(ok);
```

**Result**: the console prints `false`, meaning a listener called `preventDefault()`.

## Corresponding iOS API

There's no corresponding system API. Corresponds to the browser's `dispatchEvent()`.

## See also

- [`Event()`](../event/constructor.md): constructing the event to dispatch
