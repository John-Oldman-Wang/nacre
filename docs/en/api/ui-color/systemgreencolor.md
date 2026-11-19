---
type: reference
native: UIColor.systemGreenColor
---

# `UIColor.systemGreenColor` static property

The **`UIColor.systemGreenColor`** static property is the green among the system colors. System colors are a set of colors commonly used in iOS interfaces; their values are determined by the system and differ slightly between Light Mode and Dark Mode.

You don't need it in everyday code: write the string `'systemGreen'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.systemGreenColor === UIColor.systemGreenColor` is `true`.
- Assigning it to a color property has the same effect as writing `'systemGreen'`. It reads back as the string `'systemGreen'`, not a `UIColor` object. Reading back `'systemGreen'` after writing it to a color property goes through the same code as the other color names and is **not individually verified in the simulator**.
- The exact value is not documented.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.systemGreenColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `systemGreen`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.systemGreenColor`. In Swift the name is `UIColor.systemGreen`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
