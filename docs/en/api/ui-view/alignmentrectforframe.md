---
type: reference
native: "-[UIView alignmentRectForFrame:]"
---

# `UIView`: `alignmentRectForFrame()` method

The **`alignmentRectForFrame()`** method converts a `frame` to the corresponding alignment rectangle. The alignment rectangle is the rectangle that constraints align with; it is inset from `frame` by [`alignmentRectInsets`](alignmentrectinsets.md).

## Syntax

```
alignmentRectForFrame(frame)
```

### Parameters

**`frame`**

A [`CGRect`](../cg-rect.md) or `{ x, y, width, height }`, in [pt](../units.md).

### Return value

The converted alignment rectangle, a `CGRect`.

### Exceptions

**`TypeError`**

The argument isn't an object or is missing fields. The rules are the same as for [structs](../structs.md#plain-objects-can-be-given-when-writing), and the message starts with `alignmentRectForFrame`.

## Description

This method was added later and hasn't been called in the simulator; its effect is **not verified in the simulator**.

## Examples

```js
const view = new UIView();
const r = view.alignmentRectForFrame(new CGRect(10, 20, 100, 50));
console.log(String(r));
```

**Result**: A plain view's `alignmentRectInsets` is 0, so this prints `CGRect(10, 20, 100, 50)`. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIView alignmentRectForFrame:]`.

## See also

- [`alignmentRectInsets`](alignmentrectinsets.md)
- [`frameForAlignmentRect()`](frameforalignmentrect.md)
