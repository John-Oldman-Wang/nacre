---
type: reference
native: CAFrameRateRange
---

# `CAFrameRateRange`

**`CAFrameRateRange`** represents a frame rate range: `minimum`, `maximum`, and `preferred` (the rate you'd most like), all in frames per second. It's the value of the `preferredFrameRateRange` property of [`CADisplayLink`](ca-animation.md). All three being 0 means the system decides.

Its fields are read-only; to change it, replace it with a whole new one. Where a struct is accepted on write, you can also pass a plain object with all the fields. Every read of a property returns a new object. These rules hold for all structs; see [Structs](structs.md).

**Inheritance**: None. `CAFrameRateRange` is a plain JS class; it doesn't inherit from `NSObject` and isn't an `EventTarget`.

## Constructor

[`CAFrameRateRange()`](ca-frame-rate-range/constructor.md)

Creates a range from minimum, maximum, and preferred frame rates. `preferred` can be omitted, in which case it's 0.

## Instance properties

| Property | Description |
| --- | --- |
| [`minimum`](ca-frame-rate-range/minimum.md) <small>read-only</small> | The minimum frame rate, in frames per second |
| [`maximum`](ca-frame-rate-range/maximum.md) <small>read-only</small> | The maximum frame rate, in frames per second |
| [`preferred`](ca-frame-rate-range/preferred.md) <small>read-only</small> | The preferred frame rate, in frames per second |

## Examples

```js
const range = new CAFrameRateRange(30, 60, 30);
console.log(String(range));
```

**Result**: Prints `CAFrameRateRange(30, 60, 30)`. How many callbacks per second actually happen after assigning it to a `CADisplayLink`'s `preferredFrameRateRange` is **not verified in the simulator**.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `CAFrameRateRangeMake(30, 60, 30)` | `new CAFrameRateRange(30, 60, 30)` |
| `CAFrameRateRangeDefault` | `new CAFrameRateRange(0, 0, 0)` |

## See also

- [Structs](structs.md): the rules shared by all structs, and converting them to strings and JSON
- [`CADisplayLink`](ca-animation.md): `preferredFrameRateRange` uses it
