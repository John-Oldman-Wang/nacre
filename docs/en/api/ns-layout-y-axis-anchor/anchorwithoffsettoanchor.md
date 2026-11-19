---
type: reference
native: "-[NSLayoutYAxisAnchor anchorWithOffsetToAnchor:]"
---

# `NSLayoutYAxisAnchor`: `anchorWithOffsetToAnchor()` method

The **`anchorWithOffsetToAnchor()`** method returns a dimension anchor that represents the distance from this anchor to `other`.

The returned anchor can form constraints just like `widthAnchor`. Use it to make two gaps equal, or to make a gap equal to some size.

## Syntax

```
anchorWithOffsetToAnchor(other)
```

### Parameters

**`other`**

Another `NSLayoutYAxisAnchor`.

### Return value

An [`NSLayoutDimension`](../ns-layout-dimension.md) that represents the distance between the two anchors.

### Exceptions

**`TypeError`**

`other` is a different kind of anchor, or not an anchor. The error message is the same as for [`constraintEqualToAnchor()`](../ns-layout-anchor/constraintequaltoanchor.md). **This case is not verified in the simulator.**

## Examples

```js
const parent = new UIView();
const left = new UIView();
const middle = new UIView();
const right = new UIView();
for (const v of [left, middle, right]) {
  v.translatesAutoresizingMaskIntoConstraints = false;
  parent.addSubview(v);
}

const gapA = left.bottomAnchor.anchorWithOffsetToAnchor(middle.topAnchor);
const gapB = middle.bottomAnchor.anchorWithOffsetToAnchor(right.topAnchor);
gapA.constraintEqualToAnchor(gapB).isActive = true;
```

**Effect**: the gap from `left` to `middle` equals the gap from `middle` to `right`. **Not verified in the simulator.**

## Corresponding iOS API

`-[NSLayoutYAxisAnchor anchorWithOffsetToAnchor:]`.

## See also

- [`NSLayoutDimension`](../ns-layout-dimension.md): the constraints the return value can form
