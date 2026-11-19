---
type: reference
native: CAAnimation.beginTime
---

# `CAAnimation`: `beginTime` property

The **`beginTime`** property is the animation's start time.

## Value

A number, in seconds.

- Readable and writable.
- The default is `0`, meaning it starts as soon as it is added to the layer.
- The reference is the layer's own time, not "the moment it was added to the layer". There is no way yet to read the layer's current time, so a standalone animation cannot use `beginTime` to say "start after 0.5 seconds". To delay the start, delay the `addAnimation()` call with a [timer](../timers.md); see [Delaying the start](../../guides/animation.md#delaying-the-start).
- For an animation inside a [`CAAnimationGroup`](../ca-animation-group.md), `beginTime` is relative to the start of the group and can be used to start the members one after another. **Not verified in the simulator.**

### Invalid values

Converted with `Number()`. If the result is not a finite number, throws `TypeError`: `beginTime must be a finite number, got …`.

## Examples

```js
const radius = CABasicAnimation.animationWithKeyPath('cornerRadius');
radius.fromValue = 0;
radius.toValue = 10;
radius.duration = 0.6;

const appear = CABasicAnimation.animationWithKeyPath('opacity');
appear.fromValue = 0;
appear.toValue = 1;
appear.duration = 0.6;
appear.beginTime = 0.6;

const group = new CAAnimationGroup();
group.animations = [radius, appear];
group.duration = 1.2;
```

**Effect**: After the group is added to a layer, the corner radius grows during the first 0.6 seconds, and the layer fades in during the next 0.6 seconds. **Not verified in the simulator.**

## Corresponding iOS API

`CAMediaTiming.beginTime`.

## See also

- [Delaying the start](../../guides/animation.md#delaying-the-start)
