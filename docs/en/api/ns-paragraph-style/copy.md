---
type: reference
native: "-[NSParagraphStyle copy]"
---

# `NSParagraphStyle`: `copy()` method

The **`copy()`** method returns an immutable copy with the same values.

## Syntax

```
copy()
```

### Parameters

None.

### Return value

An `NSParagraphStyle` with the same property values as the original. When called on an `NSMutableParagraphStyle`, later changes to the original don't affect the copy.

### Exceptions

None.

## Examples

```js
const style = new NSMutableParagraphStyle();
style.lineSpacing = 8;
const frozen = style.copy();
style.lineSpacing = 2;
console.log(frozen.lineSpacing);
```

**Result**: the console prints `8`.

## Corresponding iOS API

`-[NSParagraphStyle copy]`.

## See also

- [`mutableCopy()`](mutablecopy.md)
