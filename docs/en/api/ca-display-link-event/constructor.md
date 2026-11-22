---
type: reference
native: CADisplayLinkEvent()
---

# `CADisplayLinkEvent()` constructor

The **`CADisplayLinkEvent()`** constructor creates a `CADisplayLinkEvent`.

## Syntax

```
new CADisplayLinkEvent(type)
new CADisplayLinkEvent(type, { frame, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.frame`**

Optional. Corresponds to the [`frame`](frame.md) property. Any value, kept as is. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `CADisplayLinkEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'CADisplayLinkEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new CADisplayLinkEvent('tick', { frame: { timestamp: 1, duration: 0.016, targetTimestamp: 1.016 } });
console.log(event.frame.targetTimestamp - event.frame.timestamp);
```

**Result**: the console prints about `0.016`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`CADisplayLinkEvent`](../ca-display-link-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
