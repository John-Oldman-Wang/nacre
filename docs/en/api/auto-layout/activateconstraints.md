---
type: reference
native: "+[NSLayoutConstraint activateConstraints:]"
---

# `NSLayoutConstraint.activateConstraints()` static method

The **`NSLayoutConstraint.activateConstraints()`** static method activates a group of constraints at once. It has the same effect as setting [`isActive`](isactive.md) to `true` on each one.

## Syntax

```
NSLayoutConstraint.activateConstraints(constraints)
```

### Parameters

**`constraints`**

An array of constraints, or any iterable object.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- A constraint's two ends have no common ancestor: the message starts with `failed to activate constraint:`, followed by the reason UIKit gives.
- The array contains an element that isn't a constraint (a number, a string, `null`, another native object): `activateConstraints needs a list of NSLayoutConstraint`.

> **Note:** If even one element in the array isn't a constraint, none of the batch is activated; the valid ones aren't activated on their own.

## Description

Use this method to activate several constraints at once. When setting `isActive` one at a time, the first few are already in effect while the rest aren't yet, and layout passes through a state with incomplete constraints; batch activation has no such intermediate state.

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const width = box.widthAnchor.constraintEqualToConstant(60);
const height = box.heightAnchor.constraintEqualToConstant(44);
NSLayoutConstraint.activateConstraints([width, height]);
console.log(width.isActive, height.isActive);
```

**Result**: Prints `true true`.

## Corresponding iOS API

`+[NSLayoutConstraint activateConstraints:]`.

## See also

- [`isActive`](isactive.md)
- [`deactivateConstraints()`](deactivateconstraints.md)
