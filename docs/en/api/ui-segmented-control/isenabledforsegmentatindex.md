---
type: reference
native: "-[UISegmentedControl isEnabledForSegmentAtIndex:]"
---

# `UISegmentedControl`: `isEnabledForSegmentAtIndex()` method

The **`isEnabledForSegmentAtIndex()`** method returns whether a segment can be tapped.

## Syntax

```
isEnabledForSegmentAtIndex(index)
```

### Parameters

**`index`**

The segment index, starting at 0. Fractions are truncated toward zero. Must be less than [`numberOfSegments`](numberofsegments.md).

### Return value

A boolean. `true`: the segment can be tapped. `false`: it was disabled with [`setEnabled()`](setenabled.md). Every segment is `true` by default. It does not reflect the whole control's [`isEnabled`](../ui-control/isenabled.md). **What it returns while the whole control is disabled is not verified in the simulator.**

### Exceptions

**`TypeError`**

- The index is out of range or negative: `isEnabledForSegmentAtIndex: segment 4 is out of range; expected 0 to 3` (with 4 segments). With no segments at all: `isEnabledForSegmentAtIndex: segment 0 is out of range; there are none`.
- The index does not convert to a finite number: `isEnabledForSegmentAtIndex must be a finite number, got "first"`.

## Examples

```js
const seg = new UISegmentedControl(['Day', 'Week']);
seg.setEnabled(false, { forSegmentAtIndex: 0 });
console.log(seg.isEnabledForSegmentAtIndex(0), seg.isEnabledForSegmentAtIndex(1));
```

**Result**: logs `false true`.

## Corresponding iOS API

`-[UISegmentedControl isEnabledForSegmentAtIndex:]`. Natively an out-of-range index does not always raise an error; here it always throws `TypeError`.

## See also

- [`setEnabled()`](setenabled.md)
