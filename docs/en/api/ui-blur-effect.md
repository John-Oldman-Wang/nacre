---
type: reference
native: UIBlurEffect
status: partial
---

# `UIBlurEffect`

**`UIBlurEffect`** represents a blur effect: it blurs what is behind a [visual effect view](ui-visual-effect-view.md) and covers it with a translucent layer of color. The blur style is fixed at creation.

A blur effect is immutable and has no properties; the same object can be given to multiple effect views. Once created, you can't read back which style it is.

**Inheritance**: `EventTarget` → `NSObject` → [`UIVisualEffect`](ui-visual-effect.md) → `UIBlurEffect`

For how to use it to make a blurred panel, see the guide [Creating blur and glass effects](../guides/blur-and-glass.md).

## Constructor

It can't be created with `new`: `new UIBlurEffect()` throws `TypeError: Illegal constructor: UIBlurEffect is not created with new; use UIBlurEffect.effectWithStyle(style)`. Use the static method below.

## Static methods

[`UIBlurEffect.effectWithStyle()`](ui-blur-effect/effectwithstyle.md)

Creates a blur effect with a given style. Most interfaces use the `'systemMaterial'` group, which follows light and dark mode.

## Examples

```js
const blur = UIBlurEffect.effectWithStyle('systemMaterial');
const panel = new UIVisualEffectView(blur);
const toolbar = new UIVisualEffectView(blur);
```

**Effect**: `panel` and `toolbar` share the same blur effect, and both show a standard-thickness blur. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UIBlurEffect effectWithStyle:UIBlurEffectStyleSystemMaterial]` | `UIBlurEffect.effectWithStyle('systemMaterial')` |

## See also

- [`UIVisualEffectView`](ui-visual-effect-view.md): displays the effect
- [`UIVibrancyEffect`](ui-vibrancy-effect.md): a vibrancy effect built to match a blur effect
- [Traits](ui-trait-collection.md): light and dark mode, which most blur styles follow
