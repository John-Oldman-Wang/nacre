---
type: reference
native: UITraitCollection.layoutDirection
---

# `UITraitCollection`: `layoutDirection` property

The **`layoutDirection`** property is the writing direction of text.

## Value

A string:

| Value | Meaning |
| --- | --- |
| `'leftToRight'` | Left to right. Chinese and English use this |
| `'rightToLeft'` | Right to left. Arabic and Hebrew use this |
| `'unspecified'` | Not specified |

- Only the default value `'leftToRight'` has been read; other values are **not verified in the simulator**. Whether `traitchange` fires when it changes is **not verified in the simulator**.

- Read-only. Assigning to it throws `TypeError`.
- It holds the value at the moment `traitCollection` was read and doesn't change afterwards. When the environment changes, views, view controllers, and scenes fire [`traitchange`](../ui-trait-collection.md#the-traitchange-event); read `traitCollection` again for the new value.

## Examples

```js
const view = new UIView();
console.log(view.traitCollection.layoutDirection);
```

**Result**: prints `leftToRight` when the system language is Chinese.

## Corresponding iOS API

`UITraitCollection.layoutDirection`.

## See also

- [`UITraitCollection`](../ui-trait-collection.md)
