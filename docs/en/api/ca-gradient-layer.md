---
type: reference
native: CAGradientLayer
status: partial
---

# `CAGradientLayer`

**`CAGradientLayer`** represents a gradient layer: it draws a color gradient within its own rectangle. The gradient can run along a straight line, outward from a center, or around a center in a full turn.

It's a [layer](ca-layer.md). Like other sublayers, you set its `frame` yourself and add it under some view's layer. Give it at least two colors, or nothing is visible.

`CAGradientLayer` doesn't fire events. Its properties are only changed by the app's code, so there are no change notifications.

**Inheritance**: `EventTarget` → `NSObject` → [`CALayer`](ca-layer.md) → `CAGradientLayer`

For how to make a gradient background and change its direction, see the guide [Drawing rounded corners, shadows, gradients, and shapes with layers](../guides/layers.md).

## Constructor

[`CAGradientLayer()`](ca-gradient-layer/constructor.md)

Creates a gradient layer. Its size is 0 × 0 pt and it has no colors.

## Instance properties

Also inherits properties from [`CALayer`](ca-layer.md); commonly used ones are `frame` and `cornerRadius`.

| Property | Description |
| --- | --- |
| [`colors`](ca-gradient-layer/colors.md) | The colors the gradient passes through in order |
| [`locations`](ca-gradient-layer/locations.md) | The position of each color |
| [`startPoint`](ca-gradient-layer/startpoint.md) | The start point |
| [`endPoint`](ca-gradient-layer/endpoint.md) | The end point |
| [`type`](ca-gradient-layer/type.md) | The shape of the gradient |

## Instance methods

`CAGradientLayer` has no methods of its own. Also inherits methods from [`CALayer`](ca-layer.md).

## Unit coordinates

[`startPoint`](ca-gradient-layer/startpoint.md) and [`endPoint`](ca-gradient-layer/endpoint.md) use unit coordinates: `(0, 0)` is the layer's top-left corner and `(1, 1)` is the bottom-right corner, regardless of the layer's actual size. The default runs from `(0.5, 0)` to `(0.5, 1)`, that is, top to bottom.

What the two points mean for each [`type`](ca-gradient-layer/type.md):

| `type` | Effect | `startPoint` | `endPoint` |
| --- | --- | --- | --- |
| `'axial'` | Colors change along a straight line | Start of the line | End of the line |
| `'radial'` | Colors change outward from the center of a circle | Center of the circle | Determines the circle's size |
| `'conic'` | Colors change in a full turn around the center | Center | Determines the starting angle |

How `'radial'` and `'conic'` look when drawn is **not verified in the simulator**.

## Examples

### Gradient from top left to bottom right

```js
const card = new UIView();
card.frame = new CGRect(20, 100, 300, 160);

const gradient = new CAGradientLayer();
gradient.colors = ['#5856D6', '#FF2D55'];
gradient.startPoint = new CGPoint(0, 0);
gradient.endPoint = new CGPoint(1, 1);
gradient.frame = card.bounds;
card.layer.addSublayer(gradient);
```

**Effect**: the card's background shades from purple at the top-left corner to pink at the bottom-right corner.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[CAGradientLayer layer]` | `new CAGradientLayer()` |
| `gradient.colors = @[(id)a.CGColor, (id)b.CGColor]` | `gradient.colors = ['#000', '#fff']` |
| `gradient.locations = @[@0, @0.3, @1]` | `gradient.locations = [0, 0.3, 1]` |
| `gradient.type = kCAGradientLayerRadial` | `gradient.type = 'radial'` |

## See also

- [`CALayer`](ca-layer.md): the parent class; sublayer sizes, colors on layers
- [Drawing rounded corners, shadows, gradients, and shapes with layers](../guides/layers.md)
- [`UIColor`](ui-color.md): how to write color strings
