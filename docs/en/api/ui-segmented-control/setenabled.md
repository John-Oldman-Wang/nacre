---
type: reference
native: "-[UISegmentedControl setEnabled:forSegmentAtIndex:]"
---

# `UISegmentedControl`: `setEnabled()` method

The **`setEnabled()`** method disables or enables a single segment. To make the whole control untappable, write the inherited [`isEnabled`](../ui-control/isenabled.md).

## Syntax

```
setEnabled(enabled, { forSegmentAtIndex })
```

### Parameters

**`enabled`**

A boolean, converted by JS truthiness. `true`: the segment can be tapped. `false`: the segment is dimmed and does not respond to taps; the other segments work as usual.

**`options.forSegmentAtIndex`**

The segment index, starting at 0; required. Fractions are truncated toward zero. Must be less than [`numberOfSegments`](numberofsegments.md).

### Return value

None (`undefined`).

Every segment can be tapped by default.

### Exceptions

**`TypeError`**

- `forSegmentAtIndex` is not given: `setEnabled needs { forSegmentAtIndex }`.
- The index is out of range or negative: `setEnabled: segment 4 is out of range; expected 0 to 3` (with 4 segments). With no segments at all: `setEnabled: segment 0 is out of range; there are none`.

## Examples

```js
const seg = new UISegmentedControl(['Day', 'Week', 'Month']);
seg.setEnabled(false, { forSegmentAtIndex: 2 });
console.log(seg.isEnabledForSegmentAtIndex(2), seg.isEnabledForSegmentAtIndex(1));
```

**Effect**: logs `false true`. Segment 2 is dimmed and does not respond to taps. **The dimming and the lack of response to taps are not verified in the simulator.**

## Corresponding iOS API

`-[UISegmentedControl setEnabled:forSegmentAtIndex:]`. Natively, an out-of-range index sometimes raises an exception and sometimes does nothing; here it always throws `TypeError`.

## See also

- [`isEnabledForSegmentAtIndex()`](isenabledforsegmentatindex.md): reads whether the segment can be tapped
- [`isEnabled`](../ui-control/isenabled.md): disables the whole control
