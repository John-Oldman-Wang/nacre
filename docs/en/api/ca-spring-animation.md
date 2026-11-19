---
type: reference
native: CASpringAnimation
status: partial
---

# `CASpringAnimation`

**`CASpringAnimation`** represents an animation that brings a property to its end value the way a spring does: the property overshoots the end value, bounces back a few times, and settles.

It's a subclass of [`CABasicAnimation`](ca-basic-animation.md); `keyPath`, `fromValue`, `toValue`, and `byValue` are used the same way. The difference is that the motion is determined by four physical quantities rather than by a duration and a timing curve:

- The larger `stiffness` is, the stiffer the spring and the faster it moves.
- The larger `damping` is, the less it bounces. When large enough, it doesn't bounce and stops right at the end value.
- The larger `mass` is, the slower it moves and the longer the bouncing lasts.
- `initialVelocity` is the velocity it already has when the animation starts.

How long the spring takes to come to rest is computed from these four quantities; read it from [`settlingDuration`](ca-spring-animation/settlingduration.md). We recommend setting `duration` to `settlingDuration`. How the animation behaves when `duration` and `settlingDuration` differ is **not verified in the simulator**.

**Inheritance**: `EventTarget` → `NSObject` → [`CAAnimation`](ca-animation.md) → [`CAPropertyAnimation`](ca-property-animation.md) → [`CABasicAnimation`](ca-basic-animation.md) → `CASpringAnimation`

## Constructor

[`CASpringAnimation()`](ca-spring-animation/constructor.md)

Creates a spring animation with no property specified yet.

## Static methods

[`CASpringAnimation.animationWithKeyPath()`](ca-spring-animation/animationwithkeypath.md)

Creates a spring animation for a specified property.

## Instance properties

Also inherits `fromValue`, `toValue`, and `byValue` from [`CABasicAnimation`](ca-basic-animation.md), `keyPath` from [`CAPropertyAnimation`](ca-property-animation.md), and the properties of [`CAAnimation`](ca-animation.md).

Four physical quantities and a switch:

| Property | Description |
| --- | --- |
| [`mass`](ca-spring-animation/mass.md) | Mass |
| [`stiffness`](ca-spring-animation/stiffness.md) | Stiffness |
| [`damping`](ca-spring-animation/damping.md) | Damping |
| [`initialVelocity`](ca-spring-animation/initialvelocity.md) | Initial velocity |
| [`allowsOverdamping`](ca-spring-animation/allowsoverdamping.md) | Once damping is high enough that there's no bounce, whether increasing it further makes reaching the end value slower |

Three values computed from the above:

| Property | Description |
| --- | --- |
| [`settlingDuration`](ca-spring-animation/settlingduration.md) <small>read-only</small> | The time the spring needs to come to rest |
| [`perceptualDuration`](ca-spring-animation/perceptualduration.md) <small>read-only</small> | How long the animation appears to last |
| [`bounce`](ca-spring-animation/bounce.md) <small>read-only</small> | How much it bounces |

## Events

Inherits [`start`](ca-animation/start-event.md) and [`stop`](ca-animation/stop-event.md) from [`CAAnimation`](ca-animation.md).

## Examples

```js
const dot = new CALayer();
dot.frame = new CGRect(20, 70, 20, 20);
dot.backgroundColor = 'systemBlue';

const spring = CASpringAnimation.animationWithKeyPath('position');
spring.fromValue = new CGPoint(dot.position.x, -40);
spring.toValue = dot.position;
spring.stiffness = 120;
spring.damping = 8;
spring.duration = spring.settlingDuration;
dot.addAnimation(spring, { forKey: 'drop' });
```

**Effect**: once the layer is on screen, it drops from above, overshoots its original position, bounces up and down a few times, and settles in place. **The bounce is not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[CASpringAnimation animationWithKeyPath:@"position"]` | `CASpringAnimation.animationWithKeyPath('position')` |
| `spring.damping = 8` | `spring.damping = 8` |
| `spring.duration = spring.settlingDuration` | `spring.duration = spring.settlingDuration` |

## See also

- [Reaching the end value like a spring](../guides/animation.md#reaching-the-end-value-like-a-spring)
- [`CABasicAnimation`](ca-basic-animation.md): how to write the start and end values
