---
type: reference
native: "-[NSAttributedString attributedSubstringFromRange:]"
---

# `NSAttributedString`: `attributedSubstringFromRange()` method

The **`attributedSubstringFromRange()`** method extracts a range, attributes included.

## Syntax

```
attributedSubstringFromRange(range)
```

### Parameters

**`range`**

The range to extract, an [`NSRange`](../ns-attributed-string.md#how-ranges-are-written) or `{ location, length }`.

### Return value

A new `NSAttributedString` holding the text in this range and its attributes. The original attributed string is unchanged.

### Exceptions

**`TypeError`**

`range` is out of bounds: `attributedSubstringFromRange range {8, 9} is out of bounds; the string length is 10`.

## Examples

```js
const text = new NSAttributedString('Total ¥128', { kern: 2 });
const part = text.attributedSubstringFromRange(new NSRange(6, 4));
console.log(part.string, part.attribute('kern', { atIndex: 0 }));
```

**Result**: The console prints `¥128 2`.

## Corresponding iOS API

`-[NSAttributedString attributedSubstringFromRange:]`.

## See also

- [How ranges are written](../ns-attributed-string.md#how-ranges-are-written)
