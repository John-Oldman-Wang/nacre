---
type: reference
native: "-[NSAttributedString size]"
---

# `NSAttributedString`: `size()` method

The **`size()`** method returns how much space this attributed string needs laid out on one line.

## Syntax

```
size()
```

### Parameters

None.

### Return value

A [`CGSize`](../structs.md), in [pt](../units.md). The result has fractional parts; round up when using it as a view's size.

For the size with a limited width and wrapped text, use [`boundingRectWithSize()`](boundingrectwithsize.md).

### Exceptions

None.

## Examples

```js
const text = new NSAttributedString('Some text', { font: UIFont.systemFontOfSize(17) });
const oneLine = text.size();
console.log(Math.ceil(oneLine.width), Math.ceil(oneLine.height));
```

**Result**: The console prints the width and height when laid out on one line, in pt. The exact values are **not verified in the simulator**.

## Corresponding iOS API

`-[NSAttributedString size]`.

## See also

- [`boundingRectWithSize()`](boundingrectwithsize.md)
