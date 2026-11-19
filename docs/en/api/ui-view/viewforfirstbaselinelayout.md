---
type: reference
native: UIView.viewForFirstBaselineLayout
---

# `UIView`: `viewForFirstBaselineLayout` property

The **`viewForFirstBaselineLayout`** property is the view whose text baseline this view's [`firstBaselineAnchor`](firstbaselineanchor.md) actually uses.

## Value

A [`UIView`](../ui-view.md), or `null`.

- Read-only; assigning to it throws `TypeError`.
- A plain view returns itself. **Not verified in the simulator.**
- The type that reads back is checked in the acceptance tests.
- In ObjC, subclasses override it to choose which subview's baseline to use. Here it can only be read, not set.

## Examples

```js
const view = new UIView();
console.log(view.viewForFirstBaselineLayout === view);
```

**Result**: Logs `true`. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.viewForFirstBaselineLayout`.

## See also

- [`firstBaselineAnchor`](firstbaselineanchor.md)
- [`UIStackView.alignment`](../ui-stack-view/alignment.md): baseline alignment
