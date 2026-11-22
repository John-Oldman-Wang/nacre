---
type: reference
native: CAAnimationEvent()
---

# `CAAnimationEvent()` constructor

The **`CAAnimationEvent()`** constructor creates a `CAAnimationEvent`.

## Syntax

```
new CAAnimationEvent(type)
new CAAnimationEvent(type, { finished, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.finished`**

Optional. Corresponds to the [`finished`](finished.md) property. Converted to its JS truthiness with `Boolean()`. When omitted, it is `false`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `CAAnimationEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'CAAnimationEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new CAAnimationEvent('stop', { finished: true });
console.log(event.finished);
```

**Result**: the console prints `true`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`CAAnimationEvent`](../ca-animation-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
