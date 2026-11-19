---
type: reference
native: "+[NSIndexPath indexPathForItem:inSection:]"
---

# `NSIndexPath()` constructor

The **`NSIndexPath()`** constructor creates a position from a section number and an item number. The section comes first, then the item.

## Syntax

```
new NSIndexPath(section, item)
```

### Parameters

**`section`**

The section number, counted from 0.

**`item`**

The item number within the section, counted from 0.

Both numbers are non-negative integers. Fractions are truncated toward zero, and numeric strings are converted to numbers (measured).

### Return value

A new `NSIndexPath`.

### Exceptions

**`TypeError`**

A negative number, or a value that can't be converted to a number (measured).

## Examples

```js
const path = new NSIndexPath(1.9, 2.9);
console.log(String(path));
```

**Result**: logs `NSIndexPath(1, 2)`.

## Corresponding iOS API

`[NSIndexPath indexPathForItem:item inSection:section]`. The argument order is the opposite of ObjC: here the section comes first, then the item.

## See also

- [`NSIndexPath.indexPathForItem()`](indexpathforitem.md)
