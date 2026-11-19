---
type: reference
native: "-[NSAttributedString attribute:atIndex:effectiveRange:]"
---

# `NSAttributedString`: `attribute()` method

The **`attribute()`** method returns one attribute at a position.

## Syntax

```
attribute(name, { atIndex })
```

### Parameters

**`name`**

The attribute's name; see [Attributed string attributes](../ns-attributed-string.md#attributed-string-attributes).

**`options.atIndex`**

Required. The position, as a UTF-16 code unit index.

### Return value

The attribute's value; `null` when the position doesn't have this attribute. The value has the same shape as what [`attributesAtIndex()`](attributesatindex.md) reads.

### Exceptions

**`TypeError`**

- `atIndex` isn't given: `attribute needs { atIndex }`.
- The attribute name isn't recognized: `NSAttributedString has no attribute "colour"; expected one of: …`.
- `atIndex` is out of bounds.

## Examples

```js
const text = new NSMutableAttributedString('Total ¥128');
text.addAttribute('kern', { value: 2, range: new NSRange(6, 4) });
console.log(text.attribute('kern', { atIndex: 6 }));
console.log(text.attribute('font', { atIndex: 6 }));
```

**Result**: It prints `2`, then `null`.

## Corresponding iOS API

`-[NSAttributedString attribute:atIndex:effectiveRange:]`.

## See also

- [`attributesAtIndex()`](attributesatindex.md)
