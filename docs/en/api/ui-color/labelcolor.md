---
type: reference
native: UIColor.labelColor
---

# `UIColor.labelColor` static property

The **`UIColor.labelColor`** static property is a semantic color: the color of body text. Black (`#000000`) in Light Mode and white (`#ffffff`) in Dark Mode; both values were measured. Semantic colors are named by purpose; their values are determined by the system and change with Light Mode, Dark Mode, and the Increase Contrast setting.

You don't need it in everyday code: write the string `'label'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.labelColor === UIColor.labelColor` is `true`.
- Assigning it to a color property has the same effect as writing `'label'`. It reads back as the string `'label'`, not a `UIColor` object. Reading back `'label'` exactly after writing it to a color property has been verified in the acceptance tests.
- The value is determined by the system.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.labelColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `label`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.labelColor`. In Swift the name is `UIColor.label`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
