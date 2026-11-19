---
type: reference
native: CAAnimationGroup.animations
---

# `CAAnimationGroup`: `animations` property

The **`animations`** property is the animations in the group.

## Value

An array of animation objects (subclasses of [`CAAnimation`](../ca-animation.md)).

- Readable and writable.
- The default is `[]`.
- Reading returns the same objects that were written. Listeners added to the members stay with the objects.
- Writing `null` or `undefined` is the same as writing `[]`.

### Invalid values

An element in the array that isn't an animation: throws `TypeError: animations needs an array of CAAnimation`.

## Examples

```js
const radius = CABasicAnimation.animationWithKeyPath('cornerRadius');
const appear = CABasicAnimation.animationWithKeyPath('opacity');

const group = new CAAnimationGroup();
group.animations = [radius, appear];
console.log(group.animations[1] === appear);
```

**Result**: The console prints `true`.

## Corresponding iOS API

`CAAnimationGroup.animations`.

## See also

- [`CAAnimationGroup`](../ca-animation-group.md): how the timing of the group and its members fits together
