---
type: reference
native: "-[UIVisualEffectView initWithEffect:]"
---

# `UIVisualEffectView()` constructor

The **`UIVisualEffectView()`** constructor creates an effect view that displays the given effect.

## Syntax

```
new UIVisualEffectView()
new UIVisualEffectView(effect)
```

### Parameters

**`effect`**

Optional. An effect object, one of [`UIBlurEffect`](../ui-blur-effect.md), [`UIVibrancyEffect`](../ui-vibrancy-effect.md), [`UIGlassEffect`](../ui-glass-effect.md), and [`UIGlassContainerEffect`](../ui-glass-container-effect.md), or `null`. When it's omitted or `null`, [`effect`](effect.md) is `null` and can be set later.

### Return value

A new `UIVisualEffectView`. Its size is 0 × 0 pt; give it a `frame` yourself or position it with [Auto Layout](../auto-layout.md).

On a new effect view, the defaults of a few properties inherited from [`UIView`](../ui-view.md) are:

| Property | Default | Description |
| --- | --- | --- |
| `backgroundColor` | `null` | No need to set it. The effect determines the background color |
| `clipsToBounds` | `false` | Change it to `true` for rounded corners |
| `isUserInteractionEnabled` | `true` | Both the effect view and `contentView` receive touches by default |

### Exceptions

**`TypeError`**

- The argument is neither an effect object nor `null`: `UIVisualEffectView needs a UIVisualEffect or null`. Passing a style name as a string (`new UIVisualEffectView('systemMaterial')`) gives the same error; create the effect object with a factory method first.
- If you subclass it with `class X extends UIVisualEffectView {}` and then call `new X()`; see [Native classes](../native-classes.md).

## Examples

```js
const blur = UIBlurEffect.effectWithStyle('systemMaterial');
const panel = new UIVisualEffectView(blur);
panel.frame = new CGRect(60, 260, 240, 80);

const empty = new UIVisualEffectView();
console.log(empty.effect);
```

**Effect**: `panel` is a 240 × 80 pt blurred panel. The console prints `null`.

## Corresponding iOS API

`-[UIVisualEffectView initWithEffect:]`.

## See also

- [`effect`](effect.md)
- [`contentView`](contentview.md): add content here
