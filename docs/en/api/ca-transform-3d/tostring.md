---
type: reference
native: CATransform3D
---

# `CATransform3D`: `toString()` method

The **`toString()`** method formats the transform as a string like `CATransform3D(m11, m12, …, m44)`. `String(t)` and template literals both call it.

## Syntax

```
toString()
```

### Parameters

None.

### Return value

A string. The 16 numbers are in the order of the constructor's arguments, that is, row by row: the four numbers of the first row, then the second row, and so on.

### Exceptions

None.

## Examples

```js
const t = CATransform3D.translation(10, 20);
console.log(String(t));
console.log(JSON.stringify(t));
```

**Result**

- The first line logs `CATransform3D(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 20, 0, 1)`.
- The second line logs `{"m11":1,"m12":0,"m13":0,"m14":0,"m21":0,"m22":1,"m23":0,"m24":0,"m31":0,"m32":0,"m33":1,"m34":0,"m41":10,"m42":20,"m43":0,"m44":1}`.

## Corresponding iOS API

There is no corresponding function.

## See also

- [Structs](../structs.md): rules shared by all structs
