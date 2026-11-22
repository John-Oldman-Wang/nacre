---
type: reference
native: WebContentsDidNavigateEvent()
---

# `WebContentsDidNavigateEvent()` constructor

The **`WebContentsDidNavigateEvent()`** constructor creates a `WebContentsDidNavigateEvent`.

## Syntax

```
new WebContentsDidNavigateEvent(type)
new WebContentsDidNavigateEvent(type, { url, httpResponseCode, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.url`**

Optional. Corresponds to the [`url`](url.md) property. Converted with `String()`; `null` gives an empty string. When omitted, it is an empty string.

**`options.httpResponseCode`**

Optional. Corresponds to the [`httpResponseCode`](httpresponsecode.md) property. Converted with `Number()` and truncated toward zero; a value that is not a finite number throws `TypeError`. When omitted, it is `-1`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `WebContentsDidNavigateEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'WebContentsDidNavigateEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new WebContentsDidNavigateEvent('did-navigate', { url: 'https://example.com', httpResponseCode: 200 });
console.log(event.url, event.httpResponseCode);
```

**Result**: the console prints `https://example.com 200`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`WebContentsDidNavigateEvent`](../web-contents-did-navigate-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
