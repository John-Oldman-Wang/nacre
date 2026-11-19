---
type: reference
native: UIGlassEffect.interactive
---

# `UIGlassEffect`: `isInteractive` property

The **`isInteractive`** property determines whether the glass reacts when a finger presses on it.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The glass reacts when a finger presses on it |
| `false` | Pressing on it has no reaction |

- Readable and writable.
- Defaults to `false`.
- How the two values look on screen is **not verified in the simulator**.
- Changing it doesn't affect views already using this effect. The effect view stores a copy taken at the moment of assignment; after the change, assign it to [`effect`](../ui-visual-effect-view/effect.md) again.

### Observing changes

No event fires when it changes. Only the App's own code changes it, so no notification is needed.

## Examples

```js
const glass = UIGlassEffect.effectWithStyle('clear');
glass.isInteractive = true;
const chip = new UIVisualEffectView(glass);
```

**Effect**: the glass reacts when a finger presses on `chip`. **Not verified in the simulator.**

## Corresponding iOS API

`UIGlassEffect.interactive`; its getter is `isInteractive`.

## See also

- [`tintColor`](tintcolor.md)
