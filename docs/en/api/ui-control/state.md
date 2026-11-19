---
type: reference
native: UIControl.state
---

# `UIControl`: `state` property

The **`state`** property is all of the control's current [states](../ui-control.md#states), combined from [`isEnabled`](isenabled.md), [`isSelected`](isselected.md), and [`isHighlighted`](ishighlighted.md).

## Value

An array of state names. The state names are the following strings:

| State name | When it is in the array |
| --- | --- |
| `'normal'` | None of the four below holds. The array then contains only this item |
| `'highlighted'` | `isHighlighted` is `true` |
| `'disabled'` | `isEnabled` is `false` |
| `'selected'` | `isSelected` is `true` |
| `'focused'` | The control has focus. **When it gains focus is not verified in the simulator** |

- Read-only; assigning to it throws `TypeError`.
- Defaults to `['normal']`.
- When several states hold at once, the array has several items. Their order is not guaranteed; check for a state with `includes()`, not by index.

### Observing changes

No event fires when it changes; for why, see [States](../ui-control.md#states). To change the state, write `isEnabled`, `isSelected`, or `isHighlighted`.

## Examples

```js
const card = new UIControl();
console.log(card.state.join(', '));

card.isSelected = true;
card.isEnabled = false;
console.log(card.state.includes('disabled'), card.state.includes('selected'));
```

**Result**: prints `normal` first, then `true true`.

## Corresponding iOS API

`UIControl.state`. Natively it is a bitmask; `state & UIControlStateSelected` is written `state.includes('selected')`.

## See also

- [States](../ui-control.md#states)
- [`UIButton.setTitle()`](../ui-button/settitle.md): sets text per state; `forState` uses the same set of state names
