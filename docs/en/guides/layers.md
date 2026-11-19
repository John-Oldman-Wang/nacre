# Drawing rounded corners, shadows, gradients, and shapes with layers

This guide covers how to use [layers](../api/ca-layer.md) to give views rounded corners, borders, and shadows; how to draw gradients with [`CAGradientLayer`](../api/ca-gradient-layer.md) and polylines, wedges, progress rings, and dashed lines with [`CAShapeLayer`](../api/ca-shape-layer.md); and how to keep sublayer sizes in line with views and colors in line with light and dark mode. Details of each property are on the reference pages of these three classes.

## Recommended approach

- **For a view's own layer, use the view properties for background color, opacity, hiding, clipping, and position and size** (`view.backgroundColor`, `view.alpha`, `view.isHidden`, `view.clipsToBounds`, `view.frame` or constraints). For rounded corners, borders, and shadows, which views have no properties for, write to `view.layer` directly. For the reasons, see [View properties or layer properties](../api/ca-layer.md#view-properties-or-layer-properties).
- **When all you need is a background color, use `view.backgroundColor`**; it follows light and dark mode. Colors on layers have to be rewritten yourself in `traitchange`.
- **You manage sublayer sizes yourself**, handled in the three cases below; see [Keeping sublayer sizes in line with the view](#keeping-sublayer-sizes-in-line-with-the-view).

## First example

Starting from a blank app, build a fixed-size card: rounded corners, a gradient background, and a white line drawn on top.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
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

The examples below all reuse `page` and `card` from here. `card` is a 300 × 160 pt view. To try a section on its own, write these lines first:

```js
const page = new UIViewController();
const card = new UIView();
card.frame = new CGRect(20, 100, 300, 160);
page.view.addSubview(card);
```

## Keeping sublayer sizes in line with the view

A layer created with `new` gets its position and size from only one place: the `frame` your code writes. Constraints apply only to views; layers have no constraints, and no "follow the superlayer's size" setting. For a view positioned with constraints, `bounds` is 0 × 0 pt until the system finishes the first layout pass. For the reasons, see [Sublayer sizes don't follow the view](../api/ca-layer.md#sublayer-sizes-dont-follow-the-view).

The recommended approach depends on the case:

1. **For content a view can express, use a subview, not a sublayer.** Solid blocks, and blocks with rounded corners and borders, are done with a `UIView` plus constraints. The view's size follows its constraints, and its layer follows the view, with no extra code.
2. **Put gradients and shapes in a fixed-size view.** Give that view width and height constraints with fixed values, and position it with constraints as usual. Write the sublayer's `frame` from that fixed size. The view's position can change with layout while its size stays the same, so the sublayer always matches. For how, see [Putting a gradient in a view positioned with constraints](#putting-a-gradient-in-a-view-positioned-with-constraints).
3. **After your own code changes the layout, set `frame` again.** Call `layoutIfNeeded()` first so constraints compute their result immediately, then read `bounds`. For how, see [Making sublayers follow after the view grows](#making-sublayers-follow-after-the-view-grows).

Size changes caused by the system, such as screen rotation, have no event notification. For views whose size changes this way, there is currently no way to make their sublayers follow automatically.

## Adding rounded corners

```js
card.layer.cornerRadius = 16;
```

**Effect**: The four corners of the card's background and border become rounded with a 16 pt radius.

Rounded corners apply only to the layer's own background color and border. Subviews and sublayers keep square corners and draw outside the rounded corners. To clip them too, add one more line:

```js
card.clipsToBounds = true;
```

**Effect**: The parts of subviews and sublayers outside the rounded corners are no longer displayed. **Not verified in the simulator.**

## Rounding only the top two corners

```js
card.layer.cornerRadius = 16;
card.layer.maskedCorners = ['minXMinY', 'maxXMinY'];
```

**Effect**: The top-left and top-right corners are rounded; the bottom two are square.

`maskedCorners` lists the corners to round. In the names, `minX` is the left side, `maxX` the right side, `minY` the top, and `maxY` the bottom, because the y axis points down.

## Adding a border

```js
card.layer.borderWidth = 2;
card.layer.borderColor = '#5856D6';
```

**Effect**: A 2 pt purple border appears around the card. The border follows the rounded corners.

The border is drawn inside the layer's bounds and doesn't make the card bigger. It is drawn above the background color, subviews, and sublayers, so it covers 2 pt of content at the edges. **The stacking of the border and content is not verified in the simulator.**

Setting only `borderWidth` without a color gives a black border: `borderColor` defaults to opaque black.

## Adding a shadow

```js
card.backgroundColor = 'systemBackground';
card.layer.shadowColor = 'black';
card.layer.shadowOpacity = 0.25;
card.layer.shadowRadius = 8;
card.layer.shadowOffset = new CGSize(0, 4);
```

**Effect**: A soft black shadow appears below the card, offset 4 pt downward, with an 8 pt blurred edge and 25% opacity at its darkest. **How the shadow looks is not verified in the simulator.**

- **`shadowOpacity` defaults to 0, so no shadow is shown by default.** Setting only the color, radius, and offset changes nothing on screen.
- A positive `height` in `shadowOffset` moves the shadow down. The default is `(0, -3)`, offset 3 pt upward.
- The shadow is generated from the outline of what is drawn in the layer. A view with no background color and no content has no shadow.

## Rounded clipping and a shadow together

The shadow is drawn outside the layer's bounds. `clipsToBounds = true` clips everything outside the bounds, the shadow included. So clipping and a shadow can't go on the same view; use two views: the outer one for the shadow, the inner one for rounded corners and clipping.

```js
const outer = new UIView();
outer.frame = new CGRect(20, 300, 300, 160);
outer.layer.shadowColor = 'black';
outer.layer.shadowOpacity = 0.25;
outer.layer.shadowRadius = 8;
outer.layer.shadowOffset = new CGSize(0, 4);
page.view.addSubview(outer);

const inner = new UIView();
inner.frame = outer.bounds;
inner.backgroundColor = 'systemBackground';
inner.layer.cornerRadius = 16;
inner.clipsToBounds = true;
outer.addSubview(inner);
```

**Effect**: A card with rounded corners and a shadow around it. Subviews and sublayers placed in `inner` are clipped to the rounded corners. **Not verified in the simulator.**

## Adding a gradient background

```js
const gradient = new CAGradientLayer();
gradient.colors = ['#5856D6', '#FF2D55'];
gradient.frame = card.bounds;
card.layer.insertSublayer(gradient, { atIndex: 0 });
```

**Effect**: The card's background transitions evenly from purple at the top to pink at the bottom. The gradient is below all of the card's subviews.

- Without `startPoint` and `endPoint`, the direction is top to bottom.
- `insertSublayer(…, { atIndex: 0 })` puts the gradient at the bottom. `addSublayer()` would put it on top, covering subviews already in the card.
- `colors` needs at least two colors. With only one, or none, no gradient is drawn. **Not verified in the simulator.**

## Changing the gradient's direction and color positions

`startPoint` and `endPoint` use unit coordinates: `(0, 0)` is the layer's top-left corner and `(1, 1)` its bottom-right corner, regardless of the layer's actual size.

```js
const gradient2 = new CAGradientLayer();
gradient2.colors = ['#5856D6', '#FF2D55', '#FF9500'];
gradient2.startPoint = new CGPoint(0, 0.5);   // Midpoint of the left edge
gradient2.endPoint = new CGPoint(1, 0.5);     // Midpoint of the right edge
gradient2.locations = [0, 0.3, 1];
gradient2.frame = card.bounds;
card.layer.addSublayer(gradient2);
```

**Effect**: The gradient runs left to right. Purple at the far left becomes pink at 30% of the width, then orange at the far right. **Not verified in the simulator.**

`locations` gives the position of each color, from 0 to 1, where 0 is the start and 1 the end. Without it, colors are spread evenly.

## Drawing a polyline

```js
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

**Effect**: A 3 pt blue polyline with two segments appears on the card.

- **`fillColor` defaults to opaque black.** If you don't set it to `null`, the area the polyline encloses is filled black.
- **`strokeColor` defaults to `null`.** Setting only `lineWidth` without a color shows no line.
- Coordinates in the path are in the shape layer's own coordinate system, with the origin at the layer's top-left corner. Set the layer's `frame` to the card's size, and path coordinates equal coordinates in the card.
- The line is centered on the path, with half its width on each side. A 3 pt line extends 1.5 pt on each side.

For how to draw paths, see [`UIBezierPath`](../api/ui-bezier-path.md).

## Drawing a filled shape

```js
const center = new CGPoint(150, 80);
const pie = new UIBezierPath();
pie.moveToPoint(center);
pie.addArcWithCenter(center, {
  radius: 50, startAngle: -Math.PI / 2, endAngle: Math.PI / 3, clockwise: true,
});
pie.closePath();

const wedge = new CAShapeLayer();
wedge.path = pie;
wedge.fillColor = 'systemOrange';
wedge.frame = card.bounds;
card.layer.addSublayer(wedge);
```

**Effect**: An orange wedge appears in the middle of the card. Its center is at (150, 80), its radius is 50 pt, and it sweeps 150° clockwise starting from straight up.

## Drawing only part of a path: a progress ring

`strokeStart` and `strokeEnd` decide where along the path the stroke starts and ends. They range from 0 to 1, where 0 is the start of the path and 1 the end.

```js
const circle = UIBezierPath.bezierPathWithArcCenter(new CGPoint(150, 80), {
  radius: 40, startAngle: -Math.PI / 2, endAngle: Math.PI * 1.5, clockwise: true,
});

const ring = new CAShapeLayer();
ring.path = circle;
ring.fillColor = null;
ring.strokeColor = 'systemGreen';
ring.lineWidth = 8;
ring.lineCap = 'round';
ring.strokeEnd = 0.6;
ring.frame = card.bounds;
card.layer.addSublayer(ring);
```

**Effect**: A green ring with a 40 pt radius and an 8 pt width, drawn 60% of the way clockwise from straight up, with round ends. **Not verified in the simulator.**

To update the progress later, change `strokeEnd` directly. If the layer has already been shown, the change comes with a transition animation; see [Transition animations when changing properties](../api/ca-layer.md#transition-animations-when-changing-properties).

## Drawing a dashed line

```js
const line2 = new CAShapeLayer();
line2.path = UIBezierPath.bezierPathWithRect(new CGRect(20, 20, 260, 120));
line2.fillColor = null;
line2.strokeColor = 'systemGray';
line2.lineWidth = 1;
line2.lineDashPattern = [6, 3];
line2.frame = card.bounds;
card.layer.addSublayer(line2);
```

**Effect**: A 260 × 120 pt gray dashed rectangle. Each dash is 6 pt long with 3 pt gaps. **Not verified in the simulator.**

The numbers in `lineDashPattern` alternate "how long to draw, how long to skip", in pt, and repeat from the start when they reach the end of the array. Set it back to `null` for a solid line.

## Changing the stacking order of sublayers

```js
const a = new CALayer();
const b = new CALayer();
const c = new CALayer();

card.layer.addSublayer(a);                    // [a]
card.layer.addSublayer(b);                    // [a, b], b above a
card.layer.insertSublayer(c, { atIndex: 0 }); // [c, a, b], c at the bottom
card.layer.insertSublayer(c, { above: b });   // [a, b, c], c moves above b
card.layer.insertSublayer(c, { below: a });   // [c, a, b], c moves below a
c.removeFromSuperlayer();                     // [a, b]
```

**Result**: The comment on each line shows `card.layer.sublayers` after that line runs. Layers later in the array are drawn on top.

Calling `insertSublayer()` again on a layer already in `sublayers` moves it to the new position; it doesn't add a second copy.

If you don't want to change the array order, change `zPosition`: higher values are drawn on top, and equal values follow the array order. **How `zPosition` looks on screen is not verified in the simulator.**

## Using an image as a layer's content

```js
const dot = UIImage.imageNamed('JS/assets/dot');

const badge = new CALayer();
badge.frame = new CGRect(20, 20, 40, 40);
badge.contents = dot;
card.layer.addSublayer(badge);

console.log(badge.contents === dot);
```

**Result**

- The image appears at the top left of the card, stretched to 40 × 40 pt. **How it looks on screen is not verified in the simulator.**
- The console prints `true`: you read back the same image object you wrote.

To display an image you would normally use [`UIImageView`](../api/ui-image-view.md), which handles the image's aspect ratio and scale. Writing `contents` directly is for two cases: the layer itself is part of another animation, or you want to play a set of images frame by frame yourself; for how, see [Controlling animated image playback yourself](images.md#controlling-animated-image-playback-yourself).

- `imageNamed()` returns `null` when it can't find the image; `contents = null` means no content and doesn't fail.
- Only write `contents` on layers you created. The content of a view's own layer (`view.layer`) is managed by the view.

## Putting a gradient in a view positioned with constraints

The view holding the gradient is positioned with constraints and has fixed width and height values. The sublayer's `frame` is written from that fixed size rather than read from `bounds`, so it doesn't depend on whether layout has finished.

```js
const banner = new UIView();
banner.translatesAutoresizingMaskIntoConstraints = false;
banner.clipsToBounds = true;
banner.layer.cornerRadius = 12;
page.view.addSubview(banner);

const width = 280;
const height = 120;
NSLayoutConstraint.activateConstraints([
  banner.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
  banner.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  banner.widthAnchor.constraintEqualToConstant(width),
  banner.heightAnchor.constraintEqualToConstant(height),
]);

const gradient3 = new CAGradientLayer();
gradient3.colors = ['#34C759', '#007AFF'];
gradient3.frame = new CGRect(0, 0, width, height);
banner.layer.addSublayer(gradient3);
```

**Effect**: A 280 × 120 pt rounded gradient sits in the center of the view controller's view. When the view's size changes it stays centered, and the gradient always fills it. **Not verified in the simulator.**

## Making sublayers follow after the view grows

After your own code changes constraints or `frame`, set the sublayer's size again.

```js
const gradient4 = new CAGradientLayer();
gradient4.colors = ['#5856D6', '#FF2D55'];
gradient4.frame = card.bounds;
card.layer.addSublayer(gradient4);

// Later the card grows
card.frame = new CGRect(20, 100, 340, 200);
page.view.layoutIfNeeded();           // With constraints, let them compute their result first

CATransaction.begin();
CATransaction.setDisableActions(true);
gradient4.frame = card.bounds;         // Takes effect immediately, with no transition animation
CATransaction.commit();
```

**Effect**: The gradient layer becomes 340 × 200 pt and fills the card again. **Not verified in the simulator.**

The three `CATransaction` lines turn off the implicit animation for this change. Without them, if the layer has already been shown, the gradient grows through an animation and doesn't match the card during it.

## Updating layer colors after switching light and dark mode

```js
card.layer.borderWidth = 2;

function applyColors() {
  card.layer.borderColor = 'label';
}
applyColors();
card.addEventListener('traitchange', applyColors);
```

**Effect**: The border is black in light mode and white in dark mode. After the system switches modes, the callback runs and the border changes to the color for the new mode.

The callback still writes `'label'`. Each time it is written, the runtime resolves it again using the card's mode at that moment.

## See also

- [`CALayer`](../api/ca-layer.md): all layer properties, colors on layers, transition animations
- [`CAGradientLayer`](../api/ca-gradient-layer.md), [`CAShapeLayer`](../api/ca-shape-layer.md)
- [`UIBezierPath`](../api/ui-bezier-path.md): how to draw paths
- [`CATransaction`](../api/ca-transaction.md): turning off implicit animations
- [Supporting Dark Mode](dark-mode.md)
