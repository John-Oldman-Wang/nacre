---
type: reference
native: UITraitCollection.verticalSizeClass
---

# `UITraitCollection`: `verticalSizeClass` property

The **`verticalSizeClass`** property indicates whether there's ample space vertically.

## Value

A string:

| Value | Meaning |
| --- | --- |
| `'compact'` | Space is compact in this direction |
| `'regular'` | Space is ample in this direction |
| `'unspecified'` | Not specified |

- On iPhone in portrait, horizontal is `'compact'` and vertical is `'regular'`.
- Only the default value has been read; other values are **not verified in the simulator**. Whether `traitchange` fires when it changes is **not verified in the simulator**.

- Read-only. Assigning to it throws `TypeError`.
- It holds the value at the moment `traitCollection` was read and doesn't change afterwards. When the environment changes, views, view controllers, and scenes fire [`traitchange`](../ui-trait-collection.md#the-traitchange-event); read `traitCollection` again for the new value.

## Examples

```js
const view = new UIView();
console.log(view.traitCollection.verticalSizeClass);
```

**Result**: prints `regular` on iPhone in portrait.

## Corresponding iOS API

`UITraitCollection.verticalSizeClass`.

## See also

- [`UITraitCollection`](../ui-trait-collection.md)
- [`horizontalSizeClass`](horizontalsizeclass.md)
