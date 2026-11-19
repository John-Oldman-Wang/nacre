---
type: reference
native: CAFrameRateRange.maximum
---

# `CAFrameRateRange`: `maximum` property

The **`maximum`** property is the maximum frame rate.

## Value

A number, in frames per second. All three fields being 0 means the system decides. How many callbacks per second actually happen after it's set is **not verified in the simulator**.

- Read-only. Assigning to it throws `TypeError: maximum is read-only: structs are values, assign a whole new one instead`.
- The value is fixed at construction and doesn't change afterward.

## Examples

```js
const range = new CAFrameRateRange(30, 60, 30);
console.log(range.maximum);
```

**Result**: Prints `60`.

## Corresponding iOS API

The C struct field `CAFrameRateRange.maximum`.

## See also

- [`CAFrameRateRange()`](constructor.md): this field is given at construction
- [`CADisplayLink`](../ca-animation.md): uses it in `preferredFrameRateRange`
- [Structs](../structs.md): the rules shared by all structs: read-only fields, plain objects accepted on write, a new object on every read
