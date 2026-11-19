---
type: reference
native: EventTarget
status: partial
---

# `EventTarget`

**`EventTarget`** represents an object that can fire events and be listened to. It's the base class of every object that fires events: [`application`](application.md), scenes, windows, views, controls, and all other native classes inherit from it. It's provided by the runtime as a global class and can be created directly with `new`.

The event model has just three rules:

- Events are dispatched only to the object the listener is registered on; there's no capturing or bubbling.
- The only option of [`addEventListener()`](event-target/addeventlistener.md) is `once`.
- Listeners can only be functions.

**Inheritance**: `EventTarget`

## Constructor

[`EventTarget()`](event-target/constructor.md)

Creates a standalone event target for dispatching events between parts of the app's own code.

## Instance methods

| Method | Description |
| --- | --- |
| [`addEventListener()`](event-target/addeventlistener.md) | Registers a listener |
| [`removeEventListener()`](event-target/removeeventlistener.md) | Removes a listener |
| [`dispatchEvent()`](event-target/dispatchevent.md) | Dispatches an event synchronously |

## Examples

```js
const bus = new EventTarget();
bus.addEventListener('login', (e) => {
  console.log('Received', e.type);
});
bus.dispatchEvent(new Event('login'));
```

**Result**: before `dispatchEvent()` returns, the console prints `Received login`.

## Comparison with the browser

| Browser | Nacre |
| --- | --- |
| The `capture`, `passive`, and `signal` options of `addEventListener()` | None. Only `once` |
| A listener can be an object with `handleEvent()` | Not allowed. Functions only |
| Capturing and bubbling | None. Events are dispatched only to the target itself |

## See also

- [`Event`](event.md): the event object
- [`Application`](application.md): the most commonly used event target
- [How the runtime works](how-it-works.md#events): when native events fire
