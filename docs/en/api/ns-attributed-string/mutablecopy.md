---
type: reference
native: "-[NSAttributedString mutableCopy]"
---

# `NSAttributedString`: `mutableCopy()` method

The **`mutableCopy()`** method returns a modifiable copy with the same content.

## Syntax

```
mutableCopy()
```

### Parameters

None.

### Return value

An [`NSMutableAttributedString`](../ns-mutable-attributed-string.md) with the same content as the original. Changing the copy doesn't affect the original.

### Exceptions

None.

## Examples

```js
const text = new NSAttributedString('abc');
const editable = text.mutableCopy();
editable.appendAttributedString(new NSAttributedString('d'));
console.log(text.string, editable.string);
```

**Result**: The console prints `abc abcd`.

## Corresponding iOS API

`-[NSAttributedString mutableCopy]`.

## See also

- [`copy()`](copy.md)
- [`NSMutableAttributedString`](../ns-mutable-attributed-string.md)
