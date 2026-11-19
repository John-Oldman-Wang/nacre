---
type: reference
native: UIColor.tertiarySystemBackgroundColor
---

# `UIColor.tertiarySystemBackgroundColor` static property

The **`UIColor.tertiarySystemBackgroundColor`** static property is a semantic color: the background for content placed on the second layer. Semantic colors are named by purpose; their values are determined by the system and change with Light Mode, Dark Mode, and the Increase Contrast setting.

You don't need it in everyday code: write the string `'tertiarySystemBackground'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.tertiarySystemBackgroundColor === UIColor.tertiarySystemBackgroundColor` is `true`.
- Assigning it to a color property has the same effect as writing `'tertiarySystemBackground'`. It reads back as the string `'tertiarySystemBackground'`, not a `UIColor` object. Reading back `'tertiarySystemBackground'` after writing it to a color property goes through the same code as the other color names and is **not individually verified in the simulator**.
- The exact value has not been measured.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.tertiarySystemBackgroundColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `tertiarySystemBackground`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.tertiarySystemBackgroundColor`. In Swift the name is `UIColor.tertiarySystemBackground`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
