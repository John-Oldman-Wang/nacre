---
type: reference
native: UISegmentedControl.selectedSegmentIndex
---

# `UISegmentedControl`: `selectedSegmentIndex` property

The **`selectedSegmentIndex`** property is the index of the selected segment, starting at 0. -1 means no segment is selected.

## Value

A number: an index.

- Readable and writable.
- The default is -1: a newly created control has no selected segment.
- Writing -1 clears the selection, and no segment looks selected. **How this looks on screen is not verified in the simulator.**
- Written values are first converted to a number, and fractions are truncated toward zero: writing `2.9` gives 2.
- Inserting a segment before the selected one increases it by one, so it still points to the segment that was selected; removing an earlier segment decreases it by one.
- If the removed segment is the selected one, it becomes -1. It is also -1 after [`removeAllSegments()`](removeallsegments.md).
- When [`isMomentary`](ismomentary.md) is `true`, reading it in a `change` callback gives the segment the user tapped.

### Observing changes

When the user taps a different segment, the control fires [`change`](../ui-control/change-event.md). Writes from code do not fire it: in the acceptance tests, no `change` arrived within 300 milliseconds after a write. Index changes caused by inserting or removing segments do not fire it either. **That inserting and removing do not fire it is not verified in the simulator.**

### Invalid values

A value that is not a valid index throws `TypeError`, and the property keeps its previous value.

- Out of range (greater than or equal to the number of segments, or less than -1): `selectedSegmentIndex 4 is out of range; expected 0 to 3, or -1 for none selected` (with 4 segments). With no segments at all: `selectedSegmentIndex 0 is out of range; there are no segments, so only -1 (none selected) is allowed`.
- Does not convert to a finite number (`'first'`, `undefined`): `selectedSegmentIndex must be a finite number, got "first"`.

## Examples

```js
const titles = ['Day', 'Week', 'Month'];
const seg = new UISegmentedControl(titles);
seg.selectedSegmentIndex = 0;
seg.addEventListener('change', () => {
  console.log('Selected', titles[seg.selectedSegmentIndex]);
});
```

**Effect**: "Day" is selected at first. When the user taps "Month", the console logs `Selected Month`. **The tap behavior is not verified in the simulator.**

## Corresponding iOS API

`UISegmentedControl.selectedSegmentIndex`. `UISegmentedControlNoSegment` is written as -1. Natively, after the selected segment is removed it reads -2; here it is -1. Natively an out-of-range write raises no error; here it throws `TypeError`.

## See also

- [`change`](../ui-control/change-event.md) event
- [`isMomentary`](ismomentary.md): segments do not stay selected after a tap
