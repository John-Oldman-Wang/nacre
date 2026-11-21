---
type: reference
native: UIColor.tertiarySystemFillColor
---

# `UIColor.tertiarySystemFillColor` static property

The **`UIColor.tertiarySystemFillColor`** static property is a semantic color: a fill color for large shapes, such as input fields, search fields, and buttons. Translucent. Semantic colors are named by purpose; their values are determined by the system and change with Light Mode, Dark Mode, and the Increase Contrast setting.

You don't need it in everyday code: write the string `'tertiarySystemFill'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.tertiarySystemFillColor === UIColor.tertiarySystemFillColor` is `true`.
- Assigning it to a color property has the same effect as writing `'tertiarySystemFill'`. It reads back as the string `'tertiarySystemFill'`, not a `UIColor` object (verified by testing).
- The exact value has not been measured.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.tertiarySystemFillColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `tertiarySystemFill`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.tertiarySystemFillColor`. In Swift the name is `UIColor.tertiarySystemFill`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
