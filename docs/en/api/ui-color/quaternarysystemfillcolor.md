---
type: reference
native: UIColor.quaternarySystemFillColor
---

# `UIColor.quaternarySystemFillColor` static property

The **`UIColor.quaternarySystemFillColor`** static property is a semantic color: a fill color for large areas that contain complex content. Translucent. Semantic colors are named by purpose; their values are determined by the system and change with Light Mode, Dark Mode, and the Increase Contrast setting.

You don't need it in everyday code: write the string `'quaternarySystemFill'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.quaternarySystemFillColor === UIColor.quaternarySystemFillColor` is `true`.
- Assigning it to a color property has the same effect as writing `'quaternarySystemFill'`. It reads back as the string `'quaternarySystemFill'`, not a `UIColor` object (verified by testing).
- The exact value has not been measured.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.quaternarySystemFillColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `quaternarySystemFill`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.quaternarySystemFillColor`. In Swift the name is `UIColor.quaternarySystemFill`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
