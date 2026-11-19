---
type: reference
native: "+[UIGlassEffect effectWithStyle:]"
---

# `UIGlassEffect.effectWithStyle()` static method

The **`UIGlassEffect.effectWithStyle()`** static method makes a glass effect with the given style.

## Syntax

```
UIGlassEffect.effectWithStyle(style)
```

### Parameters

**`style`**

The style of the glass, a string:

| `style` | Effect |
| --- | --- |
| `'regular'` | Standard glass |
| `'clear'` | Clear glass |

How the two styles actually look is **not verified in the simulator**.

### Return value

A new `UIGlassEffect`. [`isInteractive`](isinteractive.md) is `false` and [`tintColor`](tintcolor.md) is `null`. Each call returns a new object.

### Exceptions

**`TypeError`**

`style` is not one of the two values above: `style has no value "frosted"; expected one of: regular / clear`

## Examples

```js
const glass = UIGlassEffect.effectWithStyle('regular');
const chip = new UIVisualEffectView(glass);
chip.frame = new CGRect(60, 360, 120, 44);
```

**Effect**: gives a 120 × 44 pt piece of glass. **Not verified in the simulator.**

## Corresponding iOS API

`+[UIGlassEffect effectWithStyle:]`. `UIGlassEffectStyleRegular` is written `'regular'`.

## See also

- [`isInteractive`](isinteractive.md), [`tintColor`](tintcolor.md): set them before handing the effect to an effect view
