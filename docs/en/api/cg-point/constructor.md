---
type: reference
native: CGPointMake
---

# `CGPoint()` constructor

The **`CGPoint()`** constructor creates a point.

## Syntax

```
new CGPoint([x[, y]])
```

### Parameters

**`x`**

The x-coordinate, in [pt](../units.md).

**`y`**

The y-coordinate, in pt. The origin is at the top left, and `y` increases downward.

Each argument is converted to a number:

- When omitted (`undefined`), the field is 0.
- Values that can be converted to a number (`'3'`, `null`, `true`) use the result of `Number()`: `3`, `0`, `1`. Type checking reports an error, so this isn't recommended.

### Return value

A new `CGPoint`. Its fields are read-only; see [Structs](../structs.md#fields-are-read-only-replace-the-whole-struct-to-change-one).

### Exceptions

**`TypeError`**

An argument can't be converted to a finite number (`NaN`, `Infinity`, `'abc'`): `a struct field must be a finite number, got NaN`, ending with the value received.

## Examples

```js
const p = new CGPoint(10, 20);
console.log(String(p));
// @ts-expect-error The types require two arguments; at runtime, omitted fields are 0
console.log(String(new CGPoint()));
```

**Result**: Prints `CGPoint(10, 20)`, then `CGPoint(0, 0)`.

## Corresponding iOS API

`CGPointMake`.

## See also

- [Structs](../structs.md): the rules shared by all structs: fields are read-only, plain objects are accepted on write, and reads return new objects
