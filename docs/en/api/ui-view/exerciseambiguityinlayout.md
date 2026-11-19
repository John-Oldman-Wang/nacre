---
type: reference
native: "-[UIView exerciseAmbiguityInLayout]"
---

# `UIView`: `exerciseAmbiguityInLayout()` method

The **`exerciseAmbiguityInLayout()`** method switches the view once between its possible results, so you can see by eye where constraints are insufficient.

## Syntax

```
exerciseAmbiguityInLayout()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Examples

```js
const card = new UIView();
if (card.hasAmbiguousLayout) {
  card.exerciseAmbiguityInLayout();
}
```

**Effect**: When constraints are insufficient, the view jumps to another position or size that also satisfies the constraints. **The effect is not verified in the simulator.**

## Corresponding iOS API

`-[UIView exerciseAmbiguityInLayout]`.

## See also

- [`hasAmbiguousLayout`](hasambiguouslayout.md)
