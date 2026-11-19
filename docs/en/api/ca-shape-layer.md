---
type: reference
native: CAShapeLayer
status: partial
---

# `CAShapeLayer`

**`CAShapeLayer`** represents a shape layer: it draws a path ([`UIBezierPath`](ui-bezier-path.md)). It first fills the area enclosed by the path, then strokes along the path. Line charts, pie charts, and progress rings are all drawn with it.

It is a [layer](ca-layer.md), and like any other sublayer you set its `frame` yourself and add it under some view's layer. It does not resize itself to fit the path: coordinates in the path are points in the layer's own coordinate system, with the origin at the layer's top-left corner.

> **Note:** [`fillColor`](ca-shape-layer/fillcolor.md) defaults to opaque black, and [`strokeColor`](ca-shape-layer/strokecolor.md) defaults to `null`. When you want just a line, set `fillColor` to `null` and give `strokeColor` a color.

`CAShapeLayer` fires no events. Its properties are changed only by the app's code, so there are no change notifications.

**Inheritance**: `EventTarget` → `NSObject` → [`CALayer`](ca-layer.md) → `CAShapeLayer`

For drawing polylines, pie slices, progress rings, and dashed lines, see the guide [Drawing rounded corners, shadows, gradients, and shapes with layers](../guides/layers.md).

## Constructor

[`CAShapeLayer()`](ca-shape-layer/constructor.md)

Creates a shape layer. Its size is 0 × 0 pt and it has no path.

## Instance properties

Also inherits the properties of [`CALayer`](ca-layer.md); commonly used ones are `frame` and `masksToBounds`.

| Property | Description |
| --- | --- |
| [`path`](ca-shape-layer/path.md) | The path to draw |

Fill:

| Property | Description |
| --- | --- |
| [`fillColor`](ca-shape-layer/fillcolor.md) | Fill color |
| [`fillRule`](ca-shape-layer/fillrule.md) | Which areas count as inside the path |

Stroke:

| Property | Description |
| --- | --- |
| [`strokeColor`](ca-shape-layer/strokecolor.md) | Line color |
| [`lineWidth`](ca-shape-layer/linewidth.md) | Line width |
| [`lineCap`](ca-shape-layer/linecap.md) | Shape of line ends |
| [`lineJoin`](ca-shape-layer/linejoin.md) | Shape of corners |
| [`miterLimit`](ca-shape-layer/miterlimit.md) | Length limit for sharp corners |
| [`strokeStart`](ca-shape-layer/strokestart.md) | Where along the path the stroke starts |
| [`strokeEnd`](ca-shape-layer/strokeend.md) | Where along the path the stroke ends |
| [`lineDashPattern`](ca-shape-layer/linedashpattern.md) | How dashes are drawn |
| [`lineDashPhase`](ca-shape-layer/linedashphase.md) | Where in the dash pattern drawing starts |

## Instance methods

`CAShapeLayer` has no methods of its own. It also inherits the methods of [`CALayer`](ca-layer.md).

## Examples

### A polyline

```js
const card = new UIView();
card.frame = new CGRect(20, 100, 300, 160);

const path = new UIBezierPath();
path.moveToPoint(new CGPoint(24, 120));
path.addLineToPoint(new CGPoint(96, 60));
path.addLineToPoint(new CGPoint(168, 96));

const line = new CAShapeLayer();
line.path = path;
line.fillColor = null;
line.strokeColor = 'systemBlue';
line.lineWidth = 3;
line.frame = card.bounds;
card.layer.addSublayer(line);
```

**Effect**: a 3 pt blue polyline with two segments appears on the card.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[CAShapeLayer layer]` | `new CAShapeLayer()` |
| `shape.path = path.CGPath` | `shape.path = path` |
| `shape.fillColor = UIColor.clearColor.CGColor` | `shape.fillColor = null` |
| `shape.fillRule = kCAFillRuleEvenOdd` | `shape.fillRule = 'evenOdd'` |
| `shape.lineCap = kCALineCapRound` | `shape.lineCap = 'round'` |
| `shape.lineJoin = kCALineJoinBevel` | `shape.lineJoin = 'bevel'` |
| `shape.lineDashPattern = @[@4, @2]` | `shape.lineDashPattern = [4, 2]` |

## See also

- [`UIBezierPath`](ui-bezier-path.md): the type of `path`, and how to draw paths
- [`CALayer`](ca-layer.md): the parent class; sublayer sizes and colors on layers
- [`CABasicAnimation`](ca-basic-animation.md): animating `strokeEnd` so the line draws itself bit by bit
- [Drawing rounded corners, shadows, gradients, and shapes with layers](../guides/layers.md)
