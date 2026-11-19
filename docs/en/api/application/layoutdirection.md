---
type: reference
native: UIApplication.userInterfaceLayoutDirection
---

# `Application`: `layoutDirection` property

The **`layoutDirection`** property is the writing direction of the UI, determined by the system language.

## Value

A string:

| Value | Meaning |
| --- | --- |
| `'ltr'` | Left to right |
| `'rtl'` | Right to left (Arabic, Hebrew) |

- Read-only. Assigning to it throws `TypeError`.
- No change event: iOS doesn't provide a corresponding notification.

## Examples

```js
console.log(application.layoutDirection);
```

**Result**: prints `ltr` when the system language is written left to right.

## Corresponding iOS API

`UIApplication.userInterfaceLayoutDirection`. `UIUserInterfaceLayoutDirectionLeftToRight` is written as `'ltr'`.

## See also

- [Traits](../ui-trait-collection.md): a view's own `layoutDirection`
