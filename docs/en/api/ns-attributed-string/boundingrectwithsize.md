---
type: reference
native: "-[NSAttributedString boundingRectWithSize:options:context:]"
---

# `NSAttributedString`: `boundingRectWithSize()` method

The **`boundingRectWithSize()`** method returns how much space this attributed string needs when laid out within a given size. Use it to measure the height of multi-line text.

## Syntax

```
boundingRectWithSize(size, [{ options }])
```

### Parameters

**`size`**

The size to lay out within, a [`CGSize`](../structs.md) or `{ width, height }`, in [pt](../units.md). For a direction with no limit, give a very large number, such as `Number.MAX_VALUE`.

**`options.options`**

Optional. An array of option names; omitting it is the same as an empty array:

| Value | Effect |
| --- | --- |
| `'usesLineFragmentOrigin'` | Lays out as multiple lines. Required for measuring multi-line text; without it, it is measured as one line |
| `'usesFontLeading'` | Includes the font's own leading in the line height |
| `'usesDeviceMetrics'` | Measures by the area the glyphs actually draw, rather than the typographic area |
| `'truncatesLastVisibleLine'` | When the text doesn't fit, measures the last line as truncated |

### Return value

A [`CGRect`](../structs.md), in pt. The result has fractional parts; round up when using it as a view's size.

### Exceptions

**`TypeError`**

- `size` is missing fields.
- `options` isn't an array: `boundingRectWithSize options must be an array of option names, got …`.
- An option name isn't recognized.

## Examples

```js
const text = new NSAttributedString('A fairly long piece of text that wraps when it does not fit on one line.', {
  font: UIFont.systemFontOfSize(17),
});
const wrapped = text.boundingRectWithSize(
  new CGSize(200, Number.MAX_VALUE),
  { options: ['usesLineFragmentOrigin'] },
);
console.log(Math.ceil(wrapped.height));
```

**Result**: The console prints the height needed at a width limit of 200 pt, in pt. The exact value is **not verified in the simulator**.

## Corresponding iOS API

`-[NSAttributedString boundingRectWithSize:options:context:]`. `context` isn't provided. `CGFLOAT_MAX` is written `Number.MAX_VALUE`; `NSStringDrawingUsesLineFragmentOrigin` is written `'usesLineFragmentOrigin'`.

## See also

- [`size()`](size.md)
