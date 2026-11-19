---
type: reference
native: CAFrameRateRange.preferred
---

# `CAFrameRateRange`: `preferred` property

The **`preferred`** property is the preferred frame rate.

## Value

A number, in frames per second. All three fields being 0 means the system decides. How many callbacks per second actually happen after it's set is **not verified in the simulator**.

- Read-only. Assigning to it throws `TypeError: preferred is read-only: structs are values, assign a whole new one instead`.
- The value is fixed at construction and doesn't change afterward.

## Examples

```js
const range = new CAFrameRateRange(30, 60, 30);
console.log(range.preferred);
```

**Result**: Prints `30`.

## Corresponding iOS API

The C struct field `CAFrameRateRange.preferred`.

## See also

- [`CAFrameRateRange()`](constructor.md): this field is given at construction
- [`CADisplayLink`](../ca-animation.md): uses it in `preferredFrameRateRange`
- [Structs](../structs.md): the rules shared by all structs: read-only fields, plain objects accepted on write, a new object on every read
