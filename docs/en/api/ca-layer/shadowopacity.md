---
type: reference
native: CALayer.shadowOpacity
---

# `CALayer`: `shadowOpacity` property

The **`shadowOpacity`** property is the opacity of the shadow.

## Value

A number, a ratio from 0 to 1.

- Readable and writable.
- **Defaults to `0`, so no shadow is shown by default.** Setting only the color, radius, and offset changes nothing on screen.
- The shadow is generated from the outline of what is drawn in the layer. A view with no background color and no content has no shadow.
- The shadow is drawn outside the layer's bounds. When `masksToBounds` (on a view, `clipsToBounds`) is `true`, the shadow is clipped too.

### Invalid values

The written value is converted to a number with `Number()`. Values that don't convert to a finite number throw `TypeError`.

## Examples

```js
const card = new UIView();
card.backgroundColor = 'systemBackground';
card.layer.shadowOpacity = 0.25;
card.layer.shadowRadius = 8;
card.layer.shadowOffset = new CGSize(0, 4);
```

**Effect**: A soft black shadow appears below the card, offset 4 pt downward, with an 8 pt blurred edge and 25% opacity at its darkest. **How the shadow looks is not verified in the simulator.**

## Corresponding iOS API

`CALayer.shadowOpacity`.

## See also

- [`shadowColor`](shadowcolor.md)
