---
type: reference
native: "-[CAAnimationDelegate animationDidStart:]"
---

# `CAAnimation`: `start` event

The **`start`** event fires when the animation starts playing.

## Syntax

```
animation.addEventListener('start', (event) => { })
```

## Event object

`CAAnimationEvent`, with no fields other than `type` and `target`.

- `target` is the animation object your code created, not the copy stored on the layer.
- Not cancelable.

## When it fires

- When the animation starts playing on screen. This is not the moment `addAnimation()` is called: the animation starts only after the current piece of JS code finishes and the interface changes are handed to the system; see [After adding to a layer](../ca-animation.md#after-adding-to-a-layer).
- The callback does not run synchronously at the moment the animation starts; see [How the runtime works](../how-it-works.md).
- Add the listener before `addAnimation()`, on the object your code created.
- Whether members inside a [`CAAnimationGroup`](../ca-animation-group.md) fire it is **not verified in the simulator**.

In the type definitions, an animation object's `addEventListener()` only accepts `'start'` and `'stop'`. At runtime, listening for any other name does not throw: it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`.

## Examples

```js
const layer = new CALayer();
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;
fade.addEventListener('start', () => {
  console.log('Started');
});
layer.addAnimation(fade, { forKey: 'fade' });
```

**Effect**: When the layer is shown on screen, the animation starts playing and the console prints `Started`.

## Corresponding iOS API

`-[CAAnimationDelegate animationDidStart:]`. No `delegate` needs to be set; listen on the animation object directly.

## See also

- [`stop`](stop-event.md): the animation ends
