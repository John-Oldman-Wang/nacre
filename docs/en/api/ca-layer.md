---
type: reference
native: CALayer
status: partial
---

# `CALayer`

**`CALayer`** represents a layer: a rectangular area on screen, plus the content drawn in that area. Background color, rounded corners, border, and shadow are all layer properties. A layer can have sublayers; sublayers are drawn on top of their superlayer, and their positions are calculated in the superlayer's coordinate system.

A layer only displays things. It doesn't receive touches and doesn't take part in Auto Layout (the iOS mechanism that computes view positions and sizes from constraints; see [Auto Layout](auto-layout.md)).

`CALayer` has two subclasses, each with its own page:

- [`CAGradientLayer`](ca-gradient-layer.md) draws a color gradient in its own rectangle.
- [`CAShapeLayer`](ca-shape-layer.md) draws a path ([`UIBezierPath`](ui-bezier-path.md)), with a stroke, a fill, or both.

`CALayer` doesn't fire events. Its properties are only changed by the app's own code, so there are no change notifications.

**Inheritance**: `EventTarget` → `NSObject` → `CALayer`

For how to use layers for rounded corners, shadows, gradients, and shapes, see the guide [Drawing rounded corners, shadows, gradients, and shapes with layers](../guides/layers.md).

## Constructor

[`CALayer()`](ca-layer/constructor.md)

Creates a layer of size 0 × 0 pt with no superlayer. A view's own layer doesn't need to be created; read it from `view.layer`.

## Instance properties

Also inherits the properties of `NSObject`. All lengths are in [points (pt)](units.md).

Position and size:

| Property | Description |
| --- | --- |
| [`frame`](ca-layer/frame.md) | Position and size in the superlayer's coordinate system |
| [`bounds`](ca-layer/bounds.md) | Its own coordinate system |
| [`position`](ca-layer/position.md) | Coordinates of its center in the superlayer's coordinate system |
| [`zPosition`](ca-layer/zposition.md) | Stacking order |

Content and hierarchy:

| Property | Description |
| --- | --- |
| [`contents`](ca-layer/contents.md) | The image the layer displays |
| [`superlayer`](ca-layer/superlayer.md) <small>read-only</small> | The superlayer |
| [`sublayers`](ca-layer/sublayers.md) <small>read-only</small> | The sublayers |

Appearance:

| Property | Description |
| --- | --- |
| [`opacity`](ca-layer/opacity.md) | Opacity |
| [`isHidden`](ca-layer/ishidden.md) | Whether it is hidden |
| [`masksToBounds`](ca-layer/maskstobounds.md) | Whether sublayers outside its bounds are clipped |
| [`backgroundColor`](ca-layer/backgroundcolor.md) | Background color |
| [`contentsScale`](ca-layer/contentsscale.md) | How many pixels are used per 1 pt |

Rounded corners and border:

| Property | Description |
| --- | --- |
| [`cornerRadius`](ca-layer/cornerradius.md) | Corner radius |
| [`cornerCurve`](ca-layer/cornercurve.md) | Curve of the rounded corners |
| [`maskedCorners`](ca-layer/maskedcorners.md) | Which corners are rounded |
| [`borderWidth`](ca-layer/borderwidth.md) | Border width |
| [`borderColor`](ca-layer/bordercolor.md) | Border color |

Shadow:

| Property | Description |
| --- | --- |
| [`shadowColor`](ca-layer/shadowcolor.md) | Shadow color |
| [`shadowOpacity`](ca-layer/shadowopacity.md) | Shadow opacity. Defaults to 0, so the shadow isn't shown |
| [`shadowRadius`](ca-layer/shadowradius.md) | How far the shadow's edge is blurred |
| [`shadowOffset`](ca-layer/shadowoffset.md) | The shadow's offset from the layer |

## Instance methods

Also inherits the methods of `NSObject`.

Hierarchy:

| Method | Description |
| --- | --- |
| [`addSublayer()`](ca-layer/addsublayer.md) | Adds a sublayer on top |
| [`insertSublayer()`](ca-layer/insertsublayer.md) | Inserts at a given position |
| [`removeFromSuperlayer()`](ca-layer/removefromsuperlayer.md) | Removes it from its superlayer |

Animation. For the animation objects themselves, see [`CAAnimation`](ca-animation.md):

| Method | Description |
| --- | --- |
| [`addAnimation()`](ca-layer/addanimation.md) | Adds an animation to the layer |
| [`removeAnimationForKey()`](ca-layer/removeanimationforkey.md) | Removes the animation with a given name |
| [`removeAllAnimations()`](ca-layer/removeallanimations.md) | Removes all animations on the layer |
| [`animationKeys()`](ca-layer/animationkeys.md) | Names of all animations on the layer |
| [`animationForKey()`](ca-layer/animationforkey.md) | Reads the animation with a given name |

## General rules

- For the structs `CGRect`, `CGPoint`, and `CGSize`, see [Structs](structs.md): fields of a struct you read are read-only; to change one, assign a whole new struct.
- Numeric properties are converted with `Number()`, so `'0.5'` is treated as 0.5; a result that isn't a finite number throws `TypeError`. Boolean properties are converted by truthiness.
- `CALayer`, `CAGradientLayer`, and `CAShapeLayer` can't be subclassed; see [Native classes](native-classes.md).

## Where layers come from

Layers come from two places.

**Every view has a layer.** A [`UIView`](ui-view.md) draws nothing itself; what you see on screen is drawn by its layer. You read this layer with `view.layer`; the system creates it with the view, and it exists as long as the view does. Reading `layer` on the same view always gives the same object.

**You can also create a layer with `new`**, then add it under some view's layer with `addSublayer()`. Gradients and shapes have to be done this way, because views have no corresponding properties. A new layer is 0 × 0 pt with no superlayer; it becomes visible only after you set its `frame` and add it under a layer that is already on screen.

Once a layer is added under a superlayer, the superlayer keeps it. You don't need to store it separately in your code; it stays on screen until it is removed with `removeFromSuperlayer()`, or the view its superlayer belongs to is removed.

## View properties or layer properties

Background color, opacity, hiding, clipping, and position and size each have a property on both the view and the layer, and they change the same thing:

| To change | View property | Layer property |
| --- | --- | --- |
| Background color | `view.backgroundColor` | `layer.backgroundColor` |
| Opacity | `view.alpha` | `layer.opacity` |
| Hiding | `view.isHidden` | `layer.isHidden` |
| Clipping content outside the bounds | `view.clipsToBounds` | `layer.masksToBounds` |
| Position and size | `view.frame`, or constraints | `layer.frame` |

For a view's own layer, use the view properties for these five. There are two reasons:

- A view's position and size are managed by Auto Layout. If you change `view.layer.frame` directly, the next layout pass overwrites it with the result computed from constraints. **This is not verified in the simulator.**
- When `view.backgroundColor` is set to a color that changes with light and dark mode, such as `'label'`, the background follows automatically when the system switches modes. `layer.backgroundColor` doesn't; see [Colors on layers](#colors-on-layers).

For things the view has no property for, write to `view.layer` directly: rounded corners (`cornerRadius`, `cornerCurve`, `maskedCorners`), border (`borderWidth`, `borderColor`), and shadow (the four `shadowColor` and related properties).

A layer created with `new` has no corresponding view; use the layer's own properties for everything.

## Sublayer sizes don't follow the view

A layer created with `new` gets its position and size from only one place: the `frame` your code writes. Constraints apply only to views; layers have no constraints, and no "follow the superlayer's size" setting.

```js
const card = new UIView();
card.frame = new CGRect(20, 100, 300, 160);

const gradient = new CAGradientLayer();
gradient.frame = card.bounds;        // 300 × 160 pt at this moment
card.layer.addSublayer(gradient);

card.frame = new CGRect(20, 100, 340, 200);
console.log(gradient.frame.width);   // 300
```

**Result**: The card becomes 340 × 200 pt, while the gradient layer is still 300 × 160 pt, leaving a strip without the gradient along the card's right and bottom edges. **Not verified in the simulator.**

Also pay attention to when you read `bounds`. For a view positioned with constraints, `bounds` is 0 × 0 pt until the system finishes the first layout pass; if you assign it to a layer's `frame` then, the layer is 0 × 0 pt and nothing is visible.

For how to keep a sublayer's size in line with the view, see the guide [Drawing rounded corners, shadows, gradients, and shapes with layers](../guides/layers.md#keeping-sublayer-sizes-in-line-with-the-view).

## Colors on layers

Six layer properties accept colors: `backgroundColor`, `borderColor`, `shadowColor`, `fillColor` and `strokeColor` on `CAShapeLayer`, and `colors` on `CAGradientLayer`. They are written the same way as colors on views: you write a [color string](ui-color.md) and read back a string.

**Invalid values don't throw.** The console prints a warning, and the property keeps its previous value:

```
[Nacre] borderColor: "sytemBlue" is not a valid color, ignored; expected a color name, one of: …
```

If even one entry in the `colors` array is invalid, the whole array isn't written, and the existing gradient stays unchanged.

**Colors on layers don't change with light and dark mode.** Colors such as `'label'`, `'systemBackground'`, and `'light-dark(#fff, #000)'` have two different values in light mode and dark mode. When written to a layer, such a color is resolved on the spot into one concrete color, and the layer keeps only that result. When the system switches modes later, the layer's color doesn't change.

- **Which mode is used for resolving**: the mode of the view the layer belongs to at that moment. A view's own layer uses that view; a layer created with `new` walks up its superlayers and uses the first view it finds. A layer not yet added under any view uses the system's current mode.
- **What you read back**: a fixed color reads back as a string for the same color — in the acceptance tests, writing `'#FF2D55'` reads back `'#FF2D55'` — but case and notation aren't guaranteed to match what was written. A mode-dependent color reads back as the resolved `'#rrggbb'`; for example, writing `'label'` in light mode reads `'#000000'`.

To make a layer's colors follow mode switches, listen for the `traitchange` event on the view it belongs to (see [`UITraitCollection`](ui-trait-collection.md#the-traitchange-event)) and write the colors again in the callback. For how, see the guide [Drawing rounded corners, shadows, gradients, and shapes with layers](../guides/layers.md#updating-layer-colors-after-switching-light-and-dark-mode). When all you need is a background color, prefer `view.backgroundColor`; no listening needed.

## Transition animations when changing properties

Once a layer created with `new` has been shown on screen, changing its properties doesn't jump straight to the new value. The system automatically animates from the old value to the new one, over iOS's default duration of 0.25 seconds (the duration is **not verified in the simulator**). Animations produced automatically like this are called implicit animations.

```js
const ring = new CAShapeLayer();
// ...after setting the path, adding it on screen, and waiting for it to show:
ring.strokeEnd = 0.5;   // The display animates to 0.5 instead of jumping
```

There is no implicit animation, and changes take effect immediately, in three cases:

- The layer hasn't been added under a superlayer yet.
- The layer was just added and hasn't been shown yet. When you build the whole interface at once in the `sceneconnect` callback, every layer falls into this case.
- A view's own layer (`view.layer`). **This is not verified in the simulator.**

To make a particular change take effect immediately, put it in a transaction with implicit animations turned off; see [`CATransaction`](ca-transaction.md#implicit-animations). To control an animation's duration and curve yourself, see [`CAAnimation`](ca-animation.md).

## Position: `frame`, `bounds`, `position`

The three properties describe the same rectangle, all in [points (pt)](units.md), with the y axis pointing down.

| Property | Meaning |
| --- | --- |
| `frame` | The layer's position and size in the superlayer's coordinate system. `x` and `y` are the coordinates of the layer's top-left corner |
| `bounds` | The layer's own coordinate system. `width` and `height` match `frame`; `x` and `y` default to 0 |
| `position` | Coordinates of the layer's **center** in the superlayer's coordinate system |

```js
const layer = new CALayer();
layer.frame = new CGRect(1, 2, 3, 4);
console.log(String(layer.position));   // CGPoint(2.5, 4)

layer.position = new CGPoint(10, 10);
console.log(layer.frame.x);            // 8.5
```

**Result**: The top-left corner of `frame` is (1, 2) and the size is 3 × 4 pt, so the center is (2.5, 4). Moving the center to (10, 10) keeps the size, and the top-left x becomes 10 − 1.5 = 8.5.

Use `frame` to place a layer. Use `position` for movement animations: `frame` can't be animated; see [`CAAnimation`](ca-animation.md).

## `contentsScale`: pixels per point

`contentsScale` is how many pixels the layer's content uses per 1 pt. On an iPhone screen, 1 pt is 2 or 3 pixels.

- A layer created with `new` has a default `contentsScale` of 1.
- A view's own layer also reads 1 in the `sceneconnect` callback, so you can't use it to find the screen's scale.

Read the screen's scale from the view's [`traitCollection.displayScale`](ui-trait-collection/displayscale.md):

```js
const card = new UIView();
const layer = new CAShapeLayer();
layer.contentsScale = card.traitCollection.displayScale;
console.log(layer.contentsScale);
```

**Result**: On a 3x iPhone it prints `3`.

Whether gradient and shape layers look blurry with `contentsScale` at 1 is **not verified in the simulator**. None of the gradients and shapes in the acceptance tests set this property.

## Subclasses

### `CAGradientLayer`

[`CAGradientLayer`](ca-gradient-layer.md) draws a gradient from `colors` within its own `frame`: along a line, outward from a center, or around a center.

### `CAShapeLayer`

[`CAShapeLayer`](ca-shape-layer.md) draws `path`: it fills the area the path encloses first, then strokes along the path. Line charts, pie charts, and progress rings are all drawn with it.

## Examples

### A line on a gradient card

Starting from a blank app, build a fixed-size card: rounded corners, a gradient background, and a white line drawn on top.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. A fixed-size card. The corner radius goes on the view's own layer
  const card = new UIView();
  card.frame = new CGRect(20, 100, 300, 160);
  card.layer.cornerRadius = 16;
  card.clipsToBounds = true;          // Clip sublayers to the rounded corners too
  page.view.addSubview(card);

  // 2. Gradient layer: purple at the top left to pink at the bottom right
  const gradient = new CAGradientLayer();
  gradient.colors = ['#5856D6', '#FF2D55'];
  gradient.startPoint = new CGPoint(0, 0);
  gradient.endPoint = new CGPoint(1, 1);
  gradient.frame = card.bounds;       // You set a sublayer's size yourself
  card.layer.addSublayer(gradient);

  // 3. A polyline. The path only describes the shape
  const path = new UIBezierPath();
  path.moveToPoint(new CGPoint(24, 120));
  path.addLineToPoint(new CGPoint(96, 60));
  path.addLineToPoint(new CGPoint(168, 96));
  path.addLineToPoint(new CGPoint(276, 36));

  // 4. The shape layer draws the path
  const line = new CAShapeLayer();
  line.path = path;
  line.fillColor = null;              // Fills with black by default; remove it when you want only the line
  line.strokeColor = 'white';
  line.lineWidth = 3;
  line.lineCap = 'round';
  line.lineJoin = 'round';
  line.frame = card.bounds;
  card.layer.addSublayer(line);       // Layers added later are drawn on top
});
```

**Effect**

- A 300 × 160 pt card appears near the top of the screen, with all four corners rounded at a 16 pt radius.
- The card's background goes from purple at the top left to pink at the bottom right.
- On top of the gradient is a 3 pt white line with three segments; its ends and joints are round.

This code hasn't been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

For more patterns, see the guide [Drawing rounded corners, shadows, gradients, and shapes with layers](../guides/layers.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `view.layer` | `view.layer` |
| `[CALayer layer]` | `new CALayer()` |
| `[host addSublayer:a]` | `host.addSublayer(a)` |
| `[host insertSublayer:c atIndex:0]` | `host.insertSublayer(c, { atIndex: 0 })` |
| `[host insertSublayer:c above:b]` | `host.insertSublayer(c, { above: b })` |
| `[host insertSublayer:c below:a]` | `host.insertSublayer(c, { below: a })` |
| `[c removeFromSuperlayer]` | `c.removeFromSuperlayer()` |
| `layer.frame = CGRectMake(1, 2, 3, 4)` | `layer.frame = new CGRect(1, 2, 3, 4)` |
| `layer.position = CGPointMake(10, 10)` | `layer.position = new CGPoint(10, 10)` |
| `layer.hidden = YES` | `layer.isHidden = true` |
| `layer.backgroundColor = color.CGColor` | `layer.backgroundColor = '#5856D6'` |
| `layer.cornerRadius = 14` | `layer.cornerRadius = 14` |
| `layer.cornerCurve = kCACornerCurveContinuous` | `layer.cornerCurve = 'continuous'` |
| `layer.maskedCorners = kCALayerMinXMinYCorner \| kCALayerMaxXMinYCorner` | `layer.maskedCorners = ['minXMinY', 'maxXMinY']` |
| `layer.borderColor = UIColor.systemBlueColor.CGColor` | `layer.borderColor = 'systemBlue'` |
| `[UIColor colorWithCGColor:layer.borderColor]` | `layer.borderColor` (reads a string) |
| `layer.shadowOffset = CGSizeMake(0, 4)` | `layer.shadowOffset = new CGSize(0, 4)` |
| `layer.contentsScale = view.traitCollection.displayScale` | `layer.contentsScale = view.traitCollection.displayScale` |
| `layer.contents = (id)image.CGImage` | `layer.contents = image` |

## See also

- [Drawing rounded corners, shadows, gradients, and shapes with layers](../guides/layers.md)
- [`CAGradientLayer`](ca-gradient-layer.md), [`CAShapeLayer`](ca-shape-layer.md): the two subclasses
- [`UIBezierPath`](ui-bezier-path.md): how to draw paths
- [`CAAnimation`](ca-animation.md): animating layer properties
- [`CATransaction`](ca-transaction.md): turning off implicit animations
- [`UIView`](ui-view.md): where `view.layer` comes from, and the view properties that overlap with the layer
- [`UIColor`](ui-color.md): how to write color strings
- [`UIImage`](ui-image.md): the type of `contents`
- [`UITraitCollection`](ui-trait-collection.md): the `traitchange` event and `displayScale`
- [Structs](structs.md): `CGRect`, `CGPoint`, `CGSize`
- [Units](units.md)
