---
type: reference
native: "-[UISegmentedControl setTitle:forSegmentAtIndex:]"
---

# `UISegmentedControl`: `setTitle()` method

The **`setTitle()`** method sets a segment's title. A segment shows either a title or an image: setting a title on an image segment removes its image.

## Syntax

```
setTitle(title, { forSegmentAtIndex })
```

### Parameters

**`title`**

The segment's title. Converted to a string: the number `7` becomes `'7'`. `null` and `undefined` remove the title.

**`options.forSegmentAtIndex`**

The segment index, starting at 0; required. Fractions are truncated toward zero. Must be less than [`numberOfSegments`](numberofsegments.md).

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `forSegmentAtIndex` is not given: `setTitle needs { forSegmentAtIndex }`.
- The index is out of range or negative: `setTitle: segment 4 is out of range; expected 0 to 3` (with 4 segments). With no segments at all: `setTitle: segment 0 is out of range; there are none`.

## Examples

```js
const seg = new UISegmentedControl(['Day', 'Week', 'Month']);
seg.setTitle('This week', { forSegmentAtIndex: 1 });
console.log(seg.titleForSegmentAtIndex(1));
```

**Result**: logs `This week`.

## Corresponding iOS API

`-[UISegmentedControl setTitle:forSegmentAtIndex:]`. Natively, an out-of-range index sometimes raises an exception and sometimes does nothing; here it always throws `TypeError`.

## See also

- [`titleForSegmentAtIndex()`](titleforsegmentatindex.md): reads the segment's title
- [`setImage()`](setimage.md): turns the segment into an image segment
