---
type: reference
native: UIVisualEffectView.effect
---

# `UIVisualEffectView`: `effect` property

The **`effect`** property is the effect that the effect view displays.

## Value

An effect object, or `null`. The effect object is one of [`UIBlurEffect`](../ui-blur-effect.md), [`UIVibrancyEffect`](../ui-vibrancy-effect.md), [`UIGlassEffect`](../ui-glass-effect.md), and [`UIGlassContainerEffect`](../ui-glass-container-effect.md).

- Readable and writable.
- The default is the effect given to the constructor, or `null` if none was given.
- `null` means no effect: the effect view is just a container holding `contentView`. Setting it to `null` leaves `contentView` and its content unchanged. That the panel stops processing what's behind it is **not verified in the simulator**.
- Changing the effect leaves `contentView` and its content unchanged.

Whether it reads back as the object you assigned depends on the kind of effect:

| | Blur, vibrancy | Glass, glass container |
| --- | --- | --- |
| Read back after assigning | The object you assigned | A copy, not the object you assigned |
| Reading twice in a row | The same object | Two different objects |
| Changing the original object after assigning | Not applicable; they have no writable properties | The effect view doesn't change |
| Changing the object read back | Not applicable | The effect view doesn't change |

So you can't use `===` to check whether an effect view is using a particular glass effect. To change a glass property, change the object you hold and assign it to `effect` again.

### Observing changes

No event fires when it changes. Only the app's own code changes it, so no notification is needed.

### Invalid values

- Writing a native object that isn't an effect: throws `TypeError: effect needs a UIVisualEffect or null`.
- Writing a string or a number: throws `TypeError: effect needs a native object or null, got "systemMaterial"`.
- After a rejected write, `effect` keeps its previous value.

## Examples

### Switching to another blur

```js
const panel = new UIVisualEffectView(UIBlurEffect.effectWithStyle('systemMaterial'));
panel.effect = UIBlurEffect.effectWithStyle('systemThinMaterialDark');
```

**Effect**: The panel switches to a thinner blur that is always dark. The content in `contentView` stays. **Not verified in the simulator.**

### Glass reads back as a copy

```js
const glass = UIGlassEffect.effectWithStyle('regular');
const chip = new UIVisualEffectView(glass);
console.log(chip.effect === glass);

glass.tintColor = '#34C759';
chip.effect = glass;
const current = chip.effect;
if (current instanceof UIGlassEffect) {
  console.log(current.tintColor);
}
```

**Result**: Prints `false` first, then `#34C759`. Only after `glass` is changed and assigned again does the effect view use the new color. That the glass turns green on screen is **not verified in the simulator**.

## Corresponding iOS API

`UIVisualEffectView.effect`. `view.effect = nil` is written as `view.effect = null`.

## See also

- [`UIGlassEffect`](../ui-glass-effect.md)
- [Creating blur and glass effects](../../guides/blur-and-glass.md)
