---
type: reference
native: UIVisualEffect
status: partial
---

# `UIVisualEffect`

**`UIVisualEffect`** represents a visual effect. It is the common superclass of four effects: [`UIBlurEffect`](ui-blur-effect.md) (blur), [`UIVibrancyEffect`](ui-vibrancy-effect.md) (vibrancy), [`UIGlassEffect`](ui-glass-effect.md) (glass), and [`UIGlassContainerEffect`](ui-glass-container-effect.md) (glass container).

An effect object displays nothing by itself; it becomes visible only when given to a [`UIVisualEffectView`](ui-visual-effect-view.md). `UIVisualEffect` has no members; its purpose is to serve as a type: the effect view's [`effect`](ui-visual-effect-view/effect.md) property accepts any kind of effect.

**Inheritance**: `EventTarget` → `NSObject` → `UIVisualEffect`

## Constructor

Can't be created with `new`. Create effects with the factory methods or constructors of the four subclasses:

| Class | How to get one |
| --- | --- |
| `UIBlurEffect` | [`UIBlurEffect.effectWithStyle()`](ui-blur-effect/effectwithstyle.md) |
| `UIVibrancyEffect` | [`UIVibrancyEffect.effectForBlurEffect()`](ui-vibrancy-effect/effectforblureffect.md) |
| `UIGlassEffect` | [`UIGlassEffect.effectWithStyle()`](ui-glass-effect/effectwithstyle.md) |
| `UIGlassContainerEffect` | [`new UIGlassContainerEffect()`](ui-glass-container-effect/constructor.md) |

## Examples

```js
/** @param {UIVisualEffectView} view */
function describe(view) {
  const effect = view.effect;
  if (effect === null) return 'no effect';
  if (effect instanceof UIBlurEffect) return 'blur';
  if (effect instanceof UIGlassEffect) return 'glass';
  return 'another effect';
}
console.log(describe(new UIVisualEffectView(UIBlurEffect.effectWithStyle('dark'))));
```

**Result**: Prints `blur`. **Checking the kind of effect with `instanceof` is not verified in the simulator.**

## Corresponding iOS API

`UIVisualEffect`.

## See also

- [`UIVisualEffectView`](ui-visual-effect-view.md): the view that displays an effect
