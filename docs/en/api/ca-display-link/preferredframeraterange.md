---
type: reference
native: CADisplayLink.preferredFrameRateRange
---

# `CADisplayLink`: `preferredFrameRateRange` property

The **`preferredFrameRateRange`** property is how many callbacks per second you'd like. The system picks the actual frame rate within this range.

## Value

A `CAFrameRateRange` with three fields, all in frames per second:

| Field | Meaning |
| --- | --- |
| `minimum` | Lowest |
| `maximum` | Highest |
| `preferred` | Most preferred |

- Readable and writable.
- Defaults to `CAFrameRateRange(0, 0, 0)`. All three being 0 means the system decides.
- Writes accept a `CAFrameRateRange` or a plain object with these three fields.
- Reads return a new `CAFrameRateRange` whose fields are read-only; see [Structs](../structs.md).
- How many callbacks per second actually happen after setting it is **not verified in the simulator**.

## Examples

```js
const link = new CADisplayLink();
link.preferredFrameRateRange = new CAFrameRateRange(30, 60, 30);
console.log(String(link.preferredFrameRateRange));
```

**Result**: logs `CAFrameRateRange(30, 60, 30)` to the console.

## Corresponding iOS API

`CADisplayLink.preferredFrameRateRange`. `CAFrameRateRangeMake(30, 60, 30)` is written `new CAFrameRateRange(30, 60, 30)`.

## See also

- [Structs](../structs.md)
