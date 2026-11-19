---
type: reference
native: "-[UISegmentedControl removeAllSegments]"
---

# `UISegmentedControl`: `removeAllSegments()` method

The **`removeAllSegments()`** method removes all segments.

## Syntax

```
removeAllSegments()
```

### Parameters

None.

### Return value

None (`undefined`).

After the method returns, [`numberOfSegments`](numberofsegments.md) is 0 and [`selectedSegmentIndex`](selectedsegmentindex.md) is -1.

### Exceptions

None.

## Examples

```js
const seg = new UISegmentedControl(['Day', 'Week', 'Month']);
seg.selectedSegmentIndex = 0;
seg.removeAllSegments();
console.log(seg.numberOfSegments, seg.selectedSegmentIndex);
```

**Result**: logs `0 -1`.

## Corresponding iOS API

`-[UISegmentedControl removeAllSegments]`.

## See also

- [`removeSegmentAtIndex()`](removesegmentatindex.md): removes one segment
