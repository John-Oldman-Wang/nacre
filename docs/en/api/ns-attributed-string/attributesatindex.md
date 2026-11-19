---
type: reference
native: "-[NSAttributedString attributesAtIndex:effectiveRange:]"
---

# `NSAttributedString`: `attributesAtIndex()` method

The **`attributesAtIndex()`** method returns all attributes at a position.

## Syntax

```
attributesAtIndex(index)
```

### Parameters

**`index`**

The position, as a UTF-16 code unit index. Converted to an integer.

### Return value

An object whose keys are attribute names; see [Attributed string attributes](../ns-attributed-string.md#attributed-string-attributes). Attributes that aren't present don't appear in it; with no attributes at all it is `{}`.

Values read back: colors are strings; fonts and attachments are the objects you wrote; paragraph styles and shadows are copies.

### Exceptions

**`TypeError`**

- `index` is out of bounds: `attributesAtIndex index 99 is out of bounds; the string length is 10`.
- `index` doesn't convert to a finite number.

## Examples

```js
const text = new NSMutableAttributedString('Total ¥128');
text.addAttribute('kern', { value: 2, range: new NSRange(6, 4) });
console.log(JSON.stringify(text.attributesAtIndex(0)));
console.log(JSON.stringify(text.attributesAtIndex(6)));
```

**Result**: It prints `{}`, then `{"kern":2}`.

## Corresponding iOS API

`-[NSAttributedString attributesAtIndex:effectiveRange:]`. The out-parameter `effectiveRange` isn't provided; to find the contiguous range over which an attribute applies, use [`enumerateAttributesInRange()`](enumerateattributesinrange.md).

## See also

- [`attribute()`](attribute.md)
