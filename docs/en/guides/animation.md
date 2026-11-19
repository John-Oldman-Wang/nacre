# Animating layers

This guide covers how to make a [layer](../api/ca-layer.md)'s properties change continuously over time: fading in and out, moving, blinking, moving along a path, spring bounces, and how to turn off the transitions the system adds automatically. The classes involved are [`CABasicAnimation`](../api/ca-basic-animation.md), [`CAKeyframeAnimation`](../api/ca-keyframe-animation.md), [`CASpringAnimation`](../api/ca-spring-animation.md), [`CAAnimationGroup`](../api/ca-animation-group.md), [`CAMediaTimingFunction`](../api/ca-media-timing-function.md), and [`CATransaction`](../api/ca-transaction.md); their common base class is [`CAAnimation`](../api/ca-animation.md). The details of each property and method are on their reference pages.

To update the UI frame by frame in code, see [Running code every frame](frame-callback.md).

## Recommended approach

- **To stay at the end value after the animation finishes, set the property's value to the end value as well.** An animation only changes what's displayed on screen, not the property's value; after it plays, the display returns to the property's value. For how, see [Keeping the layer at the end value](#keeping-the-layer-at-the-end-value).
- **Use the `start` and `stop` events to learn when an animation starts and ends; don't estimate with `setTimeout()`.** An animation doesn't start on the `addAnimation()` line; it starts late when JS is busy.
- **If you just want one change to be a bit smoother, change the property directly.** When you change a property of a layer that has been displayed, the system automatically adds a transition (an implicit animation). Create your own animation object only when you need to specify a start value, repetition, keyframes, or an end event, and use a transaction to turn off the implicit animation for that change.
- **When a change must take effect immediately, turn off implicit animation with a transaction.** For example, following a finger, or resizing sublayers after a layout change. See [Turning off implicit animation](#turning-off-implicit-animation).

## First animation

Starting from a blank app, draw a polyline and have it draw itself from left to right over 1.2 seconds, printing a line to the console when done.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. A fixed-size area
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

  // 3. The animation: strokeEnd goes from 0 to 1, so the stroke extends from the start point to the end point
  const draw = CABasicAnimation.animationWithKeyPath('strokeEnd');
  draw.fromValue = 0;
  draw.toValue = 1;
  draw.duration = 1.2;                 // seconds
  draw.timingFunction = CAMediaTimingFunction.functionWithName('easeInEaseOut');

  // 4. Get notified when it ends
  draw.addEventListener('stop', (ev) => {
    console.log('Done drawing, played to the end:', ev.finished);
  });

  // 5. The property's value is the end value (strokeEnd is 1 by default); then add the animation to the layer
  line.strokeEnd = 1;
  line.addAnimation(draw, { forKey: 'draw' });
});
```

**Effect**

- A 300 × 160 pt light gray rounded area appears near the top of the screen.
- A green polyline extends gradually from its left end and is fully drawn after 1.2 seconds, slow at the start and end and fast in the middle.
- After drawing, the polyline stays complete, and the console prints `Done drawing, played to the end: true`.

This code hasn't been run as a whole in the simulator. The animation code is the same as in the acceptance tests: the acceptance tests have run in the simulator, and both the polyline drawing itself gradually and a finished animation firing `stop` with `finished: true` have been verified.

The steps are: create the animation object, set the start and end values, set the duration, listen for the end, set the property's value to the end value, and add it to the layer.

The examples below all reuse an area `card` that's already on the view controller, and a layer `dot` on it:

```js
const card = new UIView();
card.frame = new CGRect(20, 100, 300, 160);
card.backgroundColor = 'secondarySystemBackground';
// ...card has already been added to the view controller

const dot = new CALayer();
dot.frame = new CGRect(20, 70, 20, 20);
dot.backgroundColor = 'systemBlue';
dot.cornerRadius = 10;
card.layer.addSublayer(dot);
```

**Effect**: a blue dot 20 pt in diameter appears on the left side of the card, centered at (30, 80).

## Keeping the layer at the end value

When an animation ends, the system removes it from the layer, and the value displayed on screen returns to the property's value. With an animation that takes opacity from 1 to 0, if `dot.opacity` stays 1, the layer reappears fully at the moment the animation finishes.

To keep the layer at the end value, **set the property's value to the end value as well**. The animation handles "how the process is displayed"; the property's value handles "what it is afterwards":

```js
// 1. Set the property's value directly to the end value, inside a transaction with implicit animation turned off
CATransaction.begin();
CATransaction.setDisableActions(true);
dot.opacity = 0;
CATransaction.commit();

// 2. The animation displays the process from 1 to 0. Write the start value explicitly
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;
dot.addAnimation(fade, { forKey: 'fade' });
```

**Effect**: the dot fades out over 0.3 seconds and stays invisible afterwards. Reading `dot.opacity` gives 0. **The on-screen behavior is not verified in the simulator.**

There are three things to note with this approach:

- **`fromValue` is required.** The property's value is already the end value; without a start value, the animation goes from the end value to the end value, and you see no change.
- **The transaction in step 1 is only needed for layers created with `new`.** Once such a layer has been displayed, changing its properties automatically adds a transition (see [Turning off implicit animation](#turning-off-implicit-animation)); the transaction turns it off, so only the animation from step 2 appears on screen. When the layer hasn't been displayed yet, the transaction has no effect, and including it does no harm.
- **For a view's layer, set the end value through the view's property.** For example, first write `view.alpha = 0`, then add an `'opacity'` animation to `view.layer`. No transaction is needed.

The other approach is to keep the animation from being removed when it ends, so it keeps displaying the end value:

```js
const fadeAndHold = CABasicAnimation.animationWithKeyPath('opacity');
fadeAndHold.fromValue = 1;
fadeAndHold.toValue = 0;
fadeAndHold.duration = 0.3;
fadeAndHold.fillMode = 'forwards';
fadeAndHold.removedOnCompletion = false;
dot.addAnimation(fadeAndHold, { forKey: 'fade' });
```

**Effect**: the dot fades out over 0.3 seconds and stays invisible afterwards. **Not verified in the simulator.**

The costs of this approach:

- The property's value hasn't changed and doesn't match what's displayed on screen.
- The animation stays on the layer. Changing `dot.opacity` later doesn't change what's displayed; you must first call `removeAnimationForKey('fade')`, and at the moment of removal the display jumps back to the property's value.

It's suitable when the end state is only temporary, such as when the layer will be removed right after the animation. Otherwise, use the first approach.

## Moving a layer

```js
const to = new CGPoint(270, 80);

const move = CABasicAnimation.animationWithKeyPath('position');
move.fromValue = dot.position;
move.toValue = to;
move.duration = 0.6;

CATransaction.begin();
CATransaction.setDisableActions(true);
dot.position = to;
CATransaction.commit();

dot.addAnimation(move, { forKey: 'move' });
```

**Effect**: the dot moves at a constant speed from the left side to the right side over 0.6 seconds, then stays on the right. **Not verified in the simulator.**

The value of `'position'` is the coordinate of the layer's center in its superlayer. Read `dot.position` before moving to use as the start value, then set the property's value to the end value. `frame` can't be animated; use `'position'` to move and `'bounds'` to resize. See [Animatable properties](../api/ca-property-animation.md#animatable-properties).

## Animating a view

View property animations usually use [`UIView.animateWithDuration()`](view-animations.md). When you need an animation object (specifying a start value, keyframes, motion along a path), add the animation to `view.layer` and set the end value through the view's property.

```js
const box = new UIView();
box.frame = new CGRect(200, 40, 80, 80);
box.backgroundColor = 'systemIndigo';
card.addSubview(box);

const appear = CABasicAnimation.animationWithKeyPath('opacity');
appear.fromValue = 0;
appear.toValue = 1;
appear.duration = 0.4;
box.layer.addAnimation(appear, { forKey: 'appear' });
```

**Effect**: an 80 × 80 pt color block goes from transparent to fully visible over 0.4 seconds.

`box.alpha` is already 1, which equals the end value, so there's nothing more to set here. The acceptance tests have added `'opacity'`, `'cornerRadius'`, and `'position'` animations to a view's layer in the same way.

## Repeating back and forth

```js
const pulse = CABasicAnimation.animationWithKeyPath('opacity');
pulse.fromValue = 1;
pulse.toValue = 0.2;
pulse.duration = 0.7;
pulse.autoreverses = true;
pulse.repeatCount = Infinity;
dot.addAnimation(pulse, { forKey: 'pulse' });
```

**Effect**: the dot fades over 0.7 seconds, comes back over another 0.7 seconds, and repeats indefinitely.

- When [`autoreverses`](../api/ca-animation/autoreverses.md) is `true`, the animation plays to the end and then plays backwards to the start. One round trip is twice `duration`.
- [`repeatCount`](../api/ca-animation/repeatcount.md) is the number of repetitions and can be fractional; 2.5 means two and a half times. `Infinity` means repeat forever.
- An animation that repeats forever never ends by itself. To stop it, call `dot.removeAnimationForKey('pulse')`.

## Changing the speed curve

```js
const slide = CABasicAnimation.animationWithKeyPath('position');
slide.fromValue = new CGPoint(30, 80);
slide.toValue = new CGPoint(270, 80);
slide.duration = 0.6;
slide.timingFunction = CAMediaTimingFunction.functionWithName('easeOut');
dot.addAnimation(slide, { forKey: 'move' });
```

**Effect**: the dot moves fast at first and slows down near the end. **Not verified in the simulator.**

Without `timingFunction`, the animation proceeds at a constant speed. For the five built-in curves, see [`functionWithName()`](../api/ca-media-timing-function/functionwithname.md); for custom curves, see [`functionWithControlPoints()`](../api/ca-media-timing-function/functionwithcontrolpoints.md).

## Doing the next thing after an animation ends

```js
const vanish = CABasicAnimation.animationWithKeyPath('opacity');
vanish.fromValue = 1;
vanish.toValue = 0;
vanish.duration = 0.3;

vanish.addEventListener('stop', (ev) => {
  if (ev.finished) {
    dot.removeFromSuperlayer();
  }
});

dot.addAnimation(vanish, { forKey: 'fade' });
```

**Effect**: the dot disappears over 0.3 seconds and is removed from the card when done.

The `finished` of the [`stop`](../api/ca-animation/stop-event.md) event distinguishes two ways of ending: `true` means it played to the end, `false` means it was removed partway. Code that should run only when it finishes normally must check `finished`.

Add the listener before `addAnimation()`. What's added to the layer is a copy, but events are dispatched to the original object, so listen on the original.

## Stopping an animation partway

```js
dot.removeAnimationForKey('pulse');   // stop the one named 'pulse'
dot.removeAllAnimations();            // stop all animations on this layer
```

**Effect**: the animation is removed from the layer, and the value displayed on screen returns to the property's value (**the on-screen behavior is not verified in the simulator**). An animation stopped with `removeAnimationForKey()` fires `stop` with `finished` `false`.

This is what the name given with `forKey` is for. An animation without a name can only be stopped with `removeAllAnimations()`.

## Delaying the start

```js
const fadeIn = CABasicAnimation.animationWithKeyPath('opacity');
fadeIn.fromValue = 0;
fadeIn.toValue = 1;
fadeIn.duration = 0.3;

setTimeout(() => {
  dot.addAnimation(fadeIn, { forKey: 'fade' });
}, 500);
```

**Effect**: after about 0.5 seconds, the dot starts a 0.3-second fade-in.

Use a [timer](../api/timers.md) to delay the call to `addAnimation()`. The animation object's `beginTime` property can't be used directly for this; for why, see [`beginTime`](../api/ca-animation/begintime.md).

## Passing through several values in turn

```js
const blink = CAKeyframeAnimation.animationWithKeyPath('opacity');
blink.values = [1, 0.2, 1, 0.2, 1];
blink.keyTimes = [0, 0.2, 0.5, 0.7, 1];
blink.duration = 1.5;
dot.addAnimation(blink, { forKey: 'blink' });
```

**Effect**: the dot blinks twice over 1.5 seconds: fades, recovers, fades again, recovers again. **Not verified in the simulator.**

- [`values`](../api/ca-keyframe-animation/values.md) is the values the property passes through in turn; their type is determined by `keyPath`, with the same rules as `toValue`.
- [`keyTimes`](../api/ca-keyframe-animation/keytimes.md) gives the moment each value appears, as a fraction from 0 to 1: 0 is the start of the animation, 1 the end. It has the same number of items as `values`. When not set, the values are evenly spaced.
- By default, the change between adjacent values is continuous.

## Switching directly at set times, without blending

```js
const chip = new CAShapeLayer();
chip.path = UIBezierPath.bezierPathWithRoundedRect(
  new CGRect(0, 0, 24, 24), { cornerRadius: 5 });
chip.fillColor = 'systemRed';
chip.frame = new CGRect(60, 20, 24, 24);
card.layer.addSublayer(chip);

const jump = CAKeyframeAnimation.animationWithKeyPath('fillColor');
jump.values = ['systemRed', '#FFCC00', 'systemGreen'];
jump.calculationMode = 'discrete';
jump.duration = 1.8;
jump.repeatCount = Infinity;
chip.addAnimation(jump, { forKey: 'jump' });
```

**Effect**: a small square shows red, yellow, and green in turn; each stays for a while and then switches directly to the next with no blending, one cycle every 1.8 seconds, repeating indefinitely.

[`calculationMode`](../api/ca-keyframe-animation/calculationmode.md) set to `'discrete'` means no transition between values. Remove this line and the color changes continuously from one to the next.

## Moving along a path

```js
const trail = new UIBezierPath();
trail.moveToPoint(new CGPoint(30, 130));
trail.addQuadCurveToPoint(new CGPoint(270, 130), { controlPoint: new CGPoint(150, 10) });

const walk = CAKeyframeAnimation.animationWithKeyPath('position');
walk.path = trail;
walk.calculationMode = 'paced';
walk.duration = 2.4;
walk.autoreverses = true;
walk.repeatCount = Infinity;
dot.addAnimation(walk, { forKey: 'walk' });
```

**Effect**: the dot moves along an upward-arching curve from the bottom left to the bottom right, then returns along the same path, repeating indefinitely, at a constant speed throughout.

- Once [`path`](../api/ca-keyframe-animation/path.md) is set, `values` has no effect.
- The path's coordinates are in the coordinate system of the layer's superlayer, the same as `position`.
- `calculationMode = 'paced'` makes the layer move along the path at a constant speed. Without it, each segment of the path takes the same time, so long segments move faster.
- To make the layer's orientation turn with the direction of travel, set `walk.rotationMode = 'auto'`; see [`rotationMode`](../api/ca-keyframe-animation/rotationmode.md). A dot looks the same when rotated; only elongated layers show the difference.

## Reaching the end value like a spring

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
spring.fromValue = new CGPoint(dot.position.x, -40);
spring.toValue = dot.position;
spring.stiffness = 120;
spring.damping = 8;
spring.duration = spring.settlingDuration;
dot.addAnimation(spring, { forKey: 'drop' });
```

**Effect**: the dot drops from above the card, overshoots its original position, bounces up and down a few times, and settles in place. **The bounce is not verified in the simulator.**

The motion of a spring animation is determined by four physical quantities rather than by a timing curve:

- The larger [`stiffness`](../api/ca-spring-animation/stiffness.md) is, the stiffer the spring and the faster it moves.
- The larger [`damping`](../api/ca-spring-animation/damping.md) is, the less it bounces. When large enough, it doesn't bounce and stops right at the end value.
- The larger [`mass`](../api/ca-spring-animation/mass.md) is, the slower it moves and the longer the bouncing lasts.
- [`initialVelocity`](../api/ca-spring-animation/initialvelocity.md) is the velocity it already has when the animation starts.

How long the spring takes to come to rest is computed from these four quantities; read it from [`settlingDuration`](../api/ca-spring-animation/settlingduration.md), in seconds. The four default values give 1.473 seconds; raising `damping` from 10 to 40 gives 1.000 seconds.

We recommend setting `duration` to `settlingDuration`, as above. Read `settlingDuration` only after all four physical quantities are set.

## Animating several properties together

```js
const radius = CABasicAnimation.animationWithKeyPath('cornerRadius');
radius.fromValue = 0;
radius.toValue = 10;

const show = CABasicAnimation.animationWithKeyPath('opacity');
show.fromValue = 0;
show.toValue = 1;

const group = new CAAnimationGroup();
group.animations = [radius, show];
group.duration = 1.2;
dot.addAnimation(group, { forKey: 'intro' });
```

**Effect**: over 1.2 seconds, the dot changes from a transparent square to a fully visible circle.

- The group's `duration` is the duration of the whole group. Members without their own `duration` use the group's.
- Groups also have `timingFunction`, `repeatCount`, and `autoreverses`, which apply to the whole group.
- To know when the whole group ends, listen for `stop` on the group.

When you don't need unified control, you can skip the group and add the animations to the layer separately. Animations added in the same piece of code start together.

## Turning off implicit animation

Once a layer created with `new` has been displayed on screen, changing its properties automatically adds a 0.25-second transition (**the duration is not verified in the simulator**). For when this happens, see [Implicit animation](../api/ca-transaction.md#implicit-animations). To make a change take effect immediately, put it in a transaction with implicit animation turned off:

```js
CATransaction.begin();
CATransaction.setDisableActions(true);
dot.position = new CGPoint(150, 80);
dot.opacity = 0.5;
CATransaction.commit();
```

**Effect**: the dot appears at the new position immediately and becomes semi-transparent, with no transition.

To keep the transition but change only its duration and curve:

```js
CATransaction.begin();
CATransaction.setAnimationDuration(1.5);
CATransaction.setAnimationTimingFunction(
  CAMediaTimingFunction.functionWithName('easeOut'));
dot.opacity = 1;
CATransaction.commit();
```

**Effect**: when the layer has been displayed, `opacity` transitions to 1 over 1.5 seconds, fast at first and slowing before the end. **Not verified in the simulator.**

When to use implicit animation and when to create an animation object:

- If you just want one change to be a bit smoother and the default duration and curve are fine: change the property directly and use implicit animation.
- If you need to specify a start value, repetition, keyframes, or an end event: create an animation object, and at the same time turn off implicit animation for that change with a transaction; see [Keeping the layer at the end value](#keeping-the-layer-at-the-end-value).
- If the change must take effect immediately, such as following a finger or resizing sublayers after a layout change: turn it off with a transaction.

## See also

- [`CAAnimation`](../api/ca-animation.md): duration, repetition, events, and the rules after an animation is added to a layer
- [`CABasicAnimation`](../api/ca-basic-animation.md), [`CAKeyframeAnimation`](../api/ca-keyframe-animation.md), [`CASpringAnimation`](../api/ca-spring-animation.md), [`CAAnimationGroup`](../api/ca-animation-group.md)
- [`CAPropertyAnimation`](../api/ca-property-animation.md): animatable properties
- [`CAMediaTimingFunction`](../api/ca-media-timing-function.md): timing curves
- [`CATransaction`](../api/ca-transaction.md): implicit animation
- [`CALayer`](../api/ca-layer.md): what animations act on
- [Running code every frame](frame-callback.md): when animation objects can't express what you need
