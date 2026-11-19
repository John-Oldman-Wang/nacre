---
type: reference
native: UISegmentedControl.momentary
---

# `UISegmentedControl`: `isMomentary` property

The **`isMomentary`** property determines whether a segment keeps its selected look after it is tapped. Set it to `true` to use the segmented control as a row of buttons.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Tapping a segment flashes it, and it does not stay selected. Tapping the same segment repeatedly fires [`change`](../ui-control/change-event.md) every time |
| `false` | The tapped segment stays selected. Tapping the already selected segment again does not fire `change` |

- Readable and writable.
- The default is `false`.
- Written values are converted by JS truthiness.
- How each value looks on screen, and when `change` fires, is **not verified in the simulator**.

## Examples

```js
const actions = new UISegmentedControl(['Copy', 'Paste', 'Delete']);
actions.isMomentary = true;
actions.addEventListener('change', () => {
  console.log('Tapped segment', actions.selectedSegmentIndex);
});
```

**Effect**: tapping a segment flashes it, and the console logs which segment was tapped. **Not verified in the simulator.**

## Corresponding iOS API

`UISegmentedControl.momentary` (the getter is `isMomentary`).

## See also

- [`selectedSegmentIndex`](selectedsegmentindex.md)
