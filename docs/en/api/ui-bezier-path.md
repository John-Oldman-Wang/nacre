---
type: reference
native: UIBezierPath
status: partial
---

# `UIBezierPath`

**`UIBezierPath`** represents a path: a geometric shape made of connected line segments, curve segments, and arcs. Rectangles, ovals, rounded rectangles, and arcs have ready-made creation methods; other shapes are drawn segment by segment, "move to a point, then line to the next point".

A path only describes a shape. It has no color and no line width, and nothing appears on screen after you create it. A path has three uses:

- Assign it to the `path` of a [`CAShapeLayer`](ca-layer.md#cashapelayer), and the shape layer draws it.
- Assign it to the `path` of a keyframe animation to move a layer along it; see [animation](ca-animation.md).
- Call [`containsPoint()`](ui-bezier-path/containspoint.md) to test whether a point is inside the shape.

**Inheritance**: `EventTarget` → `NSObject` → `UIBezierPath`

`UIBezierPath` can't be subclassed; see [native classes](native-classes.md). For how to draw common shapes, see the guide [Drawing a path](../guides/drawing-paths.md).

## Constructor

[`UIBezierPath()`](ui-bezier-path/constructor.md)

Creates an empty path; add segments to it afterward with the drawing methods.

## Static methods

These methods all return a new `UIBezierPath`:

| Method | Description |
| --- | --- |
| [`UIBezierPath.bezierPathWithRect()`](ui-bezier-path/bezierpathwithrect.md) | A rectangle |
| [`UIBezierPath.bezierPathWithOvalInRect()`](ui-bezier-path/bezierpathwithovalinrect.md) | The oval inscribed in a rectangle. A circle when the rectangle is a square |
| [`UIBezierPath.bezierPathWithRoundedRect()`](ui-bezier-path/bezierpathwithroundedrect.md) | A rounded rectangle; you can round only some of the corners |
| [`UIBezierPath.bezierPathWithArcCenter()`](ui-bezier-path/bezierpathwitharccenter.md) | An arc |

## Instance properties

| Property | Description |
| --- | --- |
| [`isEmpty`](ui-bezier-path/isempty.md) <small>read-only</small> | Whether the path contains nothing |
| [`bounds`](ui-bezier-path/bounds.md) <small>read-only</small> | The rectangle enclosing the whole path, not including line width |
| [`currentPoint`](ui-bezier-path/currentpoint.md) <small>read-only</small> | The current point: the next segment starts here |
| [`usesEvenOddFillRule`](ui-bezier-path/usesevenoddfillrule.md) | Which rule `containsPoint()` uses to decide what is inside |

## Instance methods

The drawing methods draw from the [current point](#what-a-path-is-made-of) to a new point:

| Method | Description |
| --- | --- |
| [`moveToPoint()`](ui-bezier-path/movetopoint.md) | Starts a new subpath without drawing a line |
| [`addLineToPoint()`](ui-bezier-path/addlinetopoint.md) | Draws a straight line |
| [`addCurveToPoint()`](ui-bezier-path/addcurvetopoint.md) | Draws a cubic Bézier curve, with two control points |
| [`addQuadCurveToPoint()`](ui-bezier-path/addquadcurvetopoint.md) | Draws a quadratic Bézier curve, with one control point |
| [`addArcWithCenter()`](ui-bezier-path/addarcwithcenter.md) | Adds an arc |
| [`closePath()`](ui-bezier-path/closepath.md) | Draws a straight line back to the start of this subpath |
| [`removeAllPoints()`](ui-bezier-path/removeallpoints.md) | Clears the path |

Combining, transforming, and querying:

| Method | Description |
| --- | --- |
| [`appendPath()`](ui-bezier-path/appendpath.md) | Adds another path into this one |
| [`applyTransform()`](ui-bezier-path/applytransform.md) | Moves, scales, or rotates this path |
| [`bezierPathByReversingPath()`](ui-bezier-path/bezierpathbyreversingpath.md) | A new path with the same shape and the opposite direction |
| [`containsPoint()`](ui-bezier-path/containspoint.md) | Whether a point is inside the shape |

## Events

Paths don't fire events. A path is changed only by code, and after a change, reading its properties gives the new values.

## What a path is made of

A path consists of one or more **subpaths**. Each subpath is a chain of segments joined end to end:

- [`moveToPoint()`](ui-bezier-path/movetopoint.md) starts a new subpath, placing its starting point at the given position.
- [`addLineToPoint()`](ui-bezier-path/addlinetopoint.md), [`addCurveToPoint()`](ui-bezier-path/addcurvetopoint.md), and similar methods draw from the **current point** to a new point, and the new point becomes the current point. Read the current point with [`currentPoint`](ui-bezier-path/currentpoint.md).
- [`closePath()`](ui-bezier-path/closepath.md) draws a straight line from the current point back to the start of this subpath.

Calling `moveToPoint()` again starts a second subpath, which isn't connected to the previous one. A path can contain several shapes that aren't connected to each other.

A path can still be changed after it is created: append segments, append another path, transform it, clear it.

## Coordinates and angles

Coordinates and lengths are in [points (pt)](units.md). The x axis points right and the y axis points down. Coordinates in a path have no fixed origin: once assigned to a shape layer, they are interpreted in that layer's own coordinate system, with the origin at the layer's top-left corner.

Parameters that take `CGPoint`, `CGRect`, or `CGSize` also accept plain objects with the same fields, such as `{ x: 10, y: 20 }`; see [structs](structs.md).

Angles are in **radians**, not degrees. 180° is `Math.PI`. 0 radians points straight right. Because the y axis points down, increasing angles go clockwise on screen:

| Angle | Direction |
| --- | --- |
| `0` | Right |
| `Math.PI / 2` | Down |
| `Math.PI` | Left |
| `-Math.PI / 2`, or `Math.PI * 1.5` | Up |

When drawing an arc, `clockwise` decides which way to go from the start angle to the end angle: `true` goes clockwise on screen, `false` goes counterclockwise. With the same two angles, the two directions give two complementary arcs of the same circle.

The directions in the table above and the on-screen direction of `clockwise` come from iOS's definitions and are **not verified in the simulator**.

## Line width and color are on the layer

How thick the line is, what color it is, the shape of its ends and corners, whether it is dashed, and what color fills the inside of the shape are all properties of [`CAShapeLayer`](ca-layer.md#cashapelayer), not of the path. The same path can be assigned to several layers, each drawing it with a different line width and color.

Shape layers and keyframe animations store the shape as of the moment it is assigned. If you change the path afterward, the layer and animation don't follow; assign it again. **"The layer doesn't change unless reassigned" is not verified in the simulator.**

## Examples

### A polyline and a pie slice

Starting from a blank app, draw a blue polyline and an orange pie slice in a gray area.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const card = new UIView();
  card.frame = new CGRect(20, 100, 300, 160);
  card.backgroundColor = 'secondarySystemBackground';
  page.view.addSubview(card);

  // Polyline: move to the start, then connect to the next three points in turn
  const line = new UIBezierPath();
  line.moveToPoint(new CGPoint(24, 130));
  line.addLineToPoint(new CGPoint(68, 60));
  line.addLineToPoint(new CGPoint(104, 96));
  line.addLineToPoint(new CGPoint(148, 30));

  // A path doesn't display itself. Hand it to a shape layer; line width and color are set on the layer
  const lineLayer = new CAShapeLayer();
  lineLayer.path = line;
  lineLayer.fillColor = null;
  lineLayer.strokeColor = 'systemBlue';
  lineLayer.lineWidth = 3;
  lineLayer.frame = card.bounds;
  card.layer.addSublayer(lineLayer);

  // Pie slice: start at the center, draw an arc, then return to the center
  const center = new CGPoint(224, 80);
  const pie = new UIBezierPath();
  pie.moveToPoint(center);
  pie.addArcWithCenter(center, {
    radius: 56, startAngle: -Math.PI / 2, endAngle: Math.PI / 3, clockwise: true,
  });
  pie.closePath();

  const pieLayer = new CAShapeLayer();
  pieLayer.path = pie;
  pieLayer.fillColor = 'systemOrange';
  pieLayer.frame = card.bounds;
  card.layer.addSublayer(pieLayer);
});
```

**Effect**

- A 300 × 160 pt light gray area appears near the top of the screen.
- The left half of the area has a 3 pt thick blue polyline with three segments.
- The right half of the area has an orange pie slice with a radius of 56 pt, sweeping 150° clockwise from straight up.

This code has not been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

For more techniques, see the guide [Drawing a path](../guides/drawing-paths.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UIBezierPath bezierPath]` | `new UIBezierPath()` |
| `[UIBezierPath bezierPathWithRect:r]` | `UIBezierPath.bezierPathWithRect(r)` |
| `[UIBezierPath bezierPathWithOvalInRect:r]` | `UIBezierPath.bezierPathWithOvalInRect(r)` |
| `[UIBezierPath bezierPathWithRoundedRect:r cornerRadius:8]` | `UIBezierPath.bezierPathWithRoundedRect(r, { cornerRadius: 8 })` |
| `[UIBezierPath bezierPathWithRoundedRect:r byRoundingCorners:UIRectCornerTopLeft cornerRadii:s]` | `UIBezierPath.bezierPathWithRoundedRect(r, { byRoundingCorners: ['topLeft'], cornerRadii: s })` |
| `UIRectCornerAllCorners` | `['topLeft', 'topRight', 'bottomLeft', 'bottomRight']` |
| `[UIBezierPath bezierPathWithArcCenter:c radius:50 startAngle:0 endAngle:M_PI clockwise:YES]` | `UIBezierPath.bezierPathWithArcCenter(c, { radius: 50, startAngle: 0, endAngle: Math.PI, clockwise: true })` |
| `[path moveToPoint:p]` | `path.moveToPoint(p)` |
| `[path addLineToPoint:p]` | `path.addLineToPoint(p)` |
| `[path addCurveToPoint:p controlPoint1:a controlPoint2:b]` | `path.addCurveToPoint(p, { controlPoint1: a, controlPoint2: b })` |
| `[path addQuadCurveToPoint:p controlPoint:c]` | `path.addQuadCurveToPoint(p, { controlPoint: c })` |
| `[path addArcWithCenter:c radius:r startAngle:s endAngle:e clockwise:YES]` | `path.addArcWithCenter(c, { radius: r, startAngle: s, endAngle: e, clockwise: true })` |
| `[path closePath]` | `path.closePath()` |
| `[path removeAllPoints]` | `path.removeAllPoints()` |
| `[path appendPath:other]` | `path.appendPath(other)` |
| `[path applyTransform:t]` | `path.applyTransform(t)` |
| `[path bezierPathByReversingPath]` | `path.bezierPathByReversingPath()` |
| `[path containsPoint:p]` | `path.containsPoint(p)` |
| `path.empty` | `path.isEmpty` |
| `path.usesEvenOddFillRule` | `path.usesEvenOddFillRule` |
| `shapeLayer.path = path.CGPath` | `shapeLayer.path = path` |
| `path.lineWidth = 3`, then `[path stroke]` | `shapeLayer.lineWidth = 3`; line width is on the layer |

## See also

- [Drawing a path](../guides/drawing-paths.md): rectangles, arcs, pie slices, curves, combining several shapes, hit testing
- [`CAShapeLayer`](ca-layer.md#cashapelayer): draws the path; line width, color, and dashes are all on it
- [Animation](ca-animation.md): move a layer along a path, or morph a shape from one path to another
- [Structs](structs.md): `CGPoint`, `CGRect`, `CGSize`, `CGAffineTransform`
- [Units](units.md)
