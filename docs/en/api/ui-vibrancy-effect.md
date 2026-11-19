---
type: reference
native: UIVibrancyEffect
status: partial
---

# `UIVibrancyEffect`

**`UIVibrancyEffect`** represents a vibrancy effect: it makes text and icons placed over a blur pick up the colors of the content underneath, instead of being a flat layer of gray.

A vibrancy effect is built from a [blur effect](ui-blur-effect.md) and used on **another** [visual effect view](ui-visual-effect-view.md): that effect view goes into the blur panel's `contentView`, and text and icons go into its own `contentView`.

A vibrancy effect is immutable and has no properties. Once created, you can't read back which style it is.

**Inheritance**: `EventTarget` → `NSObject` → [`UIVisualEffect`](ui-visual-effect.md) → `UIVibrancyEffect`

## Constructor

It can't be created with `new`; use the static method below.

## Static methods

[`UIVibrancyEffect.effectForBlurEffect()`](ui-vibrancy-effect/effectforblureffect.md)

Creates a vibrancy effect from a blur effect. Choose `style` according to whether the content is text, filled shapes, or separators.

## Examples

```js
const blur = UIBlurEffect.effectWithStyle('systemMaterial');
const panel = new UIVisualEffectView(blur);
const vivid = new UIVisualEffectView(
  UIVibrancyEffect.effectForBlurEffect(blur, { style: 'label' }));
panel.contentView.addSubview(vivid);
```

**Effect**: Text placed in `vivid.contentView` picks up the colors of the content behind the panel. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UIVibrancyEffect effectForBlurEffect:blur]` | `UIVibrancyEffect.effectForBlurEffect(blur)` |
| `[UIVibrancyEffect effectForBlurEffect:blur style:UIVibrancyEffectStyleLabel]` | `UIVibrancyEffect.effectForBlurEffect(blur, { style: 'label' })` |

## See also

- [Blur and glass effects](../guides/blur-and-glass.md#making-text-on-the-panel-more-vivid)
- [`UIBlurEffect`](ui-blur-effect.md)
