---
type: reference
native: "-[UISegmentedControl initWithItems:]"
---

# `UISegmentedControl()` constructor

The **`UISegmentedControl()`** constructor creates a segmented control, with one segment for each item in the array.

## Syntax

```
new UISegmentedControl()
new UISegmentedControl(items)
```

### Parameters

**`items`** <small>optional</small>

An array whose items are strings (the segment's title) or [`UIImage`](../ui-image.md) objects (the segment's image), in any mix. Numbers and booleans are converted to strings.

Omitting it, passing `null`, or passing an empty array all produce a control with no segments.

### Return value

A new `UISegmentedControl`.

- [`numberOfSegments`](numberofsegments.md) equals the number of items in `items`.
- [`selectedSegmentIndex`](selectedsegmentindex.md) is -1: no segment is selected. You usually write an initial value right after creating it.

### Exceptions

**`TypeError`**

- `items` is not an array: `new UISegmentedControl needs an array of strings and UIImages, got "日周月"`.
- An item is not a string, number, boolean, or `UIImage` (for example `null`, a `UIColor`, or a plain object): `new UISegmentedControl: items[1] must be a string or a UIImage, got null`.

## Examples

```js
const seg = new UISegmentedControl(['Day', 'Week', 'Month']);
seg.selectedSegmentIndex = 0;
console.log(seg.numberOfSegments);
```

**Result**: logs `3`. The three segments are "Day", "Week", and "Month", and segment 0 is selected.

### Mixing titles and icons

```js
const star = UIImage.systemImageNamed('star.fill');
if (star !== null) {
  const seg = new UISegmentedControl(['All', star]);
  console.log(seg.titleForSegmentAtIndex(1));
}
```

**Result**: logs `null`. Segment 1 is an image segment and has no title.

`systemImageNamed` returns `null` when the name does not exist, and putting `null` in the array throws, so check for `null` first.

## Corresponding iOS API

`-[UISegmentedControl initWithItems:]`. `new UISegmentedControl()` corresponds to `[[UISegmentedControl alloc] init]`.

## See also

- [`insertSegmentWithTitle()`](insertsegmentwithtitle.md): adds segments after creation
