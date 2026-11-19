---
type: reference
native: "+[UIBezierPath bezierPathWithRect:]"
---

# `UIBezierPath.bezierPathWithRect()` static method

The **`UIBezierPath.bezierPathWithRect()`** static method creates a rectangular path.

## Syntax

```
UIBezierPath.bezierPathWithRect(rect)
```

### Parameters

**`rect`**

The position and size of the rectangle, a `CGRect`, in [pt](../units.md). Can also be a plain object with the same fields, `{ x, y, width, height }`; see [structs](../structs.md).

### Return value

A new `UIBezierPath`. Its [`bounds`](bounds.md) is `rect`.

### Exceptions

**`TypeError`**

- `rect` isn't an object: `bezierPathWithRect needs an object with all of: x, y, width, height`.
- A field is missing or can't be converted to a finite number: `bezierPathWithRect is missing width, or it is not a finite number` (`width` replaced by whichever field is actually missing).

## Examples

```js
const rect = UIBezierPath.bezierPathWithRect(new CGRect(10, 20, 30, 40));
console.log(String(rect.bounds));
```

**Result**: The console prints `CGRect(10, 20, 30, 40)`. The path is a 30 × 40 pt rectangle with its top-left corner at (10, 20).

## Corresponding iOS API

`+[UIBezierPath bezierPathWithRect:]`.

## See also

- [`bezierPathWithRoundedRect()`](bezierpathwithroundedrect.md): a rounded rectangle
- [`bezierPathWithOvalInRect()`](bezierpathwithovalinrect.md): the oval inscribed in a rectangle
