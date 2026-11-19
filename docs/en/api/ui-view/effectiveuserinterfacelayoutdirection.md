---
type: reference
native: UIView.effectiveUserInterfaceLayoutDirection
---

# `UIView`: `effectiveUserInterfaceLayoutDirection` property

The **`effectiveUserInterfaceLayoutDirection`** property is the writing direction this view actually uses: the result of the system language and [`semanticContentAttribute`](semanticcontentattribute.md) together.

## Value

A string:

| Value | Meaning |
| --- | --- |
| `'leftToRight'` | Left to right |
| `'rightToLeft'` | Right to left |

- Read-only; assigning to it throws `TypeError`.
- The type it reads back as is checked in the acceptance tests.
- No change notification.

## Examples

```js
const view = new UIView();
console.log(view.effectiveUserInterfaceLayoutDirection);
```

**Result**: Prints `leftToRight` when the system language is English or Chinese. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.effectiveUserInterfaceLayoutDirection`.

## See also

- [`semanticContentAttribute`](semanticcontentattribute.md)
