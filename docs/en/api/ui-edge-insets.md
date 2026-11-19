---
type: reference
native: UIEdgeInsets
---

# `UIEdgeInsets`

**`UIEdgeInsets`** represents how far each of the four edges is inset: `top`, `left`, `bottom`, `right`, in [pt](units.md). The four numbers start from the top edge and go counterclockwise: top, left, bottom, right.

`left` and `right` are always the left and right of the screen. When the UI needs to support right-to-left languages, use [`NSDirectionalEdgeInsets`](ns-directional-edge-insets.md), whose left and right swap with text direction.

Fields are read-only, so to change one you replace the whole struct; where a struct is accepted on write, a plain object with all fields can also be given; each read of a property returns a new object. These rules hold for all structs; see [Structs](structs.md).

**Inheritance**: None. `UIEdgeInsets` is a plain JS class; it does not inherit from `NSObject` and is not an `EventTarget`.

## Constructor

[`UIEdgeInsets()`](ui-edge-insets/constructor.md)

Creates a set of insets from four numbers: top, left, bottom, right. Omitted arguments are 0.

## Instance properties

| Property | Description |
| --- | --- |
| [`top`](ui-edge-insets/top.md) <small>read-only</small> | Top inset, pt |
| [`left`](ui-edge-insets/left.md) <small>read-only</small> | Left inset, pt |
| [`bottom`](ui-edge-insets/bottom.md) <small>read-only</small> | Bottom inset, pt |
| [`right`](ui-edge-insets/right.md) <small>read-only</small> | Right inset, pt |

## Examples

```js
const box = new UIView();
box.layoutMargins = new UIEdgeInsets(8, 16, 8, 16);
console.log(String(new UIEdgeInsets(8, 16, 8, 16)));
```

**Result**: `box`'s layout margins become 8 pt at the top and bottom and 16 pt on the left and right. The console prints `UIEdgeInsets(8, 16, 8, 16)`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `UIEdgeInsetsMake(8, 16, 8, 16)` | `new UIEdgeInsets(8, 16, 8, 16)` |
| `UIEdgeInsetsZero` | `new UIEdgeInsets()` |

## See also

- [Structs](structs.md): the rules shared by all structs, and converting to strings and JSON
- Where it is used: `layoutMargins` and `safeAreaInsets` on [`UIView`](ui-view.md), `contentInset` on [`UIScrollView`](ui-scroll-view.md)
- [`NSDirectionalEdgeInsets`](ns-directional-edge-insets.md): the version whose left and right swap with text direction
