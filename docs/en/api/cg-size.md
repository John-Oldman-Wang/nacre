---
type: reference
native: CGSize
---

# `CGSize`

**`CGSize`** represents a size: a width `width` and a height `height`, in [pt](units.md).

Fields are read-only, so to change one you replace the whole struct; where a struct is accepted on write, a plain object with all fields can also be given; each read of a property returns a new object. These rules hold for all structs; see [Structs](structs.md).

**Inheritance**: None. `CGSize` is a plain JS class; it does not inherit from `NSObject` and is not an `EventTarget`.

## Constructor

[`CGSize()`](cg-size/constructor.md)

Creates a size from a width and a height. Omitted arguments are 0.

## Instance properties

| Property | Description |
| --- | --- |
| [`width`](cg-size/width.md) <small>read-only</small> | Width, pt |
| [`height`](cg-size/height.md) <small>read-only</small> | Height, pt |

## Examples

```js
const label = new UILabel();
label.text = 'Hello, Nacre';
const need = label.sizeThatFits(new CGSize(300, 1000));
console.log(need instanceof CGSize);
```

**Result**: `need` is the size the text needs, and the console prints `true`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `CGSizeMake(100, 50)` | `new CGSize(100, 50)` |
| `CGSizeZero` | `new CGSize()` |

## See also

- [Structs](structs.md): the rules shared by all structs, and converting to strings and JSON
- Where it is used: `sizeThatFits()` and `intrinsicContentSize` on [`UIView`](ui-view.md), `contentSize` on [`UIScrollView`](ui-scroll-view.md), `shadowOffset` on [`CALayer`](ca-layer.md)
- [`CGRect`](cg-rect.md): `size` is a `CGSize`
