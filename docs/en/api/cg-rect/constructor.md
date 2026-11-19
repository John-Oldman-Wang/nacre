---
type: reference
native: CGRectMake
---

# `CGRect()` constructor

The **`CGRect()`** constructor creates a rectangle: a top-left position plus a size.

## Syntax

```
new CGRect([x[, y[, width[, height]]]])
```

### Parameters

**`x`**, **`y`**

Coordinates of the rectangle's top-left corner, in [pt](../units.md).

**`width`**, **`height`**

The rectangle's width and height, in pt.

Each argument is converted to a number:

- When not given (`undefined`), the field is 0.
- Values that convert to numbers (`'3'`, `null`, `true`) use the result of `Number()`: `3`, `0`, `1`. Type checking reports an error, so writing them this way isn't recommended.

### Return value

A new `CGRect`. Its fields are read-only; see [Structs](../structs.md#fields-are-read-only-replace-the-whole-struct-to-change-one).

### Exceptions

**`TypeError`**

An argument doesn't convert to a finite number (`NaN`, `Infinity`, `'abc'`): `a struct field must be a finite number, got NaN`, ending with the value received.

## Examples

```js
const r = new CGRect(10, 20, 100, 50);
console.log(String(r));
// @ts-expect-error The type requires four arguments; at runtime, fields not given are 0
console.log(String(new CGRect()));
```

**Result**: It prints `CGRect(10, 20, 100, 50)`, then `CGRect(0, 0, 0, 0)`.

## Corresponding iOS API

`CGRectMake`.

## See also

- [`origin`](origin.md) and [`size`](size.md): reading the same numbers in nested form
- [Structs](../structs.md): rules shared by all structs: read-only fields, plain objects accepted on write, new objects on read
