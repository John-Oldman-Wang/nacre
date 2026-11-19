# Creating blur and glass effects

This guide covers how to use [`UIVisualEffectView`](../api/ui-visual-effect-view.md) to make a translucent blurred panel, make text on the panel more vivid, use iOS 26's glass, and what to check when no effect is visible. The details of the effect objects are on the reference pages for [`UIBlurEffect`](../api/ui-blur-effect.md), [`UIVibrancyEffect`](../api/ui-vibrancy-effect.md), [`UIGlassEffect`](../api/ui-glass-effect.md), and [`UIGlassContainerEffect`](../api/ui-glass-container-effect.md).

All of the on-screen effects described in this guide (how blurred things look, what the glass looks like) are **not verified in the simulator**.

## Recommended approach

- **Add content to [`contentView`](../api/ui-visual-effect-view/contentview.md).** Calling `addSubview()` or `insertSubview()` directly on the effect view throws `TypeError`.
- **Blur and vibrancy effects can be shared.** They are immutable, so the same object can be given to several effect views; there is no need to create one for each view.
- **Set up a glass effect's properties first, then hand it to the view.** The effect view keeps a copy taken at the moment of assignment; to change it later, make the change and assign it again; see [Changing glass that is already in use](#changing-glass-that-is-already-in-use).
- **A vibrancy effect needs an extra layer of effect view.** It is not applied to the blurred panel itself; for how, see [Making text on the panel more vivid](#making-text-on-the-panel-more-vivid).

## First example

Starting from a blank app, place four colored stripes, then cover them with a blurred panel that has a line of text on it.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. First put down something colorful. The effect works on what is behind it
  ['systemRed', 'systemOrange', 'systemGreen', 'systemBlue'].forEach((color, i) => {
    const stripe = new UIView();
    stripe.frame = new CGRect(40 + i * 70, 200, 70, 200);
    stripe.backgroundColor = color;
    page.view.addSubview(stripe);
  });

  // 2. Create a blur effect and hand it to an effect view
  const blur = UIBlurEffect.effectWithStyle('systemMaterial');
  const panel = new UIVisualEffectView(blur);
  panel.frame = new CGRect(60, 260, 240, 80);
  page.view.addSubview(panel);

  // 3. Add content to contentView
  const label = new UILabel();
  label.text = 'Frosted glass';
  label.textAlignment = 'center';
  label.frame = new CGRect(0, 0, 240, 80);
  panel.contentView.addSubview(label);
});
```

**Effect**

- The screen has four vertical stripes: red, orange, green, and blue.
- A 240 × 80 pt panel covers the middle of the stripes. The stripes within the panel are blurred, and their edges are indistinct.
- The text "Frosted glass" sits in the center of the panel, and the text itself is sharp.

This code has not been run in the simulator. For the units of length, see [Units](../api/units.md).

The three steps are: prepare what is behind, create the effect and hand it to the effect view, and add content to `contentView`. The following sections reuse `page`, `blur`, `panel`, and `label` from here. To try a section on its own, write these lines first:

```js
const page = new UIViewController();
const blur = UIBlurEffect.effectWithStyle('systemMaterial');
const panel = new UIVisualEffectView(blur);
page.view.addSubview(panel);
const label = new UILabel();
panel.contentView.addSubview(label);
```

## Why no effect is visible

An effect works on what is **behind** the effect view. In the following cases the effect is faint or not shown:

- **There is nothing behind it to work on.** When what is behind the effect view is a solid color, it is still a solid color after blurring, so no blur is visible.
- **The `alpha` of the effect view or one of its ancestor views is less than 1.** Apple notes in the headers that in this case many effects display incorrectly or not at all. To make the content translucent, change the `alpha` of the views inside `contentView`.
- **`effect` is `null`.** Without an effect, the effect view is just a container holding `contentView`.

All three are **not verified in the simulator**.

## Switching to a different blur

```js
panel.effect = UIBlurEffect.effectWithStyle('systemThinMaterialDark');
```

**Effect**: The panel switches to a thinner blur that is always dark. The text in `contentView` stays. **Not verified in the simulator.**

For all styles, see [`UIBlurEffect.effectWithStyle()`](../api/ui-blur-effect/effectwithstyle.md).

## Making text on the panel more vivid

A vibrancy effect is used on **another** effect view. That effect view goes inside the blurred panel's `contentView`, and the text goes inside its `contentView`.

```js
const vivid = new UIVisualEffectView(
  UIVibrancyEffect.effectForBlurEffect(blur, { style: 'label' }));
vivid.frame = new CGRect(0, 0, 240, 80);
panel.contentView.addSubview(vivid);

vivid.contentView.addSubview(label);   // label moves from panel.contentView to here
```

**Effect**: The text takes on the colors of what is behind the panel. **Not verified in the simulator.**

The first argument of `effectForBlurEffect()` is the blur effect the panel uses, and the vibrancy effect is matched to it. Choose `style` according to what the content is; see [`UIVibrancyEffect.effectForBlurEffect()`](../api/ui-vibrancy-effect/effectforblureffect.md).

## Using glass

```js
const glass = UIGlassEffect.effectWithStyle('regular');
const chip = new UIVisualEffectView(glass);
chip.frame = new CGRect(60, 360, 120, 44);
page.view.addSubview(chip);
```

**Effect**: A 120 × 44 pt piece of glass appears over the stripes. **Not verified in the simulator.**

## Tinting glass and making it respond to touch

```js
const tinted = UIGlassEffect.effectWithStyle('clear');
tinted.tintColor = 'rgba(255, 45, 85, 0.35)';
tinted.isInteractive = true;
const tintedChip = new UIVisualEffectView(tinted);
```

**Effect**: The glass has a pink tint. The glass reacts when a finger presses on it. **Not verified in the simulator.**

For how to write colors, see [Colors](../api/ui-color.md).

## Changing glass that is already in use

The effect view keeps a copy taken at assignment, so after a change you must assign it again. The first three lines create the `glass` and `chip` from the [Using glass](#using-glass) section.

```js
const glass = UIGlassEffect.effectWithStyle('regular');
const chip = new UIVisualEffectView(glass);
page.view.addSubview(chip);

glass.tintColor = '#34C759';   // after this line, chip still has the original color
chip.effect = glass;           // it takes effect only once assigned again
```

**Effect**: After the second line runs, the glass effect read from `chip.effect` has a `tintColor` of `'#34C759'`. That the glass turns green on screen is **not verified in the simulator**.

`chip.effect === glass` is `false`: what is read back is a copy. You cannot use `===` to tell whether an effect view uses a particular glass effect; see [`effect`](../api/ui-visual-effect-view/effect.md).

## Combining several pieces of glass into a group

Hand a glass container effect to an effect view, then put several pieces of glass into its `contentView`.

```js
const group = new UIGlassContainerEffect();
group.spacing = 16;
const groupView = new UIVisualEffectView(group);
groupView.frame = new CGRect(40, 420, 300, 60);
page.view.addSubview(groupView);

for (let i = 0; i < 2; i++) {
  const piece = new UIVisualEffectView(UIGlassEffect.effectWithStyle('regular'));
  piece.frame = new CGRect(i * 70, 8, 60, 44);
  groupView.contentView.addSubview(piece);
}
```

**Effect**: The two pieces of glass are 10 pt apart, less than the `spacing` of 16 pt, so they merge together. **Not verified in the simulator.**

## Adding rounded corners

An effect view does not clip by default. For rounded corners, also turn on `clipsToBounds`.

```js
panel.layer.cornerRadius = 16;
panel.clipsToBounds = true;
```

**Effect**: The panel's four corners become rounded with a 16 pt radius, and the blurred area becomes rounded along with them. **Not verified in the simulator.**

## Removing the effect

```js
panel.effect = null;
```

**Effect**: `panel.effect` reads as `null`. `contentView` and its content are unchanged. That the panel no longer blurs what is behind it is **not verified in the simulator**.

## See also

- [`UIVisualEffectView`](../api/ui-visual-effect-view.md): the effect view, effect objects, and copies
- [`UIBlurEffect`](../api/ui-blur-effect.md), [`UIVibrancyEffect`](../api/ui-vibrancy-effect.md), [`UIGlassEffect`](../api/ui-glass-effect.md), [`UIGlassContainerEffect`](../api/ui-glass-container-effect.md): the four kinds of effect
- [`CALayer`](../api/ca-layer.md): `layer.cornerRadius`
- [Traits](../api/ui-trait-collection.md): light and dark mode, which most blur styles follow
