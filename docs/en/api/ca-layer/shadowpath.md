---
type: reference
native: CALayer.shadowPath
---

# `CALayer`: `shadowPath` property

The **`shadowPath`** property is the shape of the shadow: given a path, the shadow is drawn in the shape of that path instead of being generated from what the layer draws.

## Value

A [`UIBezierPath`](../ui-bezier-path.md), or `null`.

- Readable and writable.
- Defaults to `null`: the shadow is generated from the outline of what the layer draws; see [`shadowOpacity`](shadowopacity.md).
- Coordinates in the path are in the layer's own coordinate system, with the origin at the layer's top-left corner, in [pt](../units.md).
- You read back the same object you wrote. Write `null` to remove the path; the shadow goes back to being generated from the content.
- **Modifying the path after writing it doesn't change the shadow.** The layer keeps the shape as it was at the moment of writing. After changing the path, assign it again. **Not verified on a device.**
- When the layer's size changes, the path doesn't follow. If the card's size changes, write the path again from the new `bounds` after the size has changed.
- The shadow's color, opacity, blur, and offset are still set by [`shadowColor`](shadowcolor.md), [`shadowOpacity`](shadowopacity.md), [`shadowRadius`](shadowradius.md), and [`shadowOffset`](shadowoffset.md). With `shadowOpacity` at 0, no shadow is visible even with a path.
- According to Apple's documentation, once a path is given the system no longer has to compute the shadow's shape from the content, which usually makes drawing faster; the shadow is drawn from the path even if the layer has no background color and no content. The on-screen effect is **not verified on a device**.

### Invalid values

**`TypeError`**

The value is some other native object, such as a view:

```
TypeError: shadowPath needs a UIBezierPath or null
```

The value is not a native object:

```
TypeError: shadowPath needs a native object or null, got "M0 0"
```

On error, the property keeps its previous value (measured).

## Examples

Give a rounded card a shadow of the same shape:

```js
const card = new UIView();
card.frame = new CGRect(20, 120, 280, 120);
card.backgroundColor = 'systemBackground';
card.layer.cornerRadius = 16;
card.layer.shadowOpacity = 0.2;
card.layer.shadowRadius = 10;
card.layer.shadowOffset = new CGSize(0, 4);
card.layer.shadowPath = UIBezierPath.bezierPathWithRoundedRect(card.bounds, { cornerRadius: 16 });

const path = card.layer.shadowPath;
console.log(path !== null && path.bounds.width);
```

**Effect**: The console prints `280`. Below the card is a rounded-rectangle shadow, offset 4 pt downward. **How the shadow looks is not verified on a device.**

## Corresponding iOS API

`CALayer.shadowPath`. In ObjC you write `path.CGPath`; here you write the `UIBezierPath` directly.

## See also

- [`shadowOpacity`](shadowopacity.md): without it the shadow doesn't show
- [`UIBezierPath`](../ui-bezier-path.md): how to trace a path
- [Drawing rounded corners, shadows, gradients, and shapes with layers](../../guides/layers.md)
