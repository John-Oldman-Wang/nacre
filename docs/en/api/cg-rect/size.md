---
type: reference
native: CGRect.size
---

# `CGRect`: `size` property

The **`size`** property is the rectangle's size, of type [`CGSize`](../cg-size.md). It is the same set of numbers as the rectangle's `width` and `height` fields.

## Value

A [`CGSize`](../cg-size.md), equal to `(width, height)`.

- Read-only; assigning to it throws `TypeError`.
- Each read gives a new `CGSize`, so `r.size === r.size` is `false`.
- `size` doesn't appear in the output of `JSON.stringify`; the JSON has only the four fields `x`, `y`, `width`, and `height`.
- Where a rectangle is accepted on write, a plain object is recognized only by the four direct fields. A shape like `{ origin, size }` isn't accepted and throws as "missing fields"; see [Structs](../structs.md#plain-objects-can-be-given-when-writing).

## Examples

```js
const r = new CGRect(10, 20, 100, 50);
console.log(String(r.size));
console.log(r.size === r.size);
```

**Result**: It prints `CGSize(100, 50)`, then `false`.

## Corresponding iOS API

`CGRect.size`. ObjC has only the nested form; here both exist: `rect.size.width` and `rect.width` read the same number.

## See also

- [`width`](./width.md), [`height`](./height.md): reading the fields directly
- [Structs](../structs.md): rules shared by all structs: read-only fields, plain objects accepted on write, new objects on read
