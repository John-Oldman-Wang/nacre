---
type: reference
native: UIView.directionalLayoutMargins
---

# `UIView`: `directionalLayoutMargins` property

The **`directionalLayoutMargins`** property is the view's [layout margins](../ui-view.md#layout-margins): how far content should be from the view's four edges. Left and right are determined by text direction.

## Value

An [`NSDirectionalEdgeInsets`](../ns-directional-edge-insets.md), in [pt](../units.md). The fields are `top`, `leading`, `bottom`, and `trailing`.

- Readable and writable.
- The default is `(8, 8, 8, 8)`.
- `leading` is the side where text starts, and `trailing` is the side where text ends. In English and Chinese `leading` is on the left.
- It is the same data as [`layoutMargins`](layoutmargins.md): write one and the other changes accordingly. Prefer this one; the interface then swaps left and right automatically in right-to-left languages.
- It doesn't inset subviews automatically. Only two things use it: constraints aligned to [`layoutMarginsGuide`](layoutmarginsguide.md), and a [`UIStackView`](../ui-stack-view.md) with `isLayoutMarginsRelativeArrangement` turned on.
- The value that reads back isn't necessarily the value written: when [`insetsLayoutMarginsFromSafeArea`](insetslayoutmarginsfromsafearea.md) is `true` (the default), the system adds the safe area to the edges where the view extends outside the safe area. If you write 16 pt and the top safe area is 68 pt, the top margin reads back as 84 pt.
- A view controller's root view has a system-defined minimum margin; values written below the minimum read back as the minimum. **Not verified in the simulator.** This limit currently can't be turned off.
- On write you can pass an `NSDirectionalEdgeInsets` or a plain object with all four fields present. The fields of the struct that reads back are read-only, and each read returns a new object. See [Structs](../structs.md).
- No change notification. The system changes it in two cases: the safe area changes, or [`preservesSuperviewLayoutMargins`](preservessuperviewlayoutmargins.md) is on and the superview's layout margins change. There is currently no way to find out about either change.

### Invalid values

- Not an object: throws `TypeError: directionalLayoutMargins needs an object with all of: top, leading, bottom, trailing`.
- A field is missing or doesn't convert to a finite number: throws `TypeError: directionalLayoutMargins is missing …, or it is not a finite number`, with the missing field name in the middle.
- On error the property keeps its previous value. Field values are converted with `Number()`, so `'10'` works.

## Examples

```js
const box = new UIView();
box.directionalLayoutMargins = new NSDirectionalEdgeInsets(1, 2, 3, 4);
console.log(String(box.layoutMargins));

box.directionalLayoutMargins = { top: 12, leading: 20, bottom: 12, trailing: 20 };
console.log(String(box.directionalLayoutMargins));
```

**Result**: When the language is left-to-right, prints `UIEdgeInsets(1, 2, 3, 4)`, then `NSDirectionalEdgeInsets(12, 20, 12, 20)`.

## Corresponding iOS API

`UIView.directionalLayoutMargins`. `NSDirectionalEdgeInsetsMake(8, 16, 8, 16)` is written as `new NSDirectionalEdgeInsets(8, 16, 8, 16)`.

## See also

- [`layoutMargins`](layoutmargins.md), [`layoutMarginsGuide`](layoutmarginsguide.md)
- [Setting a view's layout margins](../../guides/views.md#giving-a-view-inner-margins)
- [Layout margins](../ui-view.md#layout-margins)
