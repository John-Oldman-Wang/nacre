---
type: reference
native: WebContentsDidFailLoadEvent()
---

# `WebContentsDidFailLoadEvent()` constructor

The **`WebContentsDidFailLoadEvent()`** constructor creates a `WebContentsDidFailLoadEvent`.

## Syntax

```
new WebContentsDidFailLoadEvent(type)
new WebContentsDidFailLoadEvent(type, { errorCode, errorDescription, validatedURL, isMainFrame, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.errorCode`**

Optional. Corresponds to the [`errorCode`](errorcode.md) property. Converted with `Number()` and truncated toward zero; a value that is not a finite number throws `TypeError`. When omitted, it is `0`.

**`options.errorDescription`**

Optional. Corresponds to the [`errorDescription`](errordescription.md) property. Converted with `String()`; `null` gives an empty string. When omitted, it is an empty string.

**`options.validatedURL`**

Optional. Corresponds to the [`validatedURL`](validatedurl.md) property. Converted with `String()`; `null` gives an empty string. When omitted, it is an empty string.

**`options.isMainFrame`**

Optional. Corresponds to the [`isMainFrame`](ismainframe.md) property. Converted to its JS truthiness with `Boolean()`. When omitted, it is `true`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `WebContentsDidFailLoadEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'WebContentsDidFailLoadEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new WebContentsDidFailLoadEvent('did-fail-load', { errorCode: -1009, validatedURL: 'https://example.com' });
console.log(event.errorCode, event.errorDescription === '', event.isMainFrame);
```

**Result**: the console prints `-1009 true true`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`WebContentsDidFailLoadEvent`](../web-contents-did-fail-load-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
