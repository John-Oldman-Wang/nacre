---
type: reference
native: UIControl.selected
---

# `UIControl`: `isSelected` property

The **`isSelected`** property indicates whether the control is in the `selected` [state](../ui-control.md#states). Its meaning is up to the app, for example "following" or "favorited".

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The control enters the `selected` state. [`state`](state.md) contains `'selected'`. A button switches to the text and colors set for the `selected` state |
| `false` | The control leaves the `selected` state |

- Readable and writable.
- Defaults to `false`.
- The system never changes it automatically. For a control that toggles on each tap, change it yourself in the tap callback.
- Writes are converted by JS truthiness.

### Observing changes

No event fires when it changes. Only the app's code changes it, so no notification is needed.

## Examples

```js
const card = new UIControl();
card.backgroundColor = 'systemGreen';
card.addEventListener('touchupinside', () => {
  card.isSelected = !card.isSelected;
  card.backgroundColor = card.isSelected ? 'systemGray' : 'systemGreen';
});
```

**Effect**: One tap turns the background gray; another tap turns it back to green. **Not verified in the simulator.**

## Corresponding iOS API

`UIControl.selected`; its getter is `isSelected`.

## See also

- [`state`](state.md)
- [`UIButton`](../ui-button.md): set text per state to make a "Follow / Following" button
