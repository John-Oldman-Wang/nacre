---
type: reference
native: UITextView.writingToolsActive
---

# `UITextView`: `isWritingToolsActive` property

The **`isWritingToolsActive`** property indicates whether the system's Writing Tools is currently processing the text in this text view.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | Writing Tools is working |
| `false` | Not working |

- Read-only; assigning to it throws `TypeError`.
- The acceptance tests verify that it can be read and is a boolean. When it becomes `true` is **not verified in the simulator**.
- There is no change event.

## Examples

```js
const input = new UITextView();
console.log(input.isWritingToolsActive);
```

**Result**: logs `false`. **Not verified in the simulator.**

## Corresponding iOS API

`UITextView.writingToolsActive` (the getter is `isWritingToolsActive`).

## See also

- [`writingToolsBehavior`](writingtoolsbehavior.md)
