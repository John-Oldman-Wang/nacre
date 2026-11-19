---
type: concept
---

# Units

In Nacre's APIs, numeric units match iOS: lengths are in points (pt), angles in radians, and animation times in seconds. JS's built-in APIs (timers, `performance.now()`) keep the web's units, with time in milliseconds. Every numeric property in the documentation is marked with its unit; this page defines each unit and how to convert between them.

## Length and coordinates: points

All lengths, coordinates, sizes, and spacings are in **points** (written pt). This includes `frame`, `bounds`, `center`, `contentOffset`, `spacing`, `cornerRadius`, `borderWidth`, a constraint's `constant`, and font sizes.

A point is a length unit independent of screen pixel density. How many pixels 1 pt takes on screen depends on the device, and the system converts automatically when displaying. Layout code uses only points and doesn't need to adjust values per device.

No API has lengths in pixels. The only value directly related to pixels is the screen scale below.

### How many pixels make 1 pt

The screen scale is how many pixels 1 pt spans in each direction. With a scale of 3, 1 pt is 3 × 3 pixels. Read it from [`traitCollection.displayScale`](ui-trait-collection.md) of any view, view controller, or scene:

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const scale = page.view.traitCollection.displayScale;
  console.log(scale);
});
```

**Result**

- Prints `3` in the iPhone Air simulator. Values on other devices are **not verified in the simulator**.

A view that hasn't been added to the UI yet can also read this value.

There are two cases where you need the scale:

**Layers you create yourself.** A layer created with `new CALayer()` has a `contentsScale` of 1 by default, which doesn't follow the screen. For a layer whose content should be drawn at the screen's pixel density (text, shapes, and so on), set it to the screen scale:

```js
const view = new UIView();
const layer = new CAShapeLayer();
layer.contentsScale = view.traitCollection.displayScale;
view.layer.addSublayer(layer);
```

**Effect**

- `layer` is drawn at the screen's actual pixel density. The difference in sharpness before and after setting it is **not verified in the simulator**.

**Drawing a 1-pixel-wide line.** 1 pixel equals `1 / displayScale` pt:

```js
const line = new UIView();
const hairline = 1 / line.traitCollection.displayScale;
line.frame = { x: 0, y: 100, width: 300, height: hairline };
line.backgroundColor = 'separator';
```

**Effect**

- The height of `line` is 1 pixel (about 0.33 pt at a scale of 3). The actual thickness as displayed is **not verified in the simulator**.

Don't hard-code the scale as `3`; read it from `displayScale`.

### Image sizes

The `size` of a [`UIImage`](ui-image.md) is also in points, not the pixel count of the image file. An image has its own scale: a 2 × 2 pixel image loaded at scale 1 has a `size` of 2 × 2 pt, and loaded at scale 2 has a `size` of 1 × 1 pt.

### Does the system change point values

A point value you write reads back as the same number; the system doesn't change property values because of the screen or display settings.

| Case | Point value in the property | Size on screen |
| --- | --- | --- |
| The view itself or an ancestor has a scaling `transform` | Unchanged. `bounds` and `center` aren't affected by `transform` | Scales with it. In this case `frame` reads back as the bounding rectangle after the transform; see [`UIView`](ui-view.md) |
| The user makes text larger in system settings | Unchanged | Spacing and sizes don't change. **Not verified in the simulator** |
| The user turns on Display Zoom in system settings | Unchanged | The screen has fewer points in total, and all content gets proportionally larger. **Not verified in the simulator** |

To be notified when the user adjusts the text size, listen for the `traitchange` event; see [`UITraitCollection`](ui-trait-collection.md).

### Fractions

Point values can be fractional, such as `0.5` or `1 / 3`.

### Coordinate directions

The origin is at the top-left corner; `x` increases to the right and `y` increases downward. A view's `frame` uses the top-left corner of its superview as the origin.

## Angles: radians

All angles are in **radians**. This includes the argument of [`CGAffineTransform.rotation()`](cg-affine-transform.md) and the start and end angles of arcs drawn with [`UIBezierPath`](ui-bezier-path.md).

Converting degrees to radians:

```js
/** @param {number} degrees */
const toRadians = (degrees) => degrees * Math.PI / 180;

console.log(toRadians(180) === Math.PI);
console.log(toRadians(90) === Math.PI / 2);
```

**Result**

- Prints `true` twice.

Because the `y` axis points down, increasing angles go clockwise on screen: 0 radians points right, and `Math.PI / 2` points down.

## Time: seconds and milliseconds

Time has two units, depending on where the API comes from:

| Unit | Used in | Examples |
| --- | --- | --- |
| Seconds | iOS APIs | An animation's `duration` and `beginTime`; `CADisplayLink`'s `timestamp`; a long-press gesture's `minimumPressDuration` |
| Milliseconds | JS and web APIs | The delay of `setTimeout()` and `setInterval()`; the return value of `performance.now()`; the argument of `AbortSignal.timeout()` |

```js
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.duration = 0.3;                 // 0.3 seconds

setTimeout(() => {
  console.log('done');
}, 300);                             // 300 milliseconds
```

**Result**

- `fade` is an animation lasting 0.3 seconds.
- After 300 milliseconds the console prints `done`. Both represent the same length of time.

> **Note:** Animation durations are in seconds and timer delays in milliseconds, a factor of 1000 apart. Writing `300` into `duration` gives you a 5-minute animation.

Values that represent a point in time also come in two kinds:

| Value | Unit |
| --- | --- |
| `performance.timeOrigin`, a file info's `modified` | Milliseconds since 1970; can be passed directly to `new Date()` |
| A cookie's `expirationDate` | Seconds since 1970 |
| `CADisplayLink`'s `timestamp` | Seconds since the device booted; can't be compared with `Date.now()` |

## Unitless numbers

| Quantity | Values | Examples |
| --- | --- | --- |
| Opacity | A ratio from 0 to 1. 0 is fully transparent, 1 is fully opaque | `alpha`, a layer's `opacity`, `shadowOpacity` |
| Scale factor | A ratio; 1 is the original size | The arguments of `CGAffineTransform.scale()` |
| Layer unit coordinates | A ratio from 0 to 1, relative to the layer's own width and height. `(0, 0)` is the top-left corner, `(1, 1)` the bottom-right | `startPoint` and `endPoint` of `CAGradientLayer` |
| Haptic intensity | A ratio from 0 to 1 | The argument of `impactOccurredWithIntensity()` |
| Layout priority | A number from 1 to 1000; larger takes precedence, and 1000 means required | A constraint's `priority`; see [Auto Layout](auto-layout.md) |
| Frame rate | Frames per second | The three fields of `CAFrameRateRange` |
| Counts, indexes | Integers. A fractional value has its fractional part dropped | `numberOfLines`, `atIndex` of `insertSubview()` |

Some ratio values are stored by the system at lower precision, so the number read back differs from the one written in the last few digits: writing `0.6` to `alpha` reads back `0.6000000238418579`. When comparing such values, allow a tolerance instead of using `===`.

## Comparison with native iOS code

Units are the same as in the iOS APIs, with no conversion.

| ObjC | JS |
| --- | --- |
| `CGFloat` (points) | A number, in pt |
| `NSTimeInterval`, `CFTimeInterval` (seconds) | A number, in seconds |
| `traitCollection.displayScale` | `traitCollection.displayScale` |
| `UIScreen.mainScreen.scale` | `scene.screen.scale`; see [`UIScreen`](ui-screen.md) |
| `M_PI` | `Math.PI` |

## See also

- [Structs](structs.md): the fields of values such as `CGRect` and `CGPoint` are all in pt.
- [`UITraitCollection`](ui-trait-collection.md): `displayScale` and other traits, and notification when they change.
- [`UIImage`](ui-image.md): image `size` and scale.
- [Animation](ca-animation.md): time properties in seconds.
- [Timers](timers.md): delays in milliseconds.
