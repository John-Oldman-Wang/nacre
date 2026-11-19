---
type: reference
native: UIColor.secondarySystemBackgroundColor
---

# `UIColor.secondarySystemBackgroundColor` static property

The **`UIColor.secondarySystemBackgroundColor`** static property is a semantic color: the background for a layer of content placed on the page background. Semantic colors are named by purpose; their values are determined by the system and change with Light Mode, Dark Mode, and the Increase Contrast setting.

You don't need it in everyday code: write the string `'secondarySystemBackground'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.secondarySystemBackgroundColor === UIColor.secondarySystemBackgroundColor` is `true`.
- Assigning it to a color property has the same effect as writing `'secondarySystemBackground'`. It reads back as the string `'secondarySystemBackground'`, not a `UIColor` object. Reading back `'secondarySystemBackground'` after writing it to a color property goes through the same code as the other color names and is **not individually verified in the simulator**.
- The exact value has not been measured.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.secondarySystemBackgroundColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `secondarySystemBackground`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.secondarySystemBackgroundColor`. In Swift the name is `UIColor.secondarySystemBackground`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
