---
type: reference
native: NSLayoutConstraint.active
---

# `NSLayoutConstraint`: `isActive` property

The **`isActive`** property indicates whether the constraint takes part in layout.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The constraint takes part in layout |
| `false` | The constraint has no effect |

- Readable and writable.
- A new constraint is `false`: anchor methods only create constraints, they don't activate them. This default comes from UIKit's definition and is **not verified in the simulator**.
- Written values are converted with `Boolean()`.
- On activation, the system stores the constraint on the nearest common ancestor of the views at its two ends; you can read it back from that view's [`constraints`](../ui-view/constraints.md).
- Setting it doesn't change the view's `frame` right away; the system computes it on the next layout pass. To read the result immediately, call [`layoutIfNeeded()`](../ui-view/layoutifneeded.md) first.
- A deactivated constraint object still exists and can be activated again later.
- There's no change notification. Only the app's own code changes it.

To activate or deactivate several at once, use [`NSLayoutConstraint.activateConstraints()`](activateconstraints.md) and [`deactivateConstraints()`](deactivateconstraints.md). When activating one at a time, the first few are already in effect while the rest aren't yet, and layout passes through a state with incomplete constraints.

### Invalid values

`isActive = true` when the views at the two ends have no common ancestor (for example, one of them hasn't been added with `addSubview()` yet): throws a `TypeError` whose message starts with `failed to activate constraint:`, followed by the reason UIKit gives. So add the views to the view hierarchy first, then activate the constraints.

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const c = box.heightAnchor.constraintEqualToConstant(44);
console.log(c.isActive);
c.isActive = true;
console.log(c.isActive);
```

**Result**: Prints `false`, then `true`.

## Corresponding iOS API

`NSLayoutConstraint.active`. Its ObjC getter name is `isActive`, and JS uses that name for both reading and writing. `[view addConstraint:c]` and `[view removeConstraint:c]` have no JS counterpart; use `c.isActive = true` and `c.isActive = false`.

## See also

- [`NSLayoutConstraint.activateConstraints()`](activateconstraints.md)
- [Creating and activating are two steps](../auto-layout.md#creating-and-activating-are-two-steps)
