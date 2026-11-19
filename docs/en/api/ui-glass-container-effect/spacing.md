---
type: reference
native: UIGlassContainerEffect.spacing
---

# `UIGlassContainerEffect`: `spacing` property

The **`spacing`** property is how close two pieces of glass must be before they start merging together.

## Value

A number, in [pt](../units.md).

- Readable and writable.
- Defaults to `0`.
- Two pieces of glass start merging when they are closer than this value. How the merge looks is **not verified in the simulator**.
- Changing it doesn't affect views already using this effect. The effect view stores a copy taken at the moment of assignment; after the change, assign it to [`effect`](../ui-visual-effect-view/effect.md) again.

### Observing changes

No event fires when it changes. Only the App's own code changes it, so no notification is needed.

### Invalid values

- A negative number: throws `TypeError: spacing must be a non-negative number`.
- A value that can't be converted to a number: throws `TypeError: spacing must be a finite number, got "wide"`.
- On error, the property keeps its previous value.

## Examples

```js
const group = new UIGlassContainerEffect();
group.spacing = 16;
console.log(group.spacing);
```

**Result**: logs `16`.

## Corresponding iOS API

`UIGlassContainerEffect.spacing`.

## See also

- [`UIGlassContainerEffect()`](constructor.md)
