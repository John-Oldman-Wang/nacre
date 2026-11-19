---
type: reference
native: "-[NSMutableAttributedString setAttributes:range:]"
---

# `NSMutableAttributedString`: `setAttributes()` method

The **`setAttributes()`** method replaces all the attributes of a range of text with the given set. Attributes the range had that aren't in this set are removed.

## Syntax

```
setAttributes(attributes, { range })
```

### Parameters

**`attributes`**

A set of [attributes](../ns-attributed-string.md#attributed-string-attributes). Passing `null` clears all attributes of the range.

**`options.range`**

Required. The range to change: an [`NSRange`](../ns-attributed-string.md#how-ranges-are-written) or `{ location, length }`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `range` is missing: `setAttributes needs { range }`.
- A misspelled attribute name or a value of the wrong type: same as [`addAttribute()`](addattribute.md).
- `range` is out of bounds: `setAttributes range {8, 9} is out of bounds; the string length is 10`.

## Examples

```js
const text = new NSMutableAttributedString('abc', { kern: 3 });
text.setAttributes({ ligature: 0 }, { range: new NSRange(0, 3) });
console.log(JSON.stringify(text.attributesAtIndex(0)));
```

**Result**: The console logs `{"ligature":0}`. The original `kern` was removed.

## Corresponding iOS API

`-[NSMutableAttributedString setAttributes:range:]`.

## See also

- [`addAttributes()`](addattributes.md): only adds, without removing others
