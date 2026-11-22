---
type: reference
web: MessageEvent()
---

# `MessageEvent()` constructor

The **`MessageEvent()`** constructor creates a `MessageEvent`.

## Syntax

```
new MessageEvent(type)
new MessageEvent(type, { data, origin, lastEventId, source, ports, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.data`**

Optional. Corresponds to the [`data`](data.md) property. Any value, kept as is. When omitted, it is `null`.

**`options.origin`**

Optional. Corresponds to the [`origin`](origin.md) property. Converted with `String()`; `null` gives an empty string. When omitted, it is an empty string.

**`options.lastEventId`**

Optional. Corresponds to the [`lastEventId`](lasteventid.md) property. Converted with `String()`; `null` gives an empty string. When omitted, it is an empty string.

**`options.source`**

Optional. Corresponds to the [`source`](source.md) property. Any value, kept as is. When omitted, it is `null`.

**`options.ports`**

Optional. Corresponds to the [`ports`](ports.md) property. Must be iterable (an array, a `Set`, …); it is copied into a new frozen array. Anything else throws `TypeError`. When omitted, it is a frozen empty array.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `MessageEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'MessageEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new MessageEvent('message', { data: 'hi' });
console.log(event.data, event.origin === '', event.source, event.ports.length);
```

**Result**: the console prints `hi true null 0`.

## Corresponding iOS API

There is no corresponding system API. It corresponds to `new MessageEvent()` in the browser.

## See also

- [`MessageEvent`](../message-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
