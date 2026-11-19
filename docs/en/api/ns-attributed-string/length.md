---
type: reference
native: NSAttributedString.length
---

# `NSAttributedString`: `length` property

The **`length`** property is the attributed string's length.

## Value

An integer, the number of UTF-16 code units, equal to `string.length`. An emoji takes two, and an attachment takes one.

- Read-only; assigning to it throws `TypeError`.
- Ranges and indexes are counted in this unit; see [How ranges are written](../ns-attributed-string.md#how-ranges-are-written).

## Examples

```js
const text = new NSAttributedString('Total ¥128');
console.log(text.length, text.length === text.string.length);
```

**Result**: The console prints `10 true`.

## Corresponding iOS API

`NSAttributedString.length`.

## See also

- [`string`](string.md)
