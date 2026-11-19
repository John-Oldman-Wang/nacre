---
type: reference
native: CAAnimation.removedOnCompletion
---

# `CAAnimation`: `removedOnCompletion` property

The **`removedOnCompletion`** property determines whether the animation is removed from the layer when it finishes.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Removed from the layer when it finishes. The displayed value returns to the property value |
| `false` | Stays on the layer when it finishes. Together with [`fillMode`](fillmode.md) set to `'forwards'`, the end value continues to be displayed |

- Readable and writable.
- The default is `true`.
- Converted with `Boolean()` on write; never fails.

When set to `false`, the property value and what is displayed disagree; changing the property afterward does not change what is shown until this animation is removed, and at the moment of removal the display jumps back to the property value. To keep a layer at the end, the recommended approach is to keep `true` and set the property value to the end value too; see [Keeping a layer at the end](../../guides/animation.md#keeping-the-layer-at-the-end-value).

## Examples

```js
const fade = CABasicAnimation.animationWithKeyPath('opacity');
console.log(fade.removedOnCompletion);
fade.removedOnCompletion = false;
console.log(fade.removedOnCompletion);
```

**Result**: Prints `true` first, then `false`.

## Corresponding iOS API

`CAAnimation.removedOnCompletion`.

## See also

- [Property values and displayed values](../ca-animation.md#property-values-and-displayed-values)
