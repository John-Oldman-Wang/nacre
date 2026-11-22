---
type: reference
native: WebContentsPreloadErrorEvent()
---

# `WebContentsPreloadErrorEvent()` constructor

The **`WebContentsPreloadErrorEvent()`** constructor creates a `WebContentsPreloadErrorEvent`.

## Syntax

```
new WebContentsPreloadErrorEvent(type)
new WebContentsPreloadErrorEvent(type, { preloadPath, error, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.preloadPath`**

Optional. Corresponds to the [`preloadPath`](preloadpath.md) property. Converted with `String()`; `null` gives an empty string. When omitted, it is an empty string.

**`options.error`**

Optional. Corresponds to the [`error`](error.md) property. Any value, kept as is. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `WebContentsPreloadErrorEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'WebContentsPreloadErrorEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new WebContentsPreloadErrorEvent('preload-error', { preloadPath: 'JS/web/preload.js', error: new Error('boom') });
console.log(event.preloadPath, event.error.message);
```

**Result**: the console prints `JS/web/preload.js boom`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`WebContentsPreloadErrorEvent`](../web-contents-preload-error-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
