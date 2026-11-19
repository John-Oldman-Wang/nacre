---
type: reference
native: NSIndexPath.section
---

# `NSIndexPath`: `section` property

The **`section`** property is the section number, counted from 0.

## Value

A non-negative integer.

- Read-only. Assigning to it throws `TypeError`. To get a different position, create a new one.

## Examples

```js
const path = new NSIndexPath(2, 5);
console.log(path.section);
```

**Result**: logs `2`.

## Corresponding iOS API

`NSIndexPath.section`.

## See also

- [`NSIndexPath`](../ns-index-path.md)
