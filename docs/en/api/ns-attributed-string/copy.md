---
type: reference
native: "-[NSAttributedString copy]"
---

# `NSAttributedString`: `copy()` method

The **`copy()`** method returns an unmodifiable copy with the same content.

## Syntax

```
copy()
```

### Parameters

None.

### Return value

An `NSAttributedString` with the same content as the original. Called on an `NSMutableAttributedString`, the copy can't be modified, and later changes to the original don't affect it.

### Exceptions

None.

## Examples

```js
const text = new NSMutableAttributedString('abc');
const frozen = text.copy();
text.appendAttributedString(new NSAttributedString('d'));
console.log(frozen.string, text.string);
```

**Result**: The console prints `abc abcd`.

## Corresponding iOS API

`-[NSAttributedString copy]`.

## See also

- [`mutableCopy()`](mutablecopy.md)
