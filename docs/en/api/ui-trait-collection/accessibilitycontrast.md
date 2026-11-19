---
type: reference
native: UITraitCollection.accessibilityContrast
---

# `UITraitCollection`: `accessibilityContrast` property

The **`accessibilityContrast`** property indicates whether the user turned on Increase Contrast in Settings.

## Value

A string:

| Value | Meaning |
| --- | --- |
| `'normal'` | Not turned on |
| `'high'` | Increase Contrast is on |
| `'unspecified'` | Not specified |

- Only the default value `'normal'` has been read; other values are **not verified in the simulator**. Whether `traitchange` fires when it changes is **not verified in the simulator**.
- Semantic colors and `asset()` colors switch values automatically under Increase Contrast, so colors don't need to read it. See [`UIColor`](../ui-color.md).

- Read-only. Assigning to it throws `TypeError`.
- It holds the value at the moment `traitCollection` was read and doesn't change afterwards. When the environment changes, views, view controllers, and scenes fire [`traitchange`](../ui-trait-collection.md#the-traitchange-event); read `traitCollection` again for the new value.

## Examples

```js
const view = new UIView();
console.log(view.traitCollection.accessibilityContrast);
```

**Result**: prints `normal` when Increase Contrast is off.

## Corresponding iOS API

`UITraitCollection.accessibilityContrast`.

## See also

- [`UITraitCollection`](../ui-trait-collection.md)
