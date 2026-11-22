---
type: reference
native: WebContentsConsoleMessageEvent()
---

# `WebContentsConsoleMessageEvent()` constructor

The **`WebContentsConsoleMessageEvent()`** constructor creates a `WebContentsConsoleMessageEvent`.

## Syntax

```
new WebContentsConsoleMessageEvent(type)
new WebContentsConsoleMessageEvent(type, { level, message, lineNumber, sourceId, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.level`**

Optional. Corresponds to the [`level`](level.md) property. Converted with `String()`; `null` gives an empty string. When omitted, it is `'info'`.

**`options.message`**

Optional. Corresponds to the [`message`](message.md) property. Converted with `String()`; `null` gives an empty string. When omitted, it is an empty string.

**`options.lineNumber`**

Optional. Corresponds to the [`lineNumber`](linenumber.md) property. Converted with `Number()` and truncated toward zero; a value that is not a finite number throws `TypeError`. When omitted, it is `0`.

**`options.sourceId`**

Optional. Corresponds to the [`sourceId`](sourceid.md) property. Converted with `String()`; `null` gives an empty string. When omitted, it is an empty string.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `WebContentsConsoleMessageEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'WebContentsConsoleMessageEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new WebContentsConsoleMessageEvent('console-message', { level: 'warning', message: 'w' });
console.log(event.level, event.message, event.lineNumber, event.sourceId === '');
```

**Result**: the console prints `warning w 0 true`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`WebContentsConsoleMessageEvent`](../web-contents-console-message-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
