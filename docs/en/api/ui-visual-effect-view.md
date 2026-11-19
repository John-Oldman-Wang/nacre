---
type: reference
native: UIVisualEffectView
status: partial
---

# `UIVisualEffectView`

**`UIVisualEffectView`** represents an area with an effect. It processes the content **behind** it in some way, such as blurring it, and then displays the processed result. Translucent panels, toolbars floating over content, and glass-like button backgrounds are all built with it. The rest of this page calls it an effect view.

The effect view itself doesn't decide which processing to apply; the **effect** object you give it does. An effect object doesn't display anything; it only becomes visible once you give it to an effect view. There are four kinds of effects, and their superclass is [`UIVisualEffect`](ui-visual-effect.md):

| Class | What it does | How to get one |
| --- | --- | --- |
| [`UIBlurEffect`](ui-blur-effect.md) | Blur: blurs the content behind it and lays a translucent color over it | `UIBlurEffect.effectWithStyle(style)` |
| [`UIVibrancyEffect`](ui-vibrancy-effect.md) | Vibrancy: makes text and icons placed over a blur take on the colors of the content underneath | `UIVibrancyEffect.effectForBlurEffect(blur, { style })` |
| [`UIGlassEffect`](ui-glass-effect.md) | Glass: the new material in iOS 26 | `UIGlassEffect.effectWithStyle(style)` |
| [`UIGlassContainerEffect`](ui-glass-container-effect.md) | Glass container: draws several pieces of glass together as a group | `new UIGlassContainerEffect()` |

Add content to the effect view's [`contentView`](ui-visual-effect-view/contentview.md); adding it directly to the effect view throws `TypeError`. The effect view doesn't clip by default; for rounded corners, set `layer.cornerRadius` and turn on `clipsToBounds`.

An effect view is a [view](ui-view.md): position, size, corner radius, and hiding all work the same way as for views.

The on-screen effects described on this page and its member pages (how blurry it looks, what the glass looks like) are all **not verified in the simulator**. The default values of each member, whether an effect reads back as the same object, and the rejection of subviews added directly were verified by testing with native code in the simulator.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIVisualEffectView`

For how to make a blurred panel, make text more vibrant, and use glass, see the guide [Creating blur and glass effects](../guides/blur-and-glass.md).

## Constructor

[`UIVisualEffectView()`](ui-visual-effect-view/constructor.md)

Creates an effect view, optionally with an effect.

## Instance properties

It also inherits the properties of [`UIView`](ui-view.md). The inherited properties commonly used on effect views are `frame`, `layer`, and `clipsToBounds`.

| Property | Description |
| --- | --- |
| [`effect`](ui-visual-effect-view/effect.md) | Which effect to display. `null` means no effect |
| [`contentView`](ui-visual-effect-view/contentview.md) <small>read-only</small> | The view that holds the content; its size follows the effect view |

## Instance methods

It inherits the methods of [`UIView`](ui-view.md). Of these, `addSubview()` and `insertSubview()` throw `TypeError` when called on an effect view; call them on `contentView` instead. See [`contentView`](ui-visual-effect-view/contentview.md).

## The effect processes what's behind it

An effect view doesn't change the content added to its `contentView`. It changes the part of the screen that comes before it in the view hierarchy and is covered by it. So the effect view must be placed **above** the content to be processed: a view added later is on top.

## Effect objects and copies

The four effects fall into two groups when it comes to "does it read back as the same object":

| | Blur, vibrancy | Glass, glass container |
| --- | --- | --- |
| Has writable properties | No | Yes |
| Read back after assigning to `effect` | The object you assigned | A copy, not the object you assigned |
| Reading `effect` twice in a row | The same object | Two different objects |
| Changing the original object after assigning | Not applicable | The effect view doesn't change |
| Changing the object read back | Not applicable | The effect view doesn't change |

So you can't use `===` to check whether an effect view is using a particular glass effect. To change a glass property, change the object you hold and assign it to `effect` again.

Factory methods return a new object on every call. Calling `UIBlurEffect.effectWithStyle('dark')` twice gives two objects that aren't equal.

## Examples

Starting from a blank app, add four colored stripes, then cover them with a blurred panel that has a line of text on it.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  ['systemRed', 'systemOrange', 'systemGreen', 'systemBlue'].forEach((color, i) => {
    const stripe = new UIView();
    stripe.frame = new CGRect(40 + i * 70, 200, 70, 200);
    stripe.backgroundColor = color;
    page.view.addSubview(stripe);
  });

  const blur = UIBlurEffect.effectWithStyle('systemMaterial');
  const panel = new UIVisualEffectView(blur);
  panel.frame = new CGRect(60, 260, 240, 80);
  page.view.addSubview(panel);

  const label = new UILabel();
  label.text = 'Frosted glass';
  label.textAlignment = 'center';
  label.frame = new CGRect(0, 0, 240, 80);
  panel.contentView.addSubview(label);
});
```

**Effect**

- The screen shows four vertical stripes: red, orange, green, and blue.
- A 240 × 80 pt panel covers the middle of the stripes. Within the panel, the stripes are blurred and their edges are indistinct.
- The words "Frosted glass" appear in the center of the panel, and the text itself is sharp.

This code hasn't been run in the simulator.

For more patterns, see the guide [Creating blur and glass effects](../guides/blur-and-glass.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UIVisualEffectView alloc] initWithEffect:blur]` | `new UIVisualEffectView(blur)` |
| `view.effect = nil` | `view.effect = null` |
| `[view.contentView addSubview:label]` | `view.contentView.addSubview(label)` |

## See also

- [Creating blur and glass effects](../guides/blur-and-glass.md): why you might not see the effect, vibrant text, glass, rounded corners
- [`UIBlurEffect`](ui-blur-effect.md), [`UIVibrancyEffect`](ui-vibrancy-effect.md), [`UIGlassEffect`](ui-glass-effect.md), [`UIGlassContainerEffect`](ui-glass-container-effect.md): the four effects
- [`UIView`](ui-view.md): superclass; position, size, hierarchy
- [`CALayer`](ca-layer.md): `layer.cornerRadius`, for rounded corners
