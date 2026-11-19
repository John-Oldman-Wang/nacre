---
type: reference
native: UIStackView.axis
---

# `UIStackView`: `axis` property

The **`axis`** property determines the direction of arrangement. This direction is called the main axis, and the perpendicular direction is called the cross axis; see [Main axis and cross axis](../ui-stack-view.md#main-axis-and-cross-axis).

## Value

A string, one of:

| Value | Effect |
| --- | --- |
| `'horizontal'` | A row, left to right |
| `'vertical'` | A column, top to bottom |

- Readable and writable.
- The default is `'horizontal'`. So a vertical arrangement must write `axis = 'vertical'`.
- After writing, the arrangement updates at the next layout pass. To read the arranged subviews' new `frame` immediately, call `layoutIfNeeded()` first.
- No change notification. Only the app's own code can change it.

### Invalid values

Writing a value not in the table does not throw. The console prints a warning `[Nacre] axis has no value "diagonal"; expected one of: horizontal / vertical, ignored`, and `axis` keeps its previous value.

## Examples

```js
const list = new UIStackView();
list.axis = 'vertical';

for (const text of ['First line', 'Second line', 'Third line']) {
  const label = new UILabel();
  label.text = text;
  list.addArrangedSubview(label);
}
```

**Effect**: The three lines of text are arranged top to bottom, each as wide as the stack view, with no gap between lines.

## Corresponding iOS API

`UIStackView.axis`. `UILayoutConstraintAxisVertical` is written `'vertical'`, and `UILayoutConstraintAxisHorizontal` is written `'horizontal'`.

## See also

- [`distribution`](distribution.md): how space on the main axis is divided
- [`alignment`](alignment.md): how items are aligned on the cross axis
- [Enums](../enums.md): why an invalid property value is a warning instead of an exception
