---
type: reference
native: CAKeyframeAnimation
status: partial
---

# `CAKeyframeAnimation`

**`CAKeyframeAnimation`** represents an animation that makes one of a layer's properties pass through several values in turn, or that moves a layer along a path. The values passed through are called keyframes.

As with `toValue` of [`CABasicAnimation`](ca-basic-animation.md), the type of the keyframe values is determined by [`keyPath`](ca-property-animation/keypath.md), so `keyPath` must be set before `values` can be.

**Inheritance**: `EventTarget` → `NSObject` → [`CAAnimation`](ca-animation.md) → [`CAPropertyAnimation`](ca-property-animation.md) → `CAKeyframeAnimation`

For using it to blink, change colors, and move along a path, see the guide [Animation](../guides/animation.md#passing-through-several-values-in-turn).

## Constructor

[`CAKeyframeAnimation()`](ca-keyframe-animation/constructor.md)

Creates a keyframe animation with no property specified yet.

## Static methods

[`CAKeyframeAnimation.animationWithKeyPath()`](ca-keyframe-animation/animationwithkeypath.md)

Creates a keyframe animation with a property specified.

## Instance properties

Also inherits `keyPath` from [`CAPropertyAnimation`](ca-property-animation.md) and the properties of [`CAAnimation`](ca-animation.md); the commonly used ones are `duration`, `repeatCount`, and `autoreverses`.

| Property | Description |
| --- | --- |
| [`values`](ca-keyframe-animation/values.md) | The values passed through in turn |
| [`path`](ca-keyframe-animation/path.md) | The layer moves along this path. When set, `values` has no effect |
| [`keyTimes`](ca-keyframe-animation/keytimes.md) | When each value occurs |
| [`timingFunctions`](ca-keyframe-animation/timingfunctions.md) | The timing curve used between each pair of adjacent values |
| [`calculationMode`](ca-keyframe-animation/calculationmode.md) | How it transitions from value to value |
| [`rotationMode`](ca-keyframe-animation/rotationmode.md) | Whether the layer turns when moving along a path |
| [`tensionValues`](ca-keyframe-animation/tensionvalues.md) | The tightness of the smooth curve near each value |
| [`continuityValues`](ca-keyframe-animation/continuityvalues.md) | The continuity of the smooth curve near each value |
| [`biasValues`](ca-keyframe-animation/biasvalues.md) | The bias of the smooth curve near each value |

## Events

Inherits [`start`](ca-animation/start-event.md) and [`stop`](ca-animation/stop-event.md) from [`CAAnimation`](ca-animation.md).

## Examples

```js
const layer = new CALayer();
layer.frame = new CGRect(20, 70, 20, 20);
layer.backgroundColor = 'systemBlue';

const blink = CAKeyframeAnimation.animationWithKeyPath('opacity');
blink.values = [1, 0.2, 1, 0.2, 1];
blink.keyTimes = [0, 0.2, 0.5, 0.7, 1];
blink.duration = 1.5;
layer.addAnimation(blink, { forKey: 'blink' });
```

**Effect**: Once the layer is shown on screen, it blinks twice over 1.5 seconds: fades, recovers, fades again, recovers again. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[CAKeyframeAnimation animationWithKeyPath:@"position"]` | `CAKeyframeAnimation.animationWithKeyPath('position')` |
| `keyframe.values = @[@0, @1]` | `keyframe.values = [0, 1]` |
| `keyframe.path = path.CGPath` | `keyframe.path = path` |
| `keyframe.calculationMode = kCAAnimationPaced` | `keyframe.calculationMode = 'paced'` |
| `keyframe.rotationMode = kCAAnimationRotateAuto` | `keyframe.rotationMode = 'auto'` |

## See also

- [Animating layers](../guides/animation.md): passing through several values, switching values without interpolation, moving along a path
- [`UIBezierPath`](ui-bezier-path.md): the paths used for moving along a path
- [`UIImage`](../guides/images.md#controlling-animated-image-playback-yourself): frame-by-frame animation from a set of images
