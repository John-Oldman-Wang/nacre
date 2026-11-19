---
type: reference
native: NSMakeRange
---

# `NSRange()` constructor

The **`NSRange()`** constructor creates a range from a start and a length.

## Syntax

```
new NSRange()
new NSRange(location, length)
```

### Parameters

**`location`**

The start, a non-negative integer in UTF-16 code units. 0 is before the first character. Defaults to 0.

**`length`**

The length, a non-negative integer in UTF-16 code units. Defaults to 0.

Both parameters are converted as follows:

| Value given | Result |
| --- | --- |
| Omitted | 0. `new NSRange()` is `(0, 0)` |
| A fraction | Truncated toward zero. `new NSRange(1.9, 2.2)` is `(1, 2)` |
| A string that looks like a number | Converted to that number. `new NSRange('3', '4')` is `(3, 4)` |

### Return value

A new `NSRange`.

### Exceptions

**`TypeError`**

- A negative number: `NSRange location must be a non-negative integer, got -1`. Likewise when `length` is negative.
- Not convertible to a finite number: `NSRange location must be a finite number, got "abc"`.

## Examples

```js
const r = new NSRange(1.9, 2.2);
console.log(String(r), JSON.stringify(r));
```

**Result**: logs `NSRange(1, 2) {"location":1,"length":2}`.

## Corresponding iOS API

`NSMakeRange(location, length)`.

## See also

- [`NSRange`](../ns-range.md)
