---
type: reference
native: WebContentsPageTitleUpdatedEvent()
---

# `WebContentsPageTitleUpdatedEvent()` constructor

The **`WebContentsPageTitleUpdatedEvent()`** constructor creates a `WebContentsPageTitleUpdatedEvent`.

## Syntax

```
new WebContentsPageTitleUpdatedEvent(type)
new WebContentsPageTitleUpdatedEvent(type, { title, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.title`**

Optional. Corresponds to the [`title`](title.md) property. Converted with `String()`; `null` gives an empty string. When omitted, it is an empty string.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `WebContentsPageTitleUpdatedEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'WebContentsPageTitleUpdatedEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new WebContentsPageTitleUpdatedEvent('page-title-updated', { title: '首页' });
console.log(event.title);
```

**Result**: the console prints `首页`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`WebContentsPageTitleUpdatedEvent`](../web-contents-page-title-updated-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
