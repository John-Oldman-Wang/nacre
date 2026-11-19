---
type: reference
native: NSIndexPath.row
---

# `NSIndexPath`: `row` property

The **`row`** property is the same number as [`item`](item.md). Apple's table view documentation calls it row.

## Value

A non-negative integer.

- Read-only. Assigning to it throws `TypeError`. To get a different position, create a new one.

## Examples

```js
const path = new NSIndexPath(2, 5);
console.log(path.row);
```

**Result**: logs `5`.

## Corresponding iOS API

`NSIndexPath.row`.

## See also

- [`NSIndexPath`](../ns-index-path.md)
