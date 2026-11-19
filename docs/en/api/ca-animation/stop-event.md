---
type: reference
native: "-[CAAnimationDelegate animationDidStop:finished:]"
---

# `CAAnimation`: `stop` event

The **`stop`** event fires when the animation ends. The event object's `finished` tells whether the animation played to the end or was removed partway.

## Syntax

```
animation.addEventListener('stop', (event) => { })
```

## Event object

`CAAnimationEvent`, with one field besides `type` and `target`:

**`finished`**

A boolean. `true` means it played to the end; `false` means it was removed partway, for example by calling the layer's `removeAnimationForKey()`. This fact is only available from the event; it cannot be read from the animation object.

- `target` is the animation object your code created, not the copy stored on the layer.
- Not cancelable.

## When it fires

- When the animation finishes playing; `finished` is `true`.
- When the animation is removed with `removeAnimationForKey()`; `finished` is `false`.
- An animation with `repeatCount` set to `Infinity` never ends on its own and fires only when removed.
- The callback does not run synchronously at the moment the animation ends; see [How the runtime works](../how-it-works.md).
- Add the listener before `addAnimation()`, on the object your code created.
- To know when a whole group ends, listen on the [`CAAnimationGroup`](../ca-animation-group.md). Whether members in the group fire it is **not verified in the simulator**.

In the type definitions, an animation object's `addEventListener()` only accepts `'start'` and `'stop'`. At runtime, listening for any other name does not throw: it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`.

## Examples

```js
const dot = new CALayer();
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;

fade.addEventListener('stop', (ev) => {
  if (ev.finished) {
    dot.removeFromSuperlayer();
  }
});

dot.addAnimation(fade, { forKey: 'fade' });
```

**Effect**: The layer disappears over 0.3 seconds and is removed from its superlayer after the animation finishes. For code that should run only when the animation finishes normally, check `finished`.

## Corresponding iOS API

`-[CAAnimationDelegate animationDidStop:finished:]`. No `delegate` needs to be set; listen on the animation object directly. The `flag` parameter becomes the event object's `finished`.

## See also

- [`start`](start-event.md): the animation starts
- [Doing the next thing after an animation ends](../../guides/animation.md#doing-the-next-thing-after-an-animation-ends)
