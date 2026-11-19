---
type: reference
native: UIGlassEffect
status: partial
---

# `UIGlassEffect`

**`UIGlassEffect`** represents a glass effect, a new material in iOS 26. Given to an [effect view](ui-visual-effect-view.md), it renders that area as glass, which can be tinted and can respond to touches.

**The effect view stores a copy taken at the moment of assignment.** Changing this object after handing it to an effect view doesn't change the effect view; you need to assign it again. What you read back from the effect view is also a copy, not the object you wrote. So set the properties first, then hand it to the effect view.

To draw several pieces of glass as a group that merge when close enough, use [`UIGlassContainerEffect`](ui-glass-container-effect.md).

**Inheritance**: `EventTarget` → `NSObject` → [`UIVisualEffect`](ui-visual-effect.md) → `UIGlassEffect`

For how to use glass, see the guide [Making blur and glass effects](../guides/blur-and-glass.md#using-glass).

## Constructor

Can't be created with `new`; use the static method below.

## Static methods

[`UIGlassEffect.effectWithStyle()`](ui-glass-effect/effectwithstyle.md)

Makes a glass effect with the style `'regular'` or `'clear'`.

## Instance properties

| Property | Description |
| --- | --- |
| [`isInteractive`](ui-glass-effect/isinteractive.md) | Whether the glass reacts when a finger presses on it |
| [`tintColor`](ui-glass-effect/tintcolor.md) | The color the glass is tinted with |

## Examples

```js
const glass = UIGlassEffect.effectWithStyle('clear');
glass.tintColor = 'rgba(255, 45, 85, 0.35)';
glass.isInteractive = true;
const chip = new UIVisualEffectView(glass);
chip.frame = new CGRect(60, 360, 120, 44);
```

**Effect**: a 120 × 44 pt piece of clear glass with a pink tint that reacts when a finger presses on it. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UIGlassEffect effectWithStyle:UIGlassEffectStyleRegular]` | `UIGlassEffect.effectWithStyle('regular')` |
| `glass.interactive = YES` | `glass.isInteractive = true` |
| `glass.tintColor = color` | `glass.tintColor = '#FF2D55'` |

## See also

- [`UIVisualEffectView`](ui-visual-effect-view.md): [`effect`](ui-visual-effect-view/effect.md) reads back a copy
- [`UIGlassContainerEffect`](ui-glass-container-effect.md): groups several pieces of glass together
- [Colors](ui-color.md): how to write `tintColor`
