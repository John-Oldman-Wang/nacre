---
type: reference
native: UITextViewLinkClickEvent()
---

# `UITextViewLinkClickEvent()` constructor

The **`UITextViewLinkClickEvent()`** constructor creates a `UITextViewLinkClickEvent`.

## Syntax

```
new UITextViewLinkClickEvent(type)
new UITextViewLinkClickEvent(type, { url, range, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.url`**

Optional. Corresponds to the [`url`](url.md) property. Converted with `String()`; `null` gives an empty string. When omitted, it is an empty string.

**`options.range`**

Optional. Corresponds to the [`range`](range.md) property. A `NSRange`, or a plain object with `location`, `length` (converted to a `NSRange` the same way the struct converts its fields); it may also be `null`. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UITextViewLinkClickEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UITextViewLinkClickEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new UITextViewLinkClickEvent('linkclick', { url: 'https://example.com', range: new NSRange(0, 4) });
console.log(event.url, event.range.length);
```

**Result**: the console prints `https://example.com 4`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UITextViewLinkClickEvent`](../ui-text-view-link-click-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
