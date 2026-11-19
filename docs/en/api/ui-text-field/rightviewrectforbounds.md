---
type: reference
native: "-[UITextField rightViewRectForBounds:]"
---

# `UITextField`: `rightViewRectForBounds()` method

The **`rightViewRectForBounds()`** method returns the rectangle occupied by the right view ([`rightView`](rightview.md)) when the text field is laid out within the given bounds.

## Syntax

```
rightViewRectForBounds(bounds)
```

### Parameters

**`bounds`**

A rectangle: a [`CGRect`](../structs.md) or a plain object like `{ x, y, width, height }`, in [pt](../units.md). Usually you pass the text field's own `bounds`.

### Return value

A [`CGRect`](../structs.md), in pt, in the text field's own coordinate system.

### Exceptions

**`TypeError`**

`bounds` is not a rectangle. **Not verified in the simulator.**

## Description

This method was added from the iOS headers and **has not been called in the simulator**. For usage, follow Apple's documentation.

## Examples

```js
const field = new UITextField();
field.frame = new CGRect(0, 0, 300, 44);
field.borderStyle = 'roundedRect';
const r = field.rightViewRectForBounds(field.bounds);
console.log(r.x, r.y, r.width, r.height);
```

**Result**: Prints the position and size of this rectangle. The exact numbers are **not verified in the simulator**.

## Corresponding iOS API

`-[UITextField rightViewRectForBounds:]`. In ObjC, a subclass overrides it to change where things are laid out; JS cannot subclass, so it can only call it to read the rectangle the system computes.

## See also

- [`UITextField`](../ui-text-field.md#instance-methods): the other methods in this group
