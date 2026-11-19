---
type: reference
native: CAFrameRateRangeMake
---

# `CAFrameRateRange()` constructor

The **`CAFrameRateRange()`** constructor creates a frame rate range for the `preferredFrameRateRange` of [`CADisplayLink`](../ca-animation.md).

## Syntax

```
new CAFrameRateRange([minimum[, maximum[, preferred]]])
```

### Parameters

**`minimum`**

The minimum frame rate, in frames per second.

**`maximum`**

The maximum frame rate, in frames per second.

**`preferred`**

The preferred frame rate, in frames per second. It can be omitted, in which case it's 0.

All three being 0 means the system decides.

Each argument is converted to a number:

- When omitted (`undefined`), the field is 0.
- Values that can be converted to a number (`'3'`, `null`, `true`) use the result of `Number()`: `3`, `0`, `1`. The type checker reports an error, so writing it this way isn't recommended.

### Return value

A new `CAFrameRateRange`. Its fields are read-only; see [Structs](../structs.md#fields-are-read-only-replace-the-whole-struct-to-change-one).

### Exceptions

**`TypeError`**

An argument can't be converted to a finite number (`NaN`, `Infinity`, `'abc'`): `a struct field must be a finite number, got NaN`, ending with the value received.

When writing a plain object to `preferredFrameRateRange`, all three fields (`minimum`, `maximum`, `preferred`) must be present; if one is missing, it throws `TypeError`. This differs from the constructor, where `preferred` can be omitted.

## Examples

```js
const range = new CAFrameRateRange(30, 60, 30);
console.log(String(range));
console.log(String(new CAFrameRateRange(30, 60)));
```

**Result**: Prints `CAFrameRateRange(30, 60, 30)` and then `CAFrameRateRange(30, 60, 0)`.

## Corresponding iOS API

`CAFrameRateRangeMake`.

## See also

- [Structs](../structs.md): the rules shared by all structs: read-only fields, plain objects accepted on write, a new object on every read
