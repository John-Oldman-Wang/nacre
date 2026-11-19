---
type: reference
native: NSStringFromCGAffineTransform
---

# `CGAffineTransform`: `toString()` method

The **`toString()`** method formats the transform as a string such as `CGAffineTransform(a, b, c, d, tx, ty)`. `String(t)` and template literals both call it.

## Syntax

```
toString()
```

### Parameters

None.

### Return value

A string. The six numbers are in the order of the constructor's parameters.

### Exceptions

None.

## Examples

```js
const t = CGAffineTransform.translation(10, 20);
console.log(String(t));
console.log(JSON.stringify(t));
```

**Result**

- The first line logs `CGAffineTransform(1, 0, 0, 1, 10, 20)`.
- The second line logs `{"a":1,"b":0,"c":0,"d":1,"tx":10,"ty":20}`.

## Corresponding iOS API

Serves the same purpose as `NSStringFromCGAffineTransform(t)`, with a different format.

## See also

- [Structs](../structs.md): rules shared by all structs
