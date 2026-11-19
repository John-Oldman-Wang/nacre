---
type: reference
native: "-[NSMutableAttributedString addAttributes:range:]"
---

# `NSMutableAttributedString`: `addAttributes()` method

The **`addAttributes()`** method adds a set of attributes to a range of text. Attributes with the same names are overwritten; other attributes are untouched.

## Syntax

```
addAttributes(attributes, { range })
```

### Parameters

**`attributes`**

A set of [attributes](../ns-attributed-string.md#attributed-string-attributes), as an object. Keys whose value is `undefined` are treated as absent.

**`options.range`**

Required. The range to change: an [`NSRange`](../ns-attributed-string.md#how-ranges-are-written) or `{ location, length }`.

### Return value

None (`undefined`).

An invalid color string does not throw: a warning is logged, that key has no effect, and the other keys apply as usual.

### Exceptions

**`TypeError`**

- `range` is missing: `addAttributes needs { range }`.
- A misspelled attribute name or a value of the wrong type: same as [`addAttribute()`](addattribute.md).
- `range` is out of bounds: `addAttributes range {8, 9} is out of bounds; the string length is 10`.

## Examples

```js
const text = new NSMutableAttributedString('实线 双线 虚线', {
  font: UIFont.systemFontOfSize(17),
});
text.addAttributes(
  { underlineStyle: ['single', 'patternDash'], underlineColor: 'systemRed' },
  { range: new NSRange(6, 2) },
);
```

**Effect**: The last two characters, `虚线` ("dashed"), have a red dashed line beneath them.

## Corresponding iOS API

`-[NSMutableAttributedString addAttributes:range:]`.

## See also

- [`addAttribute()`](addattribute.md)
- [`setAttributes()`](setattributes.md)
