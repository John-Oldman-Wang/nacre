---
type: reference
native: NSIndexPath.item
---

# `NSIndexPath`: `item` property

The **`item`** property is the item number within the section, counted from 0.

## Value

A non-negative integer.

- Read-only. Assigning to it throws `TypeError`. To get a different position, create a new one.

## Examples

```js
const path = new NSIndexPath(2, 5);
console.log(path.item);
```

**Result**: logs `5`.

## Corresponding iOS API

`NSIndexPath.item`.

## See also

- [`NSIndexPath`](../ns-index-path.md)
