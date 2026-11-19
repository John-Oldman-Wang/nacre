---
type: reference
native: "-[UISegmentedControl imageForSegmentAtIndex:]"
---

# `UISegmentedControl`: `imageForSegmentAtIndex()` method

The **`imageForSegmentAtIndex()`** method returns a segment's image.

## Syntax

```
imageForSegmentAtIndex(index)
```

### Parameters

**`index`**

The segment index, starting at 0. Fractions are truncated toward zero. Must be less than [`numberOfSegments`](numberofsegments.md).

### Return value

A [`UIImage`](../ui-image.md), or `null`. It returns the same object that was set; comparing with `===` gives `true`. A title segment returns `null`.

### Exceptions

**`TypeError`**

- The index is out of range or negative: `imageForSegmentAtIndex: segment 4 is out of range; expected 0 to 3` (with 4 segments). With no segments at all: `imageForSegmentAtIndex: segment 0 is out of range; there are none`.
- The index does not convert to a finite number: `imageForSegmentAtIndex must be a finite number, got "first"`.

## Examples

```js
const star = UIImage.systemImageNamed('star.fill');
if (star !== null) {
  const seg = new UISegmentedControl(['Day', star]);
  console.log(seg.imageForSegmentAtIndex(1) === star, seg.imageForSegmentAtIndex(0));
}
```

**Result**: logs `true null`.

## Corresponding iOS API

`-[UISegmentedControl imageForSegmentAtIndex:]`. Natively an out-of-range index does not always raise an error; here it always throws `TypeError`.

## See also

- [`setImage()`](setimage.md)
