---
type: reference
native: UICollectionViewItemEvent()
---

# `UICollectionViewItemEvent()` constructor

The **`UICollectionViewItemEvent()`** constructor creates a `UICollectionViewItemEvent`.

## Syntax

```
new UICollectionViewItemEvent(type)
new UICollectionViewItemEvent(type, { indexPath, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.indexPath`**

Optional. Corresponds to the [`indexPath`](indexpath.md) property. Must be a `NSIndexPath` or `null`; it is not converted. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UICollectionViewItemEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UICollectionViewItemEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new UICollectionViewItemEvent('itemselect', { indexPath: new NSIndexPath(0, 3) });
console.log(event.indexPath.section, event.indexPath.item);
```

**Result**: the console prints `0 3`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UICollectionViewItemEvent`](../ui-collection-view-item-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
