---
type: reference
native: "-[NSMutableAttributedString replaceCharactersInRange:withString:]"
---

# `NSMutableAttributedString`: `replaceCharactersInRange()` method

The **`replaceCharactersInRange()`** method replaces a range of text with a string, or with another attributed string.

## Syntax

```
replaceCharactersInRange(range, { withString })
replaceCharactersInRange(range, { withAttributedString })
```

### Parameters

**`range`**

The range to change: an [`NSRange`](../ns-attributed-string.md#how-ranges-are-written) or `{ location, length }`.

**`options.withString`**

The replacement string. The new text takes the attributes of the first character of the replaced range; when the length of `range` is 0, it takes those of the preceding character.

**`options.withAttributedString`**

The replacement attributed string, which keeps its own attributes.

Give one of the two options.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- Neither option is given: `replaceCharactersInRange needs { withString } or { withAttributedString }`.
- `withAttributedString` is not an `NSAttributedString`: `replaceCharactersInRange withAttributedString needs an NSAttributedString, got …`.
- `range` is out of bounds: `replaceCharactersInRange range {8, 9} is out of bounds; the string length is 10`.

## Examples

```js
const text = new NSMutableAttributedString('abc', { kern: 3 });
text.replaceCharactersInRange(new NSRange(1, 1), { withString: 'XYZ' });
console.log(text.string, text.attribute('kern', { atIndex: 2 }));
```

**Result**: The console logs `aXYZc 3`. The new text kept the original `kern`.

## Corresponding iOS API

`-[NSMutableAttributedString replaceCharactersInRange:withString:]`, `-replaceCharactersInRange:withAttributedString:`. The second segment goes into the options object.

## See also

- [`deleteCharactersInRange()`](deletecharactersinrange.md)
