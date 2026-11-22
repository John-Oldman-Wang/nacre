---
type: reference
native: UIScrollViewDragEndEvent()
---

# `UIScrollViewDragEndEvent()` constructor

The **`UIScrollViewDragEndEvent()`** constructor creates a `UIScrollViewDragEndEvent`.

## Syntax

```
new UIScrollViewDragEndEvent(type)
new UIScrollViewDragEndEvent(type, { velocity, targetContentOffset, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.velocity`**

Optional. Corresponds to the [`velocity`](velocity.md) property. A `CGPoint`, or a plain object with `x`, `y` (converted to a `CGPoint` the same way the struct converts its fields); it may also be `null`. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.targetContentOffset`**

Optional. Corresponds to the [`targetContentOffset`](targetcontentoffset.md) property. A `CGPoint`, or a plain object with `x`, `y` (converted to a `CGPoint` the same way the struct converts its fields); it may also be `null`. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UIScrollViewDragEndEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UIScrollViewDragEndEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new UIScrollViewDragEndEvent('beforedragend', { velocity: new CGPoint(0, 1.5) });
event.targetContentOffset = new CGPoint(0, 240);
console.log(event.velocity.y, event.targetContentOffset.y);
```

**Result**: the console prints `1.5 240`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UIScrollViewDragEndEvent`](../ui-scroll-view-drag-end-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
