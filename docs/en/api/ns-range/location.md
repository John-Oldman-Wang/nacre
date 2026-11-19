---
type: reference
native: NSRange.location
---

# `NSRange`: `location` property

The **`location`** property is the start of the range, in UTF-16 code units.

## Value

A non-negative integer, in UTF-16 code units. 0 is before the first character; `text.length` is after the last character.

- Read-only. Assigning to it throws `TypeError: location is read-only: structs are values, assign a whole new one instead`. To change it, replace the whole `NSRange` with a new one.

## Examples

```js
const text = 'hello world';
const r = new NSRange(6, 5);
console.log(r.location, text.slice(r.location, r.location + r.length));
```

**Result**: logs `6 world`.

## Corresponding iOS API

`NSRange.location`.

## See also

- [`NSRange`](../ns-range.md)
