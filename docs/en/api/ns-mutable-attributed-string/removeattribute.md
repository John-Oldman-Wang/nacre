---
type: reference
native: "-[NSMutableAttributedString removeAttribute:range:]"
---

# `NSMutableAttributedString`: `removeAttribute()` method

The **`removeAttribute()`** method removes one attribute from a range of text. It is not an error if the range doesn't have that attribute.

## Syntax

```
removeAttribute(name, { range })
```

### Parameters

**`name`**

The attribute name; see [Attributed string attributes](../ns-attributed-string.md#attributed-string-attributes).

**`options.range`**

Required. The range to change: an [`NSRange`](../ns-attributed-string.md#how-ranges-are-written) or `{ location, length }`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `range` is missing: `removeAttribute needs { range }`.
- The attribute name is misspelled: `NSAttributedString has no attribute "colour"; expected one of: …`.
- `range` is out of bounds: `removeAttribute range {8, 9} is out of bounds; the string length is 10`.

## Examples

```js
const text = new NSMutableAttributedString('abc', { kern: 3 });
text.removeAttribute('kern', { range: new NSRange(0, 1) });
console.log(text.attribute('kern', { atIndex: 0 }), text.attribute('kern', { atIndex: 1 }));
```

**Result**: The console logs `null 3`.

## Corresponding iOS API

`-[NSMutableAttributedString removeAttribute:range:]`.

## See also

- [`addAttribute()`](addattribute.md)
