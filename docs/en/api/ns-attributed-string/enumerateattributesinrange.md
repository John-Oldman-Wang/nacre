---
type: reference
native: "-[NSAttributedString enumerateAttributesInRange:options:usingBlock:]"
---

# `NSAttributedString`: `enumerateAttributesInRange()` method

The **`enumerateAttributesInRange()`** method splits a range of text into runs, each a contiguous range with the same attributes, and calls the callback once per run.

## Syntax

```
enumerateAttributesInRange(range, callback)
```

### Parameters

**`range`**

The range to iterate, an [`NSRange`](../ns-attributed-string.md#how-ranges-are-written) or `{ location, length }`.

**`callback`**

A function `callback(attributes, range)`. `attributes` is all the attributes of this run, with the same shape as what [`attributesAtIndex()`](attributesatindex.md) reads; `range` is this run's range, an `NSRange`.

### Return value

None (`undefined`).

- The callback runs synchronously, on the spot, front to back; all calls are done when the method returns.
- There is no way to stop partway.
- It iterates the content at the moment of the call. Changing this attributed string inside the callback doesn't affect the runs received in this pass.
- An exception thrown in the callback propagates to the caller unchanged.

### Exceptions

**`TypeError`**

- `range` is out of bounds: `enumerateAttributesInRange range {8, 9} is out of bounds; the string length is 10`.
- No callback is given: `enumerateAttributesInRange needs a callback function, got …`.

## Examples

```js
const text = new NSMutableAttributedString('Total ¥128');
text.addAttribute('kern', { value: 2, range: new NSRange(6, 4) });
text.enumerateAttributesInRange(new NSRange(0, text.length), (attributes, range) => {
  console.log(range.location, range.length, Object.keys(attributes).join(','));
});
```

**Result**: The console prints two lines, `0 6 ` and `6 4 kern`.

## Corresponding iOS API

`-[NSAttributedString enumerateAttributesInRange:options:usingBlock:]`. `options` (reverse iteration and so on) and the block's `stop` out-parameter aren't provided.

## See also

- [`attributesAtIndex()`](attributesatindex.md)
