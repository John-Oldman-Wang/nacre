---
type: reference
native: "-[NSMutableAttributedString addAttribute:value:range:]"
---

# `NSMutableAttributedString`: `addAttribute()` method

The **`addAttribute()`** method adds one attribute to a range of text. An attribute with the same name already on that range is overwritten; other attributes are untouched.

## Syntax

```
addAttribute(name, { value, range })
```

### Parameters

**`name`**

The attribute name; see [Attributed string attributes](../ns-attributed-string.md#attributed-string-attributes).

**`options.value`**

Required. The attribute value; its type depends on the attribute.

**`options.range`**

Required. The range to change: an [`NSRange`](../ns-attributed-string.md#how-ranges-are-written) or `{ location, length }`.

### Return value

None (`undefined`).

An invalid color string does not throw: a warning is logged, and nothing is added.

### Exceptions

**`TypeError`**

- `range` is missing: `addAttribute needs { range }`.
- `value` is missing: `addAttribute needs { value }`.
- The attribute name is misspelled: `NSAttributedString has no attribute "colour"; expected one of: …`.
- The value has the wrong type, for example `font must be a UIFont, got "Helvetica"`; a color given as `null` also throws.
- `range` is out of bounds: `addAttributes range {8, 9} is out of bounds; the string length is 10`.

## Examples

```js
const text = new NSMutableAttributedString('合计 ¥128');
text.addAttribute('kern', { value: 2, range: new NSRange(3, 4) });
console.log(text.attribute('kern', { atIndex: 3 }), text.attribute('kern', { atIndex: 0 }));
```

**Result**: The console logs `2 null`.

## Corresponding iOS API

`-[NSMutableAttributedString addAttribute:value:range:]`. `NSKernAttributeName` is written as `'kern'`.

## See also

- [`addAttributes()`](addattributes.md)
- [`removeAttribute()`](removeattribute.md)
