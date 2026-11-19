# Animating views

This guide covers how to use [`UIView.animateWithDuration()`](../api/ui-view/animatewithduration.md) to animate changes to view properties: fading in and out, moving, scaling, changing constraints, spring effects, and doing the next thing after an animation ends. Details of the parameters, options, and error cases are on the reference page for [`animateWithDuration()`](../api/ui-view/animatewithduration.md).

## Recommended approach

- **Put the code that changes properties inside the `animations` function.** Animatable properties are `alpha`, `frame`, `bounds`, `center`, `transform`, and `backgroundColor`.
- **Put what should happen after the animation ends after an `await`.** `animateWithDuration()` returns a Promise that fulfills when the animation ends; no callback parameter is needed.
- **For animations that change constraints, call `layoutIfNeeded()` inside `animations`.** Changing a constraint isn't animated by itself.
- For more complex animations such as keyframes, motion along a path, and animation groups, use [Core Animation](../api/ca-animation.md).

## First example

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const dot = new UIView();
  dot.frame = new CGRect(56, 136, 40, 40);
  dot.backgroundColor = 'systemOrange';
  page.view.addSubview(dot);

  UIView.animateWithDuration(0.3, {
    animations() {
      dot.alpha = 0;
      dot.transform = CGAffineTransform.scale(0.5);
    },
  });
});
```

**Effect**: Over 0.3 seconds, the orange square fades out while shrinking to half its size. **How it looks on screen is not verified in the simulator.**

- The first argument is the animation's duration, in seconds.
- `animations` runs immediately within this call. When the call returns, `dot.alpha` already reads 0; the change on screen happens over the following 0.3 seconds (measured).

The sections below reuse `page` and `dot` from the first example. In addition, `card` is another view already in the view controller's view, `heightConstraint` is an active height constraint, and `badge` is yet another view already on screen. To try a section on its own, write these lines first:

```js
const page = new UIViewController();
const dot = new UIView();
page.view.addSubview(dot);
const card = new UIView();
card.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(card);
const heightConstraint = card.heightAnchor.constraintEqualToConstant(120);
heightConstraint.isActive = true;
const badge = new UIView();
page.view.addSubview(badge);
```

## Doing the next thing after an animation ends

`animateWithDuration()` returns a Promise that fulfills when the animation ends.

```js
async function dismissCard() {
  const finished = await UIView.animateWithDuration(0.3, {
    animations() { card.alpha = 0; },
  });
  if (finished) card.removeFromSuperview();
}
```

**Effect**: The card fades out over 0.3 seconds, then is removed from the view hierarchy.

- A fulfilled value of `true` means the animation played to the end.
- When the animation is interrupted partway, the fulfilled value is `false`. Measured: starting another animation on the same property fulfills the previous one with `false`.

## Animating constraint changes

After changing constraints, call the superview's `layoutIfNeeded()` inside `animations`.

```js
heightConstraint.constant = 240;
UIView.animateWithDuration(0.25, {
  animations() { page.view.layoutIfNeeded(); },
});
```

**Effect**: The views affected by this constraint move to their new position and size over 0.25 seconds. **Not verified in the simulator.**

Changing a constraint isn't animated by itself. What is animated is the `frame` change caused by `layoutIfNeeded()`, so it has to be inside `animations`.

## Animations with bounce

Give both `usingSpringWithDamping` and `initialSpringVelocity`, and the animation moves like a spring.

```js
UIView.animateWithDuration(0.5, {
  usingSpringWithDamping: 0.6,
  initialSpringVelocity: 0,
  animations() { dot.transform = CGAffineTransform.scale(1.5); },
});
```

**Effect**: The orange square grows to 1.5 times its size, overshoots a little and comes back, and settles after a few oscillations. **How it looks on screen is not verified in the simulator.**

`usingSpringWithDamping` is the damping, from 0 to 1: 1 doesn't bounce, and smaller values bounce more.

## Excluding some changes from the animation

Inside `animations`, when most changes should animate but a few should take effect immediately, wrap those lines in [`UIView.performWithoutAnimation()`](../api/ui-view/performwithoutanimation.md).

```js
UIView.animateWithDuration(0.3, {
  animations() {
    dot.alpha = 0.5;
    UIView.performWithoutAnimation(() => {
      badge.alpha = 0;
    });
  },
});
```

**Effect**: `dot` becomes half transparent over 0.3 seconds, while `badge` becomes fully transparent immediately, with no fade. `badge` is another view already in the interface. Measured: the properties changed inside `performWithoutAnimation()` took effect, and no extra animation was added to the layer as a result.

## See also

- [`UIView.animateWithDuration()`](../api/ui-view/animatewithduration.md): all parameters and options
- [`UIView.performWithoutAnimation()`](../api/ui-view/performwithoutanimation.md)
- [Core Animation](../api/ca-animation.md): keyframes, motion along a path, animation groups
- [Placing views on screen](views.md)
