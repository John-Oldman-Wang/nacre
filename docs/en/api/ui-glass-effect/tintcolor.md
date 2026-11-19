---
type: reference
native: UIGlassEffect.tintColor
---

# `UIGlassEffect`: `tintColor` property

The **`tintColor`** property is the color the glass is tinted with.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable. Writes accept a color string or a `UIColor` object; reads return a string.
- Defaults to `null`: no tint.
- Changing it doesn't affect views already using this effect. The effect view stores a copy taken at the moment of assignment; after the change, assign it to [`effect`](../ui-visual-effect-view/effect.md) again.
- How the tint looks on screen is **not verified in the simulator**.

### Observing changes

No event fires when it changes. Only the App's own code changes it, so no notification is needed.

### Invalid values

Writing an invalid color: no exception is thrown; a warning is logged to the console and `tintColor` keeps its previous value. All color properties behave this way; see [Colors](../ui-color.md).

## Examples

```js
const glass = UIGlassEffect.effectWithStyle('clear');
glass.tintColor = 'rgba(255, 45, 85, 0.35)';
const chip = new UIVisualEffectView(glass);
```

**Effect**: the glass has a pink tint. **Not verified in the simulator.**

## Corresponding iOS API

`UIGlassEffect.tintColor`. Natively it is a `UIColor`; here you write a color string.

## See also

- [`isInteractive`](isinteractive.md)
- [Colors](../ui-color.md): how to write color strings
