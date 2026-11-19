---
type: reference
native: "-[NSMutableAttributedString deleteCharactersInRange:]"
---

# `NSMutableAttributedString`: `deleteCharactersInRange()` method

The **`deleteCharactersInRange()`** method deletes a range of text, along with its attributes.

## Syntax

```
deleteCharactersInRange(range)
```

### Parameters

**`range`**

The range to change: an [`NSRange`](../ns-attributed-string.md#how-ranges-are-written) or `{ location, length }`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

`range` is out of bounds: `deleteCharactersInRange range {8, 9} is out of bounds; the string length is 10`.

## Examples

```js
const text = new NSMutableAttributedString('>abc');
text.deleteCharactersInRange(new NSRange(0, 1));
console.log(text.string);
```

**Result**: The console logs `abc`.

## Corresponding iOS API

`-[NSMutableAttributedString deleteCharactersInRange:]`.

## See also

- [`replaceCharactersInRange()`](replacecharactersinrange.md)
