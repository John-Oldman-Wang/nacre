---
type: reference
native: NSRange.length
---

# `NSRange`: `length` property

The **`length`** property is the length of the range, in UTF-16 code units.

## Value

A non-negative integer, in UTF-16 code units. 0 is a position with no content; in a text field it is the cursor.

- Read-only. Assigning to it throws `TypeError: length is read-only: structs are values, assign a whole new one instead`. To change it, replace the whole `NSRange` with a new one.

## Examples

```js
const text = 'hello world';
const r = new NSRange(6, 5);
console.log(r.length, text.slice(r.location, r.location + r.length));
```

**Result**: logs `5 world`.

## Corresponding iOS API

`NSRange.length`.

## See also

- [`NSRange`](../ns-range.md)
