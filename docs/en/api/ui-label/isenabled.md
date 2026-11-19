---
type: reference
native: UILabel.enabled
---

# `UILabel`: `isEnabled` property

The **`isEnabled`** property determines whether the label is drawn as enabled.

## Value

A boolean.

- Readable and writable.
- The default is `true`.
- `true`: the text is drawn normally.
- `false`: the text is dimmed, indicating the item is currently unavailable. **Not verified in the simulator.**
- It only changes appearance and does not affect touch.

## Examples

```js
const label = new UILabel();
label.text = 'Unavailable';
label.isEnabled = false;
```

**Effect**: The text is dimmed. Setting it back to `true` restores it. **Not verified in the simulator.**

## Corresponding iOS API

`UILabel.enabled` (the getter is `isEnabled`).

## See also

- [`isHighlighted`](ishighlighted.md)
