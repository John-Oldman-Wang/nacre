---
type: reference
native: "-[UIView sendSubviewToBack:]"
---

# `UIView`: `sendSubviewToBack()` method

The **`sendSubviewToBack()`** method moves a subview to the bottom of the stacking order.

## Syntax

```
sendSubviewToBack(view)
```

### Parameters

**`view`**

A subview of the receiver.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

The argument isn't a view (another native object, `null`, a number, or missing): `sendSubviewToBack needs a UIView`.

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

page.sendSubviewToBack(b);
console.log(page.subviews[0] === b);
```

**Effect**: The overlapping area now shows red. Logs `true`. The on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

`-[UIView sendSubviewToBack:]`.

## See also

- [`bringSubviewToFront()`](bringsubviewtofront.md)
- [`insertSubview()`](insertsubview.md)
- [Changing the stacking order](../../guides/views.md#adjusting-stacking-order)
