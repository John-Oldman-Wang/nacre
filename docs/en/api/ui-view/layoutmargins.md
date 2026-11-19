---
type: reference
native: UIView.layoutMargins
---

# `UIView`: `layoutMargins` property

The **`layoutMargins`** property is the view's [layout margins](../ui-view.md#layout-margins), with left and right fixed to the left and right of the screen. It shares the same data as [`directionalLayoutMargins`](directionallayoutmargins.md).

## Value

[`UIEdgeInsets`](../ui-edge-insets.md), in [pt](../units.md). The fields are `top`, `left`, `bottom`, and `right`.

- Readable and writable.
- The default is `(8, 8, 8, 8)`.
- Writing either one changes [`directionalLayoutMargins`](directionallayoutmargins.md) too. If the interface needs to support right-to-left languages, use `directionalLayoutMargins`.
- The value that reads back includes the safe area, by the same rules as `directionalLayoutMargins`. See [`insetsLayoutMarginsFromSafeArea`](insetslayoutmarginsfromsafearea.md).
- You can write a `UIEdgeInsets` or a plain object with all four fields. The fields of the struct that reads back are read-only, and each read returns a new object. See [Structs](../structs.md).
- There is no change notification, for the same reason as `directionalLayoutMargins`.

### Invalid values

- Not an object: throws `TypeError: layoutMargins needs an object with all of: top, left, bottom, right`.
- A field is missing or can't be converted to a finite number: throws `TypeError: layoutMargins is missing …, or it is not a finite number`, where the middle part is the name of the missing field.
- On error, the property keeps its previous value. Field values are converted with `Number()`, so `'10'` works.

## Examples

```js
const box = new UIView();
box.layoutMargins = { top: 5, left: 6, bottom: 7, right: 8 };
console.log(String(box.directionalLayoutMargins));
```

**Result**: When the language is left-to-right, logs `NSDirectionalEdgeInsets(5, 6, 7, 8)`.

## Corresponding iOS API

`UIView.layoutMargins`. `UIEdgeInsetsMake(8, 16, 8, 16)` is written `new UIEdgeInsets(8, 16, 8, 16)`.

## See also

- [`directionalLayoutMargins`](directionallayoutmargins.md)
- [Layout margins](../ui-view.md#layout-margins)
