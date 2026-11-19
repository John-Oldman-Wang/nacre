---
type: reference
native: Event
status: partial
---

# `Event`

**`Event`** represents an event: what happened (the event name), whom it was dispatched to, and whether it can be canceled. It is the base class of all event objects; what a listener receives is an `Event` or a subclass. It is provided by the runtime as a global class; you can construct one yourself with `new Event(type, { cancelable })` and dispatch it with [`dispatchEvent()`](event-target/dispatchevent.md).

Subclasses carry extra fields on top of it, for example [`ErrorEvent`](error-event.md), [`PromiseRejectionEvent`](promise-rejection-event.md), and [`OpenURLEvent`](open-url-event.md).

**Inheritance**: `Event`

## Constructor

[`Event()`](event/constructor.md)

Creates an event object.

## Instance properties

| Property | Description |
| --- | --- |
| [`type`](event/type.md) <small>read-only</small> | The event name |
| [`cancelable`](event/cancelable.md) <small>read-only</small> | Whether `preventDefault()` has an effect |
| [`target`](event/target.md) <small>read-only</small> | The object the event was dispatched to |
| [`currentTarget`](event/currenttarget.md) <small>read-only</small> | Same as `target`, because there is no bubbling |
| [`defaultPrevented`](event/defaultprevented.md) <small>read-only</small> | Whether a listener called `preventDefault()` and it took effect |

## Instance methods

| Method | Description |
| --- | --- |
| [`preventDefault()`](event/preventdefault.md) | Cancels the event's default action |
| [`stopImmediatePropagation()`](event/stopimmediatepropagation.md) | Listeners later on the same object no longer run |
| [`stopPropagation()`](event/stoppropagation.md) | Does nothing, because there is no bubbling |

## Events fired by the system can't be canceled

For events fired by the system, `cancelable` is always `false`: by the time the callback runs, the thing has already happened, and `preventDefault()` has no effect. The exception is events where the system asks on the spot and needs an answer immediately; each says so on its own page. `application`'s `error` and `unhandledrejection` have `cancelable` set to `true`.

## Examples

```js
application.addEventListener('beforelogout', (e) => {
  console.log(e.type, e.cancelable, e.target === application);
  e.preventDefault();
});

const event = new Event('beforelogout', { cancelable: true });
application.dispatchEvent(event);
console.log(event.defaultPrevented);
```

**Result**: Prints `beforelogout true true` and then `true`.

## See also

- [`EventTarget`](event-target.md)
