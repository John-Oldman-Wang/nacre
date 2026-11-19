---
type: reference
native: "-[UIView addSubview:]"
---

# `UIView`: `addSubview()` method

The **`addSubview()`** method adds a view as a subview, placed last, that is, on top.

## Syntax

```
addSubview(view)
```

### Parameters

**`view`**

The `UIView` to add.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- Adding a view as its own subview: `addSubview: raised NSInvalidArgumentException: Can't add self as subview`.
- The argument isn't a view (another native object, `null`, a number, or missing): `addSubview needs a UIView`.
- The argument is a window not yet bound to a scene (the object you get from `new UIWindow()` without an argument): `addSubview:: UIWindow has no native object yet, so it cannot be passed as an argument`.

On error the view hierarchy is unchanged, and the view remains usable afterward.

## Description

- If `view` already has a superview, it is first removed from that superview; it doesn't appear in two places. **Not verified in the simulator.** So to move a view from one superview to another, you don't need to remove it first.
- The result of adding `view` again when it is already a subview of the receiver is **not verified in the simulator**.
- The view hierarchy can't contain cycles. What happens when you add a view to one of its own descendants (for example `dot.addSubview(card)`, where `dot` is a subview of `card`) is **not verified in the simulator**. You can check first with [`isDescendantOfView()`](isdescendantofview.md).
- Once added to the hierarchy, the view is kept alive by its superview, so you don't need to hold it in a variable. See [Who keeps a view alive](../../guides/views.md#who-keeps-a-view).

## Examples

```js
const card = new UIView();
card.frame = new CGRect(40, 120, 200, 120);
card.backgroundColor = 'systemIndigo';

const dot = new UIView();
dot.frame = new CGRect(16, 16, 40, 40);
dot.backgroundColor = 'systemOrange';
card.addSubview(dot);
```

**Effect**: Once `card` is added to the hierarchy and displayed, there is a 40 × 40 pt orange square inside its top-left corner, 16 pt from the left and top edges of `card`. A subview's coordinates are relative to its superview's top-left corner.

## Corresponding iOS API

`-[UIView addSubview:]`.

## See also

- [`insertSubview()`](insertsubview.md): adds at a given position
- [`removeFromSuperview()`](removefromsuperview.md)
- [View hierarchy and stacking order](../ui-view.md#view-hierarchy-and-stacking-order)
