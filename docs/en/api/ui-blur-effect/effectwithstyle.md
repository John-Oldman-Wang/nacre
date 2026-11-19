---
type: reference
native: "+[UIBlurEffect effectWithStyle:]"
---

# `UIBlurEffect.effectWithStyle()` static method

The **`UIBlurEffect.effectWithStyle()`** static method creates a blur effect with a given style.

## Syntax

```
UIBlurEffect.effectWithStyle(style)
```

### Parameters

**`style`**

The blur style, a string. There are three groups. **How each style actually looks is not verified in the simulator**; the descriptions below come from Apple's headers and the style names.

| `style` | Effect |
| --- | --- |
| `'systemUltraThinMaterial'` | Material, thinnest: lets the most of what is behind show through. Follows [light and dark mode](../ui-trait-collection.md) |
| `'systemThinMaterial'` | Material, thinner. Follows light and dark mode |
| `'systemMaterial'` | Material, standard thickness. Follows light and dark mode |
| `'systemThickMaterial'` | Material, thicker: lets the least of what is behind show through. Follows light and dark mode |
| `'systemChromeMaterial'` | Material; "chrome" in the name refers to interface frames such as toolbars. Follows light and dark mode |
| The five above with a `Light` suffix, such as `'systemMaterialLight'` | The same material, fixed to its light-mode look; doesn't follow light and dark mode |
| The five above with a `Dark` suffix, such as `'systemMaterialDark'` | The same material, fixed to its dark-mode look |
| `'regular'` | Same as `'light'` in light mode, same as `'dark'` in dark mode |
| `'prominent'` | Same as `'extraLight'` in light mode, same as `'dark'` in dark mode |
| `'extraLight'` | Blurs and covers with a very bright color. Doesn't follow light and dark mode |
| `'light'` | Blurs and covers with a bright color. Doesn't follow light and dark mode |
| `'dark'` | Blurs and covers with a dark color. Doesn't follow light and dark mode |

### Return value

A new `UIBlurEffect`. Every call returns a new object: calling twice with the same style gives two unequal objects.

### Exceptions

**`TypeError`**

`style` isn't in the table above. The error message lists all accepted values, in the form `style has no value "frosted"; expected one of: extraLight / light / dark / …`.

## Examples

```js
const blur = UIBlurEffect.effectWithStyle('systemMaterial');
const panel = new UIVisualEffectView(blur);
console.log(panel.effect === blur);
```

**Result**: It prints `true`. After the blur effect is given to the effect view, it reads back as the same object.

## Corresponding iOS API

`+[UIBlurEffect effectWithStyle:]`. `UIBlurEffectStyleSystemMaterial` is written `'systemMaterial'`, and the rest likewise. tvOS's `UIBlurEffectStyleExtraDark` isn't available on iOS and isn't provided.

## See also

- [`UIVisualEffectView()`](../ui-visual-effect-view/constructor.md)
- [`UIVibrancyEffect.effectForBlurEffect()`](../ui-vibrancy-effect/effectforblureffect.md): builds a vibrancy effect to match this blur
