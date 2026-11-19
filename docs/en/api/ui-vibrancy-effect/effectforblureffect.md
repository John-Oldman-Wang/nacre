---
type: reference
native: "+[UIVibrancyEffect effectForBlurEffect:style:]"
---

# `UIVibrancyEffect.effectForBlurEffect()` static method

The **`UIVibrancyEffect.effectForBlurEffect()`** static method creates a vibrancy effect from a blur effect.

## Syntax

```
UIVibrancyEffect.effectForBlurEffect(blurEffect)
UIVibrancyEffect.effectForBlurEffect(blurEffect, { style })
```

### Parameters

**`blurEffect`**

Required. The [`UIBlurEffect`](../ui-blur-effect.md) used by the blur underneath. The vibrancy effect is matched to it.

**`options.style`**

Optional; choose it according to what the content is. Give a `style` when pairing with a `system…Material` blur; without one you get the older kind of vibrancy effect, which doesn't distinguish content types. **How each style actually looks is not verified in the simulator**; the descriptions come from Apple's header files.

| `style` | Content it's for |
| --- | --- |
| `'label'` | Text, the most prominent level. It keeps the content's own color |
| `'secondaryLabel'` | Text, the second level |
| `'tertiaryLabel'` | Text, the third level |
| `'quaternaryLabel'` | Text, the faintest level |
| `'fill'` | Filled shapes, the most prominent level |
| `'secondaryFill'` | Filled shapes, the second level |
| `'tertiaryFill'` | Filled shapes, the faintest level |
| `'separator'` | Separators |

Every style other than `'label'` uses only the content's opacity; the content's own color is ignored.

### Return value

A new `UIVibrancyEffect`. Every call returns a new object.

### Exceptions

**`TypeError`**

- `blurEffect` isn't a `UIBlurEffect` (missing, `null`, another effect, a style name string): `effectForBlurEffect needs a UIBlurEffect`
- `style` isn't in the table above: the error message lists all available values.

## Examples

```js
const blur = UIBlurEffect.effectWithStyle('systemMaterial');
const panel = new UIVisualEffectView(blur);
const vivid = new UIVisualEffectView(
  UIVibrancyEffect.effectForBlurEffect(blur, { style: 'label' }));
panel.contentView.addSubview(vivid);

const label = new UILabel();
label.text = 'Vibrant text';
vivid.contentView.addSubview(label);
```

**Effect**: The text picks up the colors of the content behind the panel. **Not verified in the simulator.**

The vibrancy effect goes on **another** effect view, which is placed in the blur panel's `contentView`; the text then goes into that view's `contentView`.

## Corresponding iOS API

`+[UIVibrancyEffect effectForBlurEffect:]` and `+[UIVibrancyEffect effectForBlurEffect:style:]`, combined into one method with `style` in the options.

## See also

- [`UIBlurEffect.effectWithStyle()`](../ui-blur-effect/effectwithstyle.md)
- [Blur and glass effects](../../guides/blur-and-glass.md#making-text-on-the-panel-more-vivid)
