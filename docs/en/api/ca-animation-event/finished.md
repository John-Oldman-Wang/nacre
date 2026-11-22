---
type: reference
native: CAAnimationEvent.finished
---

# `CAAnimationEvent`: `finished` property

The **`finished`** property tells whether the animation played to the end or was removed partway.

## Value

A boolean.

- Read-only. Assigning to it throws `TypeError`.
- `true`: it played to the end.
- `false`: it was removed partway, for example by calling the layer's `removeAnimationForKey()`, or by adding another animation under the same key.
- This fact is only available from the event; it can't be read from the animation object.
- When the event is created with [`new`](constructor.md) without it, it is `false`.

## Examples

```js
const dot = new CALayer();
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;
fade.addEventListener('stop', (e) => {
  if (e.finished) {
    dot.removeFromSuperlayer();
  }
});
dot.addAnimation(fade, { forKey: 'fade' });
```

**Effect**: after the fade-out of `dot` finishes, it is removed from its superlayer. If interrupted partway, it isn't removed.

## Corresponding iOS API

The `flag` parameter of `animationDidStop:finished:`.

## See also

- [`CAAnimationEvent`](../ca-animation-event.md)
