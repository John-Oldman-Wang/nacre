---
type: reference
native: CGRect.origin
---

# `CGRect`: `origin` property

The **`origin`** property is the rectangle's top-left corner, of type [`CGPoint`](../cg-point.md). It is the same set of numbers as the rectangle's `x` and `y` fields.

## Value

A [`CGPoint`](../cg-point.md), equal to `(x, y)`.

- Read-only; assigning to it throws `TypeError`.
- Each read gives a new `CGPoint`, so `r.origin === r.origin` is `false`.
- `origin` doesn't appear in the output of `JSON.stringify`; the JSON has only the four fields `x`, `y`, `width`, and `height`.
- Where a rectangle is accepted on write, a plain object is recognized only by the four direct fields. A shape like `{ origin, size }` isn't accepted and throws as "missing fields"; see [Structs](../structs.md#plain-objects-can-be-given-when-writing).

## Examples

```js
const r = new CGRect(10, 20, 100, 50);
console.log(String(r.origin));
console.log(r.origin === r.origin);
```

**Result**: It prints `CGPoint(10, 20)`, then `false`.

## Corresponding iOS API

`CGRect.origin`. ObjC has only the nested form; here both exist: `rect.origin.x` and `rect.x` read the same number.

## See also

- [`x`](./x.md), [`y`](./y.md): reading the fields directly
- [Structs](../structs.md): rules shared by all structs: read-only fields, plain objects accepted on write, new objects on read
