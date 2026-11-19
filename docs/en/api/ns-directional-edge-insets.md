---
type: reference
native: NSDirectionalEdgeInsets
---

# `NSDirectionalEdgeInsets`

**`NSDirectionalEdgeInsets`** represents how far each of the four edges is inset, with left and right distinguished by text direction: `top`, `leading`, `bottom`, `trailing`, in [pt](units.md).

`leading` is the side where text starts, and `trailing` is the side where text ends. In left-to-right languages `leading` is left and `trailing` is right; in right-to-left languages the two are swapped. The swapped effect is **not verified in the simulator**.

Fields are read-only; to change one, replace the whole struct with a new one. Where a struct is accepted on write, a plain object with all fields also works. Each property read gives a new object. These rules hold for all structs; see [Structs](structs.md).

**Inheritance**: None. `NSDirectionalEdgeInsets` is an ordinary JS class; it doesn't inherit from `NSObject` and isn't an `EventTarget`.

## Constructor

[`NSDirectionalEdgeInsets()`](ns-directional-edge-insets/constructor.md)

Creates a set of insets from four numbers: top, the text-start side, bottom, and the text-end side. Arguments not given are 0.

## Instance properties

| Property | Description |
| --- | --- |
| [`top`](ns-directional-edge-insets/top.md) <small>read-only</small> | Top inset, pt |
| [`leading`](ns-directional-edge-insets/leading.md) <small>read-only</small> | Inset on the side where text starts, pt |
| [`bottom`](ns-directional-edge-insets/bottom.md) <small>read-only</small> | Bottom inset, pt |
| [`trailing`](ns-directional-edge-insets/trailing.md) <small>read-only</small> | Inset on the side where text ends, pt |

## Examples

```js
const box = new UIView();
box.directionalLayoutMargins = new NSDirectionalEdgeInsets(1, 2, 3, 4);
console.log(String(box.layoutMargins));
```

**Result**: When the language is left-to-right, the console prints `UIEdgeInsets(1, 2, 3, 4)`. `directionalLayoutMargins` and `layoutMargins` are the same margins.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `NSDirectionalEdgeInsetsMake(8, 16, 8, 16)` | `new NSDirectionalEdgeInsets(8, 16, 8, 16)` |
| `NSDirectionalEdgeInsetsZero` | `new NSDirectionalEdgeInsets()` |

## See also

- [Structs](structs.md): rules shared by all structs, and converting to strings and JSON
- Where it is used: `directionalLayoutMargins` on [`UIView`](ui-view.md)
- [`UIEdgeInsets`](ui-edge-insets.md): the version with fixed left and right
