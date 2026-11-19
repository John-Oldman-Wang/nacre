---
type: reference
native: UILayoutGuide.owningView
---

# `UILayoutGuide`: `owningView` property

The **`owningView`** property is the view this layout guide has been added to.

## Value

A [`UIView`](../ui-view.md), or `null`.

- Read-only. Assigning to it throws `TypeError`.
- `null` before it is added to a view. **This case is not verified in the simulator.**
- After it is added with the view's [`addLayoutGuide()`](../ui-view/addlayoutguide.md), it is that view; after it is removed with [`removeLayoutGuide()`](../ui-view/removelayoutguide.md), it goes back to `null`. **Going back to `null` after removal is not verified in the simulator.**
- For layout guides the system provides (such as `safeAreaLayoutGuide`), `owningView` is the view that provides it. **Not verified in the simulator.**
- No change notification. Only the App's own code changes it.

## Examples

```js
const card = new UIView();
const guide = new UILayoutGuide();
card.addLayoutGuide(guide);
console.log(guide.owningView === card);
```

**Result**: logs `true`.

## Corresponding iOS API

`UILayoutGuide.owningView`.

## See also

- [`layoutFrame`](layoutframe.md): expressed in its coordinate system
