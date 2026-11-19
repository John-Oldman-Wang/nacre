---
type: reference
native: UIView.window
---

# `UIView`: `window` property

The **`window`** property is the window the view is in.

## Value

A [`UIWindow`](../ui-window.md), or `null`.

- Read-only; assigning to it throws `TypeError`.
- The default is `null`. It is `null` when the view isn't connected to a window.
- A view is displayed only once it is added under a window, and then this property has a value.
- There is no change notification.

## Examples

```js
const view = new UIView();
console.log(view.window);
```

**Result**: Logs `null`. A newly created view isn't in any window.

## Corresponding iOS API

`UIView.window`.

## See also

- [`UIWindow`](../ui-window.md)
- [The view hierarchy and stacking order](../ui-view.md#view-hierarchy-and-stacking-order)
