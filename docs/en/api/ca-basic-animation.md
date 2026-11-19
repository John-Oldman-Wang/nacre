---
type: reference
native: CABasicAnimation
status: partial
---

# `CABasicAnimation`

**`CABasicAnimation`** represents an animation that changes one property of a layer from one value to another. [`keyPath`](ca-property-animation/keypath.md) specifies which property, and `fromValue`, `toValue`, and `byValue` give the start and end.

The type of the start and end values depends on `keyPath`: `'opacity'` takes a number, `'position'` a `CGPoint`, `'strokeColor'` a color, and `'path'` a `UIBezierPath`. For the full table, see [Animatable properties](ca-property-animation.md#animatable-properties). So `keyPath` must be set before the values.

**Inheritance**: `EventTarget` → `NSObject` → [`CAAnimation`](ca-animation.md) → [`CAPropertyAnimation`](ca-property-animation.md) → `CABasicAnimation`

[`CASpringAnimation`](ca-spring-animation.md) is its subclass. For how to use it for common animations, see the guide [Animating layers](../guides/animation.md).

## Constructor

[`CABasicAnimation()`](ca-basic-animation/constructor.md)

Creates an animation with no property specified yet. `keyPath` is `null`.

## Static methods

[`CABasicAnimation.animationWithKeyPath()`](ca-basic-animation/animationwithkeypath.md)

Creates an animation for a specified property. **This is the one to use in most cases.**

## Instance properties

Also inherits `keyPath` from [`CAPropertyAnimation`](ca-property-animation.md) and the properties of [`CAAnimation`](ca-animation.md); commonly used ones are `duration`, `repeatCount`, `autoreverses`, and `timingFunction`.

| Property | Description |
| --- | --- |
| [`fromValue`](ca-basic-animation/fromvalue.md) | Start value |
| [`toValue`](ca-basic-animation/tovalue.md) | End value |
| [`byValue`](ca-basic-animation/byvalue.md) | Amount of change |

You can give only some of the three values. The end that is not given uses the property's value: with only `toValue`, the animation goes from the property's value to `toValue`; with only `fromValue`, from `fromValue` to the property's value. **Not verified in the simulator**; the examples always give both ends.

## Events

Inherits [`start`](ca-animation/start-event.md) and [`stop`](ca-animation/stop-event.md) from [`CAAnimation`](ca-animation.md).

## Examples

```js
const layer = new CALayer();
layer.frame = new CGRect(20, 20, 60, 60);
layer.backgroundColor = 'systemBlue';

const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0.2;
fade.duration = 0.5;
layer.addAnimation(fade, { forKey: 'fade' });
```

**Effect**: once the layer is on screen, it fades from fully opaque to 0.2 over 0.5 seconds, then jumps back to fully opaque (the property's value is still 1). For how to make it stay at the end, see [Keeping the layer at the end value](../guides/animation.md#keeping-the-layer-at-the-end-value).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[CABasicAnimation animationWithKeyPath:@"opacity"]` | `CABasicAnimation.animationWithKeyPath('opacity')` |
| `[CABasicAnimation animation]` | `new CABasicAnimation()` |
| `anim.toValue = @1` | `anim.toValue = 1` |
| `anim.toValue = [NSValue valueWithCGPoint:p]` | `anim.toValue = p` |
| `anim.toValue = (id)color.CGColor` | `anim.toValue = 'systemBlue'` |
| `anim.toValue = (id)path.CGPath` | `anim.toValue = path` |

## See also

- [Animating layers](../guides/animation.md)
- [`CAPropertyAnimation`](ca-property-animation.md): animatable properties
- [`CASpringAnimation`](ca-spring-animation.md): reaching the end value with spring motion
- [Colors](ui-color.md): how to write color values
