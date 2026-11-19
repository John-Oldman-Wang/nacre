---
type: reference
native: UISegmentedControl.apportionsSegmentWidthsByContent
---

# `UISegmentedControl`: `apportionsSegmentWidthsByContent` property

The **`apportionsSegmentWidthsByContent`** property determines whether segment widths are apportioned by content or are all equal.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Segments with longer titles are wider, and segments with shorter titles are narrower |
| `false` | All segments are equal in width |

- Readable and writable.
- The default is `false`.
- Written values are converted by JS truthiness.
- A segment given a width with [`setWidth()`](setwidth.md) is shown at that width.
- How each value looks on screen is **not verified in the simulator**.

## Examples

```js
const seg = new UISegmentedControl(['All', 'Unread', 'Marked as important']);
seg.apportionsSegmentWidthsByContent = true;
```

**Effect**: the "Marked as important" segment is wider than the other two. **Not verified in the simulator.**

## Corresponding iOS API

`UISegmentedControl.apportionsSegmentWidthsByContent`.

## See also

- [`setWidth()`](setwidth.md): sets the width of a single segment
