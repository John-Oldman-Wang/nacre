# Drawing a path

This guide shows how to outline shapes with [`UIBezierPath`](../api/ui-bezier-path.md) and hand them to [`CAShapeLayer`](../api/ca-layer.md#cashapelayer) to draw on screen: rectangles, rounded corners, arcs, polylines, curves, pie slices, and testing whether a point falls inside a shape. The details of each method are on the [`UIBezierPath`](../api/ui-bezier-path.md) reference page.

## Recommended approach

- **The path handles only the shape; set line width and color on the shape layer.** Assign the path to the `path` of a `CAShapeLayer`; the layer's `strokeColor`, `fillColor`, and `lineWidth` determine how it is drawn. One path can be used by several layers.
- **Finish drawing the path before assigning it to the layer.** The layer stores the shape at the moment of assignment; if you change the path later, the layer does not follow. To update the shape, assign it again; see [Updating a shape](#updating-a-shape).
- **To stroke without filling, set the layer's `fillColor` to `null`.** Shape layers fill with black by default.
- **To stroke a complete outline, call `closePath()` when done.** Without closing, the fill is still computed as if closed, but the stroke is missing the last side.
- **Angles are in radians.** 180° is `Math.PI`, 0 points straight right, and increasing angles go clockwise; see [Coordinates and angles](../api/ui-bezier-path.md#coordinates-and-angles).

## First path

Starting from a blank app, draw a blue polyline and an orange pie slice in a gray area.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. A fixed-size area to hold the shapes
  const card = new UIView();
  card.frame = new CGRect(20, 100, 300, 160);
  card.backgroundColor = 'secondarySystemBackground';
  page.view.addSubview(card);

  // 2. Polyline: move to the start point, then connect to the next three points in turn
  const line = new UIBezierPath();
  line.moveToPoint(new CGPoint(24, 130));
  line.addLineToPoint(new CGPoint(68, 60));
  line.addLineToPoint(new CGPoint(104, 96));
  line.addLineToPoint(new CGPoint(148, 30));

  // 3. A path does not display itself. Hand it to a shape layer; set line width and color on the layer
  const lineLayer = new CAShapeLayer();
  lineLayer.path = line;
  lineLayer.fillColor = null;           // no fill, stroke only
  lineLayer.strokeColor = 'systemBlue';
  lineLayer.lineWidth = 3;
  lineLayer.frame = card.bounds;
  card.layer.addSublayer(lineLayer);

  // 4. Pie slice: start from the center, draw an arc, then return to the center
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
- The left half of the area has a 3 pt blue polyline with three segments.
- The right half has an orange pie slice with a radius of 56 pt, sweeping 150° clockwise starting from straight up.

This code has not been run as a whole in the simulator. Each API it uses has been run in the acceptance tests.

The examples below only create paths. To display a path, do the same as above: assign it to the `path` of a `CAShapeLayer`, then add the layer to a view's `layer`.

## Drawing rectangles, ovals, and circles

```js
const rect = UIBezierPath.bezierPathWithRect(new CGRect(10, 20, 30, 40));
const oval = UIBezierPath.bezierPathWithOvalInRect(new CGRect(0, 0, 80, 50));
const circle = UIBezierPath.bezierPathWithOvalInRect(new CGRect(0, 0, 50, 50));
```

**Effect**: `rect` is a 30 × 40 pt rectangle with its top-left corner at (10, 20). `oval` is the ellipse inscribed in an 80 × 50 pt rectangle. `circle` is a circle 50 pt in diameter: when the given rectangle is a square, the inscribed ellipse is a circle.

## Drawing a rounded rectangle

```js
const rounded = UIBezierPath.bezierPathWithRoundedRect(
  new CGRect(0, 0, 120, 60), { cornerRadius: 8 });
```

**Effect**: a 120 × 60 pt rectangle whose four corners are rounded with a radius of 8 pt.

To round only some corners, use the other set of options:

```js
const tab = UIBezierPath.bezierPathWithRoundedRect(new CGRect(0, 0, 120, 60), {
  byRoundingCorners: ['topLeft', 'topRight'],
  cornerRadii: new CGSize(12, 12),
});
```

**Effect**: the top two corners are rounded with a radius of 12 pt, and the bottom two are square. **Not verified in the simulator.**

There are only four corner names: `'topLeft'`, `'topRight'`, `'bottomLeft'`, and `'bottomRight'`; see [`bezierPathWithRoundedRect()`](../api/ui-bezier-path/bezierpathwithroundedrect.md).

To just round the corners of a view, you do not need a path; use `view.layer.cornerRadius`. See [`CALayer`](../api/ca-layer.md).

## Drawing arcs and full circles

```js
const arc = UIBezierPath.bezierPathWithArcCenter(new CGPoint(50, 50), {
  radius: 50, startAngle: 0, endAngle: Math.PI, clockwise: true,
});
```

**Effect**: a semicircular arc centered at (50, 50) with a radius of 50 pt, going clockwise from straight right, through straight down, to straight left.

All four options are required; none has a default.

For a full circle, make the end angle `2 * Math.PI` greater than the start angle. For a progress ring, start from straight up:

```js
const ring = UIBezierPath.bezierPathWithArcCenter(new CGPoint(50, 50), {
  radius: 40, startAngle: -Math.PI / 2, endAngle: Math.PI * 1.5, clockwise: true,
});
```

**Effect**: a full circle with a radius of 40 pt, starting and ending straight up, going clockwise. Combined with the shape layer's `strokeEnd`, you can draw only part of it.

## Drawing polylines and closed shapes

```js
const triangle = new UIBezierPath();
triangle.moveToPoint(new CGPoint(50, 0));
triangle.addLineToPoint(new CGPoint(100, 80));
triangle.addLineToPoint(new CGPoint(0, 80));
triangle.closePath();
```

**Effect**: a triangle. `closePath()` adds the third side, from (0, 80) back to the start point (50, 0).

Without `closePath()`, the path is a polyline of two sides. Fill and stroke then give different results:

- **Fill** is computed on the closed shape and still fills a triangle.
- **Stroke** draws only the two sides that actually exist.

So for shapes whose complete outline should be stroked, call `closePath()` when done.

## Drawing curves

```js
const wave = new UIBezierPath();
wave.moveToPoint(new CGPoint(0, 50));

// Cubic Bézier curve: two control points
wave.addCurveToPoint(new CGPoint(100, 50), {
  controlPoint1: new CGPoint(30, 0),
  controlPoint2: new CGPoint(70, 100),
});

// Quadratic Bézier curve: one control point
wave.addQuadCurveToPoint(new CGPoint(150, 50), {
  controlPoint: new CGPoint(125, 20),
});
```

**Effect**: starting from (0, 50), first an S-shaped curve to (100, 50), then a curve arching upward to (150, 50).

Control points determine which way the curve bends; the curve itself does not pass through them. The curve leaves the start point heading toward the first control point and arrives at the end point from the direction of the last control point.

## Drawing a pie slice

When there is already a current point, [`addArcWithCenter()`](../api/ui-bezier-path/addarcwithcenter.md) first draws a straight line from the current point to the start of the arc, then draws the arc. A pie slice takes advantage of this:

```js
const pieCenter = new CGPoint(60, 60);
const slice = new UIBezierPath();
slice.moveToPoint(pieCenter);                 // the current point is at the center
slice.addArcWithCenter(pieCenter, {           // connect to the start of the arc, then draw the arc
  radius: 50, startAngle: 0, endAngle: Math.PI / 2, clockwise: true,
});
slice.closePath();                            // connect from the end of the arc back to the center
```

**Effect**: a quarter-circle pie slice centered at (60, 60), occupying the lower-right portion.

For a pie chart, use one such path and one shape layer for each slice, starting each slice at the previous slice's end angle.

## Putting several shapes in one path

```js
const bars = new UIBezierPath();
bars.appendPath(UIBezierPath.bezierPathWithRect(new CGRect(0, 40, 10, 20)));
bars.appendPath(UIBezierPath.bezierPathWithRect(new CGRect(20, 10, 10, 50)));
bars.appendPath(UIBezierPath.bezierPathWithRect(new CGRect(40, 0, 10, 60)));
console.log(String(bars.bounds));
```

**Effect**: `bars` contains three rectangles 10 pt wide, 20, 50, and 60 pt tall, with their bottoms aligned. The console logs `CGRect(0, 0, 50, 60)`.

A batch of shapes with the same color and line width can go into one path and be drawn with a single shape layer. Shapes with different colors must be separate: one path and one layer per color.

## Updating a shape

Shape layers and keyframe animations store the shape at the moment of assignment. If you modify the path afterward, the layer and animation do not follow. To update the shape, create a new path (or finish changing the original one) and assign it again:

```js
const chart = new CAShapeLayer();

/** @param {number} height */
function update(height) {
  const peak = new UIBezierPath();
  peak.moveToPoint(new CGPoint(0, 100));
  peak.addLineToPoint(new CGPoint(50, 100 - height));
  peak.addLineToPoint(new CGPoint(100, 100));
  chart.path = peak;
}

update(40);
update(80);
```

**Effect**: after the second call, the shape layer draws the polyline with a height of 80 pt. That "the layer does not change unless reassigned" is **not verified in the simulator**.

## Moving and scaling a path

```js
const moved = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 100, 100));
moved.applyTransform(CGAffineTransform.translation(10, 0));
console.log(moved.bounds.x);
```

**Effect**: the console logs `10`. The whole rectangle has moved 10 pt to the right.

[`applyTransform()`](../api/ui-bezier-path/applytransform.md) modifies the path itself and does not return a new path. Scale with `CGAffineTransform.scale()` and rotate with `CGAffineTransform.rotation()`; see [Structs](../api/structs.md). Both scaling and rotation are centered on the coordinate origin (0, 0), not on the center of the path.

## Determining which shape a tap falls on

```js
const target = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 100, 100));
console.log(target.containsPoint(new CGPoint(50, 50)));
console.log(target.containsPoint(new CGPoint(150, 50)));
```

**Effect**: the console logs `true` and then `false`.

[`containsPoint()`](../api/ui-bezier-path/containspoint.md) tests the fill area and ignores line width. The point and the path must be in the same coordinate system: touch events give positions in the view's coordinate system, so when the path is assigned to a layer whose `frame` origin is not (0, 0), subtract the layer's origin first.

## See also

- [`UIBezierPath`](../api/ui-bezier-path.md): all methods and properties
- [`CAShapeLayer`](../api/ca-layer.md#cashapelayer): drawing the path, with line width, color, dashes, and fill rule
- [Animation](../api/ca-animation.md): moving a layer along a path
- [Structs](../api/structs.md): `CGPoint`, `CGRect`, `CGSize`, `CGAffineTransform`
