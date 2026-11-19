---
type: reference
native: UIGlassContainerEffect
status: partial
---

# `UIGlassContainerEffect`

**`UIGlassContainerEffect`** represents a glass container effect (iOS 26): it draws several pieces of glass as a group, and pieces that are close enough merge together.

To use it, give it to an [effect view](ui-visual-effect-view.md), then put several effect views that use [`UIGlassEffect`](ui-glass-effect.md) into that effect view's `contentView`.

As with the glass effect, the effect view stores a copy taken at the moment of assignment: changing `spacing` after handing it over doesn't change the effect view; you need to assign it again.

**Inheritance**: `EventTarget` → `NSObject` → [`UIVisualEffect`](ui-visual-effect.md) → `UIGlassContainerEffect`

## Constructor

[`UIGlassContainerEffect()`](ui-glass-container-effect/constructor.md)

Creates a glass container effect with `spacing` of 0.

## Instance properties

| Property | Description |
| --- | --- |
| [`spacing`](ui-glass-container-effect/spacing.md) | How close two pieces of glass must be to start merging, in pt |

## Examples

```js
const group = new UIGlassContainerEffect();
group.spacing = 16;
const groupView = new UIVisualEffectView(group);
groupView.frame = new CGRect(40, 420, 300, 60);

for (let i = 0; i < 2; i++) {
  const piece = new UIVisualEffectView(UIGlassEffect.effectWithStyle('regular'));
  piece.frame = new CGRect(i * 70, 8, 60, 44);
  groupView.contentView.addSubview(piece);
}
```

**Effect**: two 60 × 44 pt pieces of glass are 10 pt apart, less than the `spacing` of 16 pt, so they merge together. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UIGlassContainerEffect alloc] init]` | `new UIGlassContainerEffect()` |
| `container.spacing = 16` | `container.spacing = 16` |

## See also

- [`UIGlassEffect`](ui-glass-effect.md)
- [Making blur and glass effects](../guides/blur-and-glass.md#combining-several-pieces-of-glass-into-a-group)
