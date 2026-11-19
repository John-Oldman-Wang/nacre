---
type: reference
native: "-[UISegmentedControl setImage:forSegmentAtIndex:]"
---

# `UISegmentedControl`: `setImage()` method

The **`setImage()`** method sets a segment's image. A segment shows either a title or an image: setting an image on a title segment removes its title.

## Syntax

```
setImage(image, { forSegmentAtIndex })
```

### Parameters

**`image`**

The segment's image: a [`UIImage`](../ui-image.md) or `null`. `null` removes the image.

**`options.forSegmentAtIndex`**

The segment index, starting at 0; required. Fractions are truncated toward zero. Must be less than [`numberOfSegments`](numberofsegments.md).

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `forSegmentAtIndex` is not given: `setImage needs { forSegmentAtIndex }`.
- The index is out of range or negative: `setImage: segment 4 is out of range; expected 0 to 3` (with 4 segments). With no segments at all: `setImage: segment 0 is out of range; there are none`.
- `image` is neither a `UIImage` nor `null`: `setImage needs a UIImage or null`.

## Examples

```js
const seg = new UISegmentedControl(['Day', 'Week', 'Month']);
const star = UIImage.systemImageNamed('star.fill');
if (star !== null) {
  seg.setImage(star, { forSegmentAtIndex: 2 });
  console.log(seg.titleForSegmentAtIndex(2));
}
```

**Result**: logs `null`. Segment 2 shows a star icon, and its original title "Month" is gone. **How the icon looks is not verified in the simulator.**

## Corresponding iOS API

`-[UISegmentedControl setImage:forSegmentAtIndex:]`. Natively, an out-of-range index sometimes raises an exception and sometimes does nothing; here it always throws `TypeError`.

## See also

- [`imageForSegmentAtIndex()`](imageforsegmentatindex.md): reads the segment's image
- [`setTitle()`](settitle.md): turns the segment into a title segment
- [`UIImage`](../ui-image.md)
