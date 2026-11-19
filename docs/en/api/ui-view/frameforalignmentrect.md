---
type: reference
native: "-[UIView frameForAlignmentRect:]"
---

# `UIView`: `frameForAlignmentRect()` method

The **`frameForAlignmentRect()`** method converts an alignment rectangle to the corresponding `frame`. The alignment rectangle is the rectangle that constraints align with; it is inset from `frame` by [`alignmentRectInsets`](alignmentrectinsets.md).

## Syntax

```
frameForAlignmentRect(alignmentRect)
```

### Parameters

**`alignmentRect`**

A [`CGRect`](../cg-rect.md) or `{ x, y, width, height }`, in [pt](../units.md).

### Return value

The converted `frame`, a `CGRect`.

### Exceptions

**`TypeError`**

The argument isn't an object or is missing fields. The rules are the same as for [structs](../structs.md#plain-objects-can-be-given-when-writing), and the message starts with `frameForAlignmentRect`.

## Description

This method was added later and hasn't been called in the simulator; its effect is **not verified in the simulator**.

## Examples

```js
const view = new UIView();
const r = view.frameForAlignmentRect(new CGRect(10, 20, 100, 50));
console.log(String(r));
```

**Result**: A plain view's `alignmentRectInsets` is 0, so this prints `CGRect(10, 20, 100, 50)`. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIView frameForAlignmentRect:]`.

## See also

- [`alignmentRectInsets`](alignmentrectinsets.md)
- [`alignmentRectForFrame()`](alignmentrectforframe.md)
