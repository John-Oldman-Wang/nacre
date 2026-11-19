---
type: reference
native: "-[NSMutableAttributedString insertAttributedString:atIndex:]"
---

# `NSMutableAttributedString`: `insertAttributedString()` method

The **`insertAttributedString()`** method inserts another attributed string before a given position.

## Syntax

```
insertAttributedString(other, { atIndex })
```

### Parameters

**`other`**

An `NSAttributedString`.

**`options.atIndex`**

Required. The code unit before which to insert, converted as an integer. When it equals `length`, the string is appended to the end.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `other` is not an `NSAttributedString`: `insertAttributedString needs an NSAttributedString, got …`.
- `atIndex` is missing: `insertAttributedString needs { atIndex }`.
- `atIndex` is out of bounds: `insertAttributedString atIndex 99 is out of bounds; the string length is 10`.

## Examples

```js
const text = new NSMutableAttributedString('abc');
text.insertAttributedString(new NSAttributedString('>'), { atIndex: 0 });
console.log(text.string);
```

**Result**: The console logs `>abc`.

## Corresponding iOS API

`-[NSMutableAttributedString insertAttributedString:atIndex:]`. The second segment, `atIndex:`, goes into the options object.

## See also

- [`appendAttributedString()`](appendattributedstring.md)
