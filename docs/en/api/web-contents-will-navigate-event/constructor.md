---
type: reference
native: WebContentsWillNavigateEvent()
---

# `WebContentsWillNavigateEvent()` constructor

The **`WebContentsWillNavigateEvent()`** constructor creates a `WebContentsWillNavigateEvent`.

## Syntax

```
new WebContentsWillNavigateEvent(type)
new WebContentsWillNavigateEvent(type, { url, isMainFrame, navigationType, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.url`**

Optional. Corresponds to the [`url`](url.md) property. Converted with `String()`; `null` gives an empty string. When omitted, it is an empty string.

**`options.isMainFrame`**

Optional. Corresponds to the [`isMainFrame`](ismainframe.md) property. Converted to its JS truthiness with `Boolean()`. When omitted, it is `true`.

**`options.navigationType`**

Optional. Corresponds to the [`navigationType`](navigationtype.md) property. Converted with `String()`; `null` gives an empty string. When omitted, it is `'other'`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `WebContentsWillNavigateEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'WebContentsWillNavigateEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new WebContentsWillNavigateEvent('will-navigate', { url: 'https://example.com', cancelable: true });
console.log(event.url, event.navigationType, event.isMainFrame);
```

**Result**: the console prints `https://example.com other true`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`WebContentsWillNavigateEvent`](../web-contents-will-navigate-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
