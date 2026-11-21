---
type: reference
native: CAPropertyAnimation
status: partial
---

# `CAPropertyAnimation`

**`CAPropertyAnimation`** represents an animation that changes one property of a layer. It determines which property the animation changes, and so determines what type the from value, to value, and keyframe values must have.

It is the common parent class of [`CABasicAnimation`](ca-basic-animation.md), [`CAKeyframeAnimation`](ca-keyframe-animation.md), and [`CASpringAnimation`](ca-spring-animation.md).

**Inheritance**: `EventTarget` → `NSObject` → [`CAAnimation`](ca-animation.md) → `CAPropertyAnimation`

## Constructor

Cannot be created with `new`. Create one through a subclass, for example [`CABasicAnimation.animationWithKeyPath()`](ca-basic-animation/animationwithkeypath.md).

## Instance properties

Also inherits the properties of [`CAAnimation`](ca-animation.md); the commonly used ones are `duration`, `repeatCount`, and `timingFunction`.

| Property | Description |
| --- | --- |
| [`keyPath`](ca-property-animation/keypath.md) | Which property the animation changes |

## Events

Inherits [`start`](ca-animation/start-event.md) and [`stop`](ca-animation/stop-event.md) from [`CAAnimation`](ca-animation.md).

## Animatable properties

The names `keyPath` accepts, and the value type for each name:

| `keyPath` | Value type | Applies to |
| --- | --- | --- |
| `'opacity'`, `'cornerRadius'`, `'borderWidth'`, `'shadowOpacity'`, `'shadowRadius'`, `'zPosition'` | Number | All layers |
| `'position'` | `CGPoint` | All layers |
| `'bounds'` | `CGRect` | All layers |
| `'shadowOffset'` | `CGSize` | All layers |
| `'backgroundColor'`, `'borderColor'`, `'shadowColor'` | [Color](ui-color.md) | All layers |
| `'contents'` | [`UIImage`](ui-image.md) | All layers |
| `'transform'`, `'sublayerTransform'` | [`CATransform3D`](ca-transform-3d.md) | All layers |
| `'transform.rotation'`, `'transform.rotation.x'`, `'transform.rotation.y'`, `'transform.rotation.z'` | Number; the angle rotated, in [radians](units.md) | All layers |
| `'transform.scale'`, `'transform.scale.x'`, `'transform.scale.y'`, `'transform.scale.z'` | Number; a multiple | All layers |
| `'transform.translation.x'`, `'transform.translation.y'`, `'transform.translation.z'` | Number; the translation, in [pt](units.md) | All layers |
| `'transform.translation'` | `CGSize`: `width` is the translation in the x direction and `height` in the y direction, in pt | All layers |
| `'lineWidth'`, `'miterLimit'`, `'strokeStart'`, `'strokeEnd'`, `'lineDashPhase'` | Number | `CAShapeLayer` |
| `'fillColor'`, `'strokeColor'` | [Color](ui-color.md) | `CAShapeLayer` |
| `'path'` | [`UIBezierPath`](ui-bezier-path.md) | `CAShapeLayer` |
| `'startPoint'`, `'endPoint'` | `CGPoint` | `CAGradientLayer` |

A few frequently asked cases:

- **`frame` cannot be animated.** To move a layer use `'position'` (the coordinates of its center); to change its size use `'bounds'`.
- **To only rotate, scale, or translate, use a component of `transform`.** Names such as `'transform.rotation.z'` change only one component of the transform; the from and to values are each a single number, so you don't need to build a whole matrix. `'transform.rotation'` is the same as `'transform.rotation.z'`: both rotate within the plane of the screen. `'transform.scale'` changes the multiple in all three directions at once. For a full turn, write `toValue = 2 * Math.PI`. **The on-screen effect is not verified in the simulator.**
- **The value of the whole `'transform'` is a `CATransform3D`.** When writing, you can also pass a plain object with all 16 fields; the rules are the same as for the layer's [`transform`](ca-layer/transform.md).
- **Gradient colors cannot be animated.** `colors` and `locations` are not in the table.
- **The types of the from value, to value, and so on must match `keyPath`.** So `keyPath` must be set before the values.
- **Numbers must be written as numbers, not strings.** A string in any of these value positions is always treated as a color. `fade.toValue = '0.5'` is not taken as 0.5.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `anim.keyPath = @"opacity"` | `anim.keyPath = 'opacity'` |

## See also

- [`CABasicAnimation`](ca-basic-animation.md), [`CAKeyframeAnimation`](ca-keyframe-animation.md), [`CASpringAnimation`](ca-spring-animation.md): the three animations that change a property
- [`CALayer`](ca-layer.md): what each property means
