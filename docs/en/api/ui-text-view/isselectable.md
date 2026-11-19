---
type: reference
native: UITextView.selectable
---

# `UITextView`: `isSelectable` property

The **`isSelectable`** property indicates whether the user can select text.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The user can select text |
| `false` | Text can't be selected |

- Readable and writable.
- The default value is `true`.
- It is linked with [`isEditable`](iseditable.md) (measured):

| Written | The other property |
| --- | --- |
| `isSelectable = false` | `isEditable` also becomes `false` |
| `isSelectable = true` | `isEditable` is unchanged; it doesn't turn back to `true` on its own |
| `isEditable = true` | `isSelectable` also becomes `true` |
| `isEditable = false` | `isSelectable` is unchanged |

So for "selectable but not editable", write only `isEditable = false`.

- Values of other types are converted to a boolean by truthiness: `0` is `false`, `'false'` is `true`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.isSelectable = false;
console.log(input.isEditable);
```

**Result**: logs `false`.

## Corresponding iOS API

`UITextView.selectable` (the getter is `isSelectable`).

## See also

- [`isEditable`](iseditable.md)
