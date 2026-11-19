---
type: reference
native: CAAnimation
status: partial
---

# `CAAnimation`

**`CAAnimation`** represents an animation applied to a [layer](ca-layer.md): over a period of time, it changes one of the layer's properties (opacity, position, corner radius, color, path, and so on) continuously from one value to another. It is the base class of all animation objects and manages timing: duration, repetition, speed, what happens after the end, and the events fired at start and end.

`CAAnimation` itself cannot be created. In practice you use its subclasses, each responsible for one kind of animation:

| Class | What it represents |
| --- | --- |
| [`CABasicAnimation`](ca-basic-animation.md) | One property changing from one value to another |
| [`CAKeyframeAnimation`](ca-keyframe-animation.md) | One property passing through several values in turn, or a layer moving along a path |
| [`CASpringAnimation`](ca-spring-animation.md) | One property reaching its end like a spring: overshooting the end and bouncing back a few times before settling |
| [`CAAnimationGroup`](ca-animation-group.md) | Several animations added to one layer together as a group |

Classes that work with animations:

| Class | What it represents |
| --- | --- |
| [`CAPropertyAnimation`](ca-property-animation.md) | An animation that changes one property; the common superclass of the first three subclasses. It decides which property the animation changes |
| [`CAMediaTimingFunction`](ca-media-timing-function.md) | A timing curve: whether the animation starts fast and ends slow, or the reverse |
| [`CATransaction`](ca-transaction.md) | Transactions: control the transition animations the system adds automatically (implicit animations) |
| [`CADisplayLink`](ca-display-link.md) | Fires an event once per screen refresh, for updating the interface frame by frame in code |
| [`NSRunLoop`](ns-run-loop.md) | The main thread's event loop. `CADisplayLink` must be added to it to start working |

All animation objects are used the same way: create an animation object, set its properties, and call the layer's `addAnimation()` to add it to the layer. Animating a view means animating its layer (`view.layer`). The five methods for adding, looking up, and removing animations on a layer are on [`CALayer`](ca-layer.md).

None of these classes can be subclassed; see [Native classes](native-classes.md).

**Inheritance**: `EventTarget` → `NSObject` → `CAAnimation`

For making common animations with them, see the guide [Animating layers](../guides/animation.md); for updating the interface frame by frame in code, see [Running code every frame](../guides/frame-callback.md).

## Constructor

Cannot be created with `new`. Create one with a subclass constructor or the static method `animationWithKeyPath()`, such as [`CABasicAnimation.animationWithKeyPath()`](ca-basic-animation/animationwithkeypath.md).

## Instance properties

All four kinds of animation have the following properties. All times are in seconds.

| Property | Description |
| --- | --- |
| [`duration`](ca-animation/duration.md) | The length of one play-through |
| [`repeatCount`](ca-animation/repeatcount.md) | The number of repetitions; can be fractional; `Infinity` repeats forever |
| [`repeatDuration`](ca-animation/repeatduration.md) | The total length of repeated playback |
| [`autoreverses`](ca-animation/autoreverses.md) | Whether it plays backward to the start after reaching the end |
| [`timingFunction`](ca-animation/timingfunction.md) | The timing curve |
| [`fillMode`](ca-animation/fillmode.md) | What is shown outside the active period |
| [`removedOnCompletion`](ca-animation/removedoncompletion.md) | Whether it is removed from the layer when it finishes |
| [`beginTime`](ca-animation/begintime.md) | The start time |
| [`speed`](ca-animation/speed.md) | The playback speed multiplier |
| [`timeOffset`](ca-animation/timeoffset.md) | Which second of the animation playback starts from |

## Events

Listen with `addEventListener()`.

| Event | When it fires |
| --- | --- |
| [`start`](ca-animation/start-event.md) | The animation starts playing |
| [`stop`](ca-animation/stop-event.md) | The animation ends, with `finished` telling whether it played to the end or was removed |

## Property values and displayed values

Every property of a layer has a value; for example, `layer.opacity` is 1. Animations do not modify this value. While an animation runs, the system displays the intermediate values the animation computes; reading `layer.opacity` at that time still gives 1.

So there are two independent things:

- **The property value**: what code writes, and what reading the property returns.
- **The displayed value**: equal to the property value when there is no animation; decided by the animation when there is one.

After an animation ends, the system removes it from the layer, and the displayed value returns to the property value. To make a layer stay at the end, set the property value to the end value too; see [Keeping a layer at the end](../guides/animation.md#keeping-the-layer-at-the-end-value).

**The behavior in this section comes from iOS's definition and is not verified in the simulator.**

## After adding to a layer

- **After `addAnimation()` is called, the animation does not start on that line.** It starts playing only after the current piece of JS code finishes and the interface changes are handed to the system. When JS keeps running, it starts late: the acceptance tests once measured the animation starting 751 milliseconds after `addAnimation()`, because JS was running other code the whole time. So do not estimate when an animation ends with `setTimeout()`; use the [`start`](ca-animation/start-event.md) and [`stop`](ca-animation/stop-event.md) events. Several animations added in the same piece of code start together.
- **The layer stores a copy of the animation object.** Changing the original object after adding it does not change the running animation, and `layer.animationForKey()` does not return the original object. To change an animation already added, create a new one and add it again with the same `forKey`.
- **Events are fired on the object your code created**, not on the copy. So listen on the original object, and add the listeners before `addAnimation()`.
- On one layer, a name can have only one animation. Adding again with an existing name removes and replaces the old one. **The replacement is not verified in the simulator.**
- The name given by `forKey` is used for later lookup and removal. Animations without a name can only be removed with `removeAllAnimations()`.
- The copy returned by `layer.animationForKey()` is the same class as the object added: if you added a `CASpringAnimation`, you read back a `CASpringAnimation`. The returned object is for reading only; the result of modifying its properties is undefined.
- If the first argument of `addAnimation()` is not an animation object, it throws `TypeError: addAnimation: expects a CAAnimation`.

## Examples

Starting from a blank app, draw a polyline that is gradually drawn from left to right over 1.2 seconds, and print a line to the console when it is done.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. An area of fixed size
  const card = new UIView();
  card.frame = new CGRect(20, 100, 300, 160);
  card.backgroundColor = 'secondarySystemBackground';
  card.layer.cornerRadius = 12;
  page.view.addSubview(card);

  // 2. Draw a polyline with a shape layer
  const path = new UIBezierPath();
  path.moveToPoint(new CGPoint(24, 130));
  path.addLineToPoint(new CGPoint(96, 56));
  path.addLineToPoint(new CGPoint(168, 100));
  path.addLineToPoint(new CGPoint(276, 30));

  const line = new CAShapeLayer();
  line.path = path;
  line.fillColor = null;
  line.strokeColor = 'systemGreen';
  line.lineWidth = 3;
  line.lineCap = 'round';
  line.lineJoin = 'round';
  line.frame = card.bounds;
  card.layer.addSublayer(line);

  // 3. The animation: strokeEnd goes from 0 to 1, so the stroke extends from start to end
  const draw = CABasicAnimation.animationWithKeyPath('strokeEnd');
  draw.fromValue = 0;
  draw.toValue = 1;
  draw.duration = 1.2;                 // seconds
  draw.timingFunction = CAMediaTimingFunction.functionWithName('easeInEaseOut');

  // 4. Get notified when it ends
  draw.addEventListener('stop', (ev) => {
    console.log('Done drawing, played to the end:', ev.finished);
  });

  // 5. The property value is the end value (strokeEnd defaults to 1); then add the animation to the layer
  line.strokeEnd = 1;
  line.addAnimation(draw, { forKey: 'draw' });
});
```

**Effect**

- A 300 × 160 pt light gray area with rounded corners appears near the top of the screen.
- A green polyline gradually extends from the left end and is fully drawn after 1.2 seconds, slow at the start and end and fast in the middle.
- After it is drawn, the polyline stays complete, and the console prints `Done drawing, played to the end: true`.

This code has not been run as a whole in the simulator. Its animation code is the same as in the acceptance tests: those ran in the simulator and verified that the polyline is drawn gradually and that a completed animation fires `stop` with `finished: true`.

For more patterns, see the guide [Animating layers](../guides/animation.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[CABasicAnimation animationWithKeyPath:@"opacity"]` | `CABasicAnimation.animationWithKeyPath('opacity')` |
| `[CABasicAnimation animation]` | `new CABasicAnimation()` |
| `anim.repeatCount = HUGE_VALF` | `anim.repeatCount = Infinity` |
| `anim.fillMode = kCAFillModeForwards` | `anim.fillMode = 'forwards'` |
| `anim.removedOnCompletion = NO` | `anim.removedOnCompletion = false` |
| `anim.delegate = self`, implementing `animationDidStart:` | `anim.addEventListener('start', …)` |
| `anim.delegate = self`, implementing `animationDidStop:finished:` | `anim.addEventListener('stop', (e) => e.finished)` |
| `[layer addAnimation:a forKey:@"fade"]` | `layer.addAnimation(a, { forKey: 'fade' })` |
| `[layer animationForKey:@"fade"]` | `layer.animationForKey('fade')` |
| `[layer animationKeys]` | `layer.animationKeys()` |
| `[layer removeAnimationForKey:@"fade"]` | `layer.removeAnimationForKey('fade')` |

For each subclass's mapping, see its own page.

## See also

- [Animating layers](../guides/animation.md): keeping a layer at the end, moving, repeating, keyframes, springs, animation groups, turning off implicit animations
- [`CALayer`](ca-layer.md): what animations act on, and the methods for adding, looking up, and removing animations
- [`CAPropertyAnimation`](ca-property-animation.md): which properties can be animated
- [`UIBezierPath`](ui-bezier-path.md): the paths used by `'path'` animations and by moving along a path
- [Structs](structs.md): `CGPoint`, `CGRect`, `CGSize`
- [How the runtime works](how-it-works.md): when event callbacks run
