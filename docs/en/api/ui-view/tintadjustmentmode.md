---
type: reference
native: UIView.tintAdjustmentMode
---

# `UIView`: `tintAdjustmentMode` property

The **`tintAdjustmentMode`** property determines whether [`tintColor`](tintcolor.md) is shown normally or dimmed. The system uses it to dim the interface behind an alert.

## Value

A string, one of the following three:

| Value | Effect |
| --- | --- |
| `'automatic'` | Follows the superview |
| `'normal'` | The tint color is shown normally |
| `'dimmed'` | The tint color is dimmed to gray |

- Readable and writable. Writing `'dimmed'` reads back `'dimmed'` (verified by testing).
- The default is **not verified in the simulator**; according to Apple's documentation it is `'automatic'`.
- The on-screen effect of each value is **not verified in the simulator**.

### Invalid values

Writing a value not in the table doesn't throw. A warning is logged, `[Nacre] tintAdjustmentMode has no value "x"; expected one of: automatic / normal / dimmed, ignored`, and the property keeps its previous value.

## Examples

```js
const view = new UIView();
view.tintAdjustmentMode = 'dimmed';
console.log(view.tintAdjustmentMode);
```

**Effect**: The tint color of this view and its subviews is dimmed (**not verified in the simulator**). Logs `dimmed`.

## Corresponding iOS API

`UIView.tintAdjustmentMode`. `UIViewTintAdjustmentModeDimmed` is written `'dimmed'`.

## See also

- [`tintColor`](tintcolor.md)
