---
type: reference
native: WebContentsIpcMessageEvent()
---

# `WebContentsIpcMessageEvent()` constructor

The **`WebContentsIpcMessageEvent()`** constructor creates a `WebContentsIpcMessageEvent`.

## Syntax

```
new WebContentsIpcMessageEvent(type)
new WebContentsIpcMessageEvent(type, { channel, args, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.channel`**

Optional. Corresponds to the [`channel`](channel.md) property. Converted with `String()`; `null` gives an empty string. When omitted, it is an empty string.

**`options.args`**

Optional. Corresponds to the [`args`](args.md) property. Must be iterable (an array, a `Set`, …); it is copied into a new array. Anything else throws `TypeError`. When omitted, it is an empty array.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `WebContentsIpcMessageEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'WebContentsIpcMessageEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new WebContentsIpcMessageEvent('ipc-message', { channel: 'share', args: [42] });
console.log(event.channel, event.args[0]);
```

**Result**: the console prints `share 42`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`WebContentsIpcMessageEvent`](../web-contents-ipc-message-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
