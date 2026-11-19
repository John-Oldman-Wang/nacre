---
type: reference
native: CAAnimationGroup
status: partial
---

# `CAAnimationGroup`

**`CAAnimationGroup`** represents a group of animations. The animations in the group are added to the same layer as a single unit and start together; the group controls their duration, repetition, and timing curve as a whole.

A group has no `keyPath`; each member has its own `keyPath`.

- The group's `duration` is the duration of the whole group. Members that don't set `duration` use the group's duration. If a member's duration exceeds the group's, the excess isn't played. **The latter sentence is not verified in the simulator.**
- The group's `timingFunction`, `repeatCount`, and `autoreverses` apply to the whole group.
- A member's `beginTime` is relative to the start of the group and can be used to start members one after another. **Not verified in the simulator.**
- To know when the whole group ends, listen for `stop` on the group. Whether `start` and `stop` fire on the members is **not verified in the simulator**.

If you don't need unified control, you can skip the group and add several animations to the layer separately. Animations added in the same piece of code start together.

**Inheritance**: `EventTarget` → `NSObject` → [`CAAnimation`](ca-animation.md) → `CAAnimationGroup`

## Constructor

[`CAAnimationGroup()`](ca-animation-group/constructor.md)

Creates an empty animation group.

## Instance properties

It also inherits the properties of [`CAAnimation`](ca-animation.md); the commonly used ones are `duration`, `repeatCount`, `autoreverses`, and `timingFunction`.

| Property | Description |
| --- | --- |
| [`animations`](ca-animation-group/animations.md) | The animations in the group |

## Events

It inherits [`start`](ca-animation/start-event.md) and [`stop`](ca-animation/stop-event.md) from [`CAAnimation`](ca-animation.md).

## Examples

```js
const dot = new CALayer();
dot.frame = new CGRect(20, 70, 20, 20);
dot.backgroundColor = 'systemBlue';

const radius = CABasicAnimation.animationWithKeyPath('cornerRadius');
radius.fromValue = 0;
radius.toValue = 10;

const appear = CABasicAnimation.animationWithKeyPath('opacity');
appear.fromValue = 0;
appear.toValue = 1;

const group = new CAAnimationGroup();
group.animations = [radius, appear];
group.duration = 1.2;
dot.addAnimation(group, { forKey: 'intro' });
```

**Effect**: Once the layer is on screen, it changes over 1.2 seconds from a transparent square into a fully visible circle.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[CAAnimationGroup animation]` | `new CAAnimationGroup()` |
| `group.animations = @[a, b]` | `group.animations = [a, b]` |

## See also

- [Animating several properties together](../guides/animation.md#animating-several-properties-together)
