---
type: reference
native: "+[NSIndexPath indexPathForRow:inSection:]"
---

# `NSIndexPath.indexPathForRow()` static method

The **`NSIndexPath.indexPathForRow()`** static method creates a position. The argument order is the same as in ObjC: the item first, then the section. The result is the same as `new NSIndexPath(section, row)`.

## Syntax

```
NSIndexPath.indexPathForRow(row, { inSection })
```

### Parameters

**`row`**

The item number within the section, counted from 0.

**`options.inSection`**

The section number, counted from 0. Required.

### Return value

A new [`NSIndexPath`](../ns-index-path.md).

### Exceptions

**`TypeError`**

- `inSection` is missing (measured).
- A negative number, or a value that can't be converted to a number.

## Examples

```js
const path = NSIndexPath.indexPathForRow(7, { inSection: 1 });
console.log(path.section, path.item);
```

**Result**: logs `1 7`.

## Corresponding iOS API

`+[NSIndexPath indexPathForRow:inSection:]`.

## See also

- [`NSIndexPath()`](constructor.md)
