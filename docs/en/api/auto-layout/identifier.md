---
type: reference
native: NSLayoutConstraint.identifier
---

# `NSLayoutConstraint`: `identifier` property

The **`identifier`** property is a name you give a constraint, used only to tell it apart while debugging.

## Value

A string, or `null`.

- Readable and writable.
- Defaults to `null`. This default comes from UIKit's definition and is **not verified in the simulator**.
- Writing `null` or `undefined` gives `null`; other values are converted to strings.
- When constraints go wrong, the system prints nothing, so the only way to check is to list the constraints yourself. Naming the constraints you'll want to inspect later lets you recognize which is which in the output.

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const height = box.heightAnchor.constraintEqualToConstant(60);
height.identifier = 'card-height';
height.isActive = true;
for (const c of box.constraintsAffectingLayoutForAxis('vertical')) {
  console.log(c.identifier);
}
```

**Result**: One of the lines printed is `card-height`. The exact output of the loop is **not verified in the simulator**.

## Corresponding iOS API

`NSLayoutConstraint.identifier`.

## See also

- [`constraintsAffectingLayoutForAxis()`](../ui-view/constraintsaffectinglayoutforaxis.md)
