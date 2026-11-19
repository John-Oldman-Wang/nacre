---
type: reference
native: "-[UISegmentedControl insertSegmentWithTitle:atIndex:animated:]"
---

# `UISegmentedControl`: `insertSegmentWithTitle()` method

The **`insertSegmentWithTitle()`** method inserts a title segment at the given position.

## Syntax

```
insertSegmentWithTitle(title, { atIndex[, animated] })
```

### Parameters

**`title`**

The segment's title. Converted to a string: the number `7` becomes `'7'`. `null` and `undefined` produce a segment with no title.

**`options.atIndex`**

The index of the segment to insert before. An integer; required. When it equals the current number of segments, the segment is inserted at the end; when it is larger than that, the segment is also inserted at the end. Fractions are truncated toward zero.

**`options.animated`** <small>optional</small>

A boolean. `true`: animates the insertion. When omitted, there is no animation.

### Return value

None (`undefined`).

[`numberOfSegments`](numberofsegments.md) has already increased by one when the method returns; even when animated, you do not need to wait for the animation to finish. The indexes of the segments after the insertion point increase by one, and [`selectedSegmentIndex`](selectedsegmentindex.md) changes with them, so it still points to the segment that was selected.

### Exceptions

**`TypeError`**

- `atIndex` is not given: `insertSegmentWithTitle needs { atIndex }`.
- `atIndex` is negative: `atIndex must be a non-negative integer, got -1`.
- `atIndex` does not convert to a finite number (for example `NaN`): the message starts with `atIndex must be a finite number`.

After a throw, the number of segments is unchanged.

## Examples

```js
const seg = new UISegmentedControl(['Day', 'Week', 'Month']);
seg.insertSegmentWithTitle('Year', { atIndex: 3, animated: true });
console.log(seg.numberOfSegments, seg.titleForSegmentAtIndex(3));
```

**Effect**: logs `4 Year`. A "Year" segment appears on the far right, animated. **The animation is not verified in the simulator.**

## Corresponding iOS API

`-[UISegmentedControl insertSegmentWithTitle:atIndex:animated:]`. `animated` is a required argument natively; here it can be omitted.

## See also

- [`insertSegmentWithImage()`](insertsegmentwithimage.md): inserts an image segment
- [`removeSegmentAtIndex()`](removesegmentatindex.md): removes one segment
