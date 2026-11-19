---
type: reference
native: "+[NSLayoutConstraint deactivateConstraints:]"
---

# `NSLayoutConstraint.deactivateConstraints()` static method

The **`NSLayoutConstraint.deactivateConstraints()`** static method deactivates a group of constraints at once. It has the same effect as setting [`isActive`](isactive.md) to `false` on each one.

## Syntax

```
NSLayoutConstraint.deactivateConstraints(constraints)
```

### Parameters

**`constraints`**

An array of constraints, or any iterable object.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- The array contains an element that isn't a constraint (a number, a string, `null`, another native object): `deactivateConstraints needs a list of NSLayoutConstraint`.

> **Note:** If even one element in the array isn't a constraint, none of the batch is deactivated; the valid ones aren't deactivated on their own.

## Description

A deactivated constraint object remains usable and can be activated again. If you only deactivate and don't add a replacement, nothing determines that quantity anymore, and the system reports no error. Measured: after deactivating only a card's height constraint, its height became 16 pt (the two 8 pt margins above and below), and the three color blocks inside it became 0 high.

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const width = box.widthAnchor.constraintEqualToConstant(60);
const height = box.heightAnchor.constraintEqualToConstant(44);
NSLayoutConstraint.activateConstraints([width, height]);
NSLayoutConstraint.deactivateConstraints([height]);
console.log(width.isActive, height.isActive);
```

**Result**: Prints `true false`.

## Corresponding iOS API

`+[NSLayoutConstraint deactivateConstraints:]`.

## See also

- [`isActive`](isactive.md)
- [`activateConstraints()`](activateconstraints.md)
