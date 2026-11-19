---
type: reference
native: "-[UIView bringSubviewToFront:]"
---

# `UIView`: `bringSubviewToFront()` method

The **`bringSubviewToFront()`** method moves a subview to the top.

## Syntax

```
bringSubviewToFront(view)
```

### Parameters

**`view`**

A subview of the receiver.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

The argument isn't a view (another native object, `null`, a number, or missing): `bringSubviewToFront needs a UIView`.

The result when `view` isn't a subview of the receiver is **not verified in the simulator**.

## Examples

```js
const page = new UIView();
const a = new UIView();
a.frame = new CGRect(40, 300, 120, 120);
a.backgroundColor = 'systemRed';
const b = new UIView();
b.frame = new CGRect(100, 360, 120, 120);
b.backgroundColor = 'systemBlue';
page.addSubview(a);
page.addSubview(b);

page.bringSubviewToFront(a);
console.log(page.subviews[1] === a);
```

**Effect**: The overlapping area now shows red. The console prints `true`. The effect on screen is **not verified in the simulator**.

## Corresponding iOS API

`-[UIView bringSubviewToFront:]`.

## See also

- [`sendSubviewToBack()`](sendsubviewtoback.md)
- [`insertSubview()`](insertsubview.md)
- [Changing the stacking order](../../guides/views.md#adjusting-stacking-order)
