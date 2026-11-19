---
type: reference
native: "-[NSMutableParagraphStyle setParagraphStyle:]"
---

# `NSMutableParagraphStyle`: `setParagraphStyle()` method

The **`setParagraphStyle()`** method copies all property values from another paragraph style.

## Syntax

```
setParagraphStyle(other)
```

### Parameters

**`other`**

An `NSParagraphStyle` (an `NSMutableParagraphStyle` also works).

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

`other` is not a paragraph style: `setParagraphStyle style must be a NSParagraphStyle, got …`.

## Examples

```js
const a = new NSMutableParagraphStyle();
a.lineSpacing = 8;
const b = new NSMutableParagraphStyle();
b.setParagraphStyle(a);
console.log(b.lineSpacing);
```

**Result**: The console prints `8`.

## Corresponding iOS API

`-[NSMutableParagraphStyle setParagraphStyle:]`.

## See also

- [`mutableCopy()`](../ns-paragraph-style/mutablecopy.md): another way to get the same values
