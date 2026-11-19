---
type: reference
native: "-[NSParagraphStyle mutableCopy]"
---

# `NSParagraphStyle`: `mutableCopy()` method

The **`mutableCopy()`** method returns a mutable copy with the same values.

## Syntax

```
mutableCopy()
```

### Parameters

None.

### Return value

An [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md) with the same property values as the original. Changing the copy doesn't affect the original.

### Exceptions

None.

## Examples

```js
const style = NSParagraphStyle.defaultParagraphStyle.mutableCopy();
style.alignment = 'center';
console.log(style.alignment);
```

**Result**: the console prints `center`.

## Corresponding iOS API

`-[NSParagraphStyle mutableCopy]`.

## See also

- [`copy()`](copy.md)
