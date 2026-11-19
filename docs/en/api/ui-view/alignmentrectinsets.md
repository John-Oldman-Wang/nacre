---
type: reference
native: UIView.alignmentRectInsets
---

# `UIView`: `alignmentRectInsets` property

The **`alignmentRectInsets`** property gives how far the view's alignment rectangle is inset from `frame`. The alignment rectangle is the rectangle that constraints align with, and it can exclude decorations such as shadows.

## Value

A [`UIEdgeInsets`](../ui-edge-insets.md), in [pt](../units.md).

- Read-only; assigning to it throws `TypeError`.
- For a plain `UIView` it is `(0, 0, 0, 0)`, so the alignment rectangle is the `frame`. **Not verified in the simulator.**
- The type it reads back as is checked in the acceptance tests.
- In ObjC, subclasses override it to change the alignment rectangle; here it can only be read, not changed.

## Examples

```js
const view = new UIView();
console.log(String(view.alignmentRectInsets));
```

**Result**: Prints `UIEdgeInsets(0, 0, 0, 0)`. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.alignmentRectInsets`.

## See also

- [`alignmentRectForFrame()`](alignmentrectforframe.md), [`frameForAlignmentRect()`](frameforalignmentrect.md)
