---
type: reference
native: UIColor.systemOrangeColor
---

# `UIColor.systemOrangeColor` static property

The **`UIColor.systemOrangeColor`** static property is the orange among the system colors. System colors are a set of colors commonly used in iOS interfaces; their values are determined by the system and differ slightly between Light Mode and Dark Mode.

You don't need it in everyday code: write the string `'systemOrange'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.systemOrangeColor === UIColor.systemOrangeColor` is `true`.
- Assigning it to a color property has the same effect as writing `'systemOrange'`. It reads back as the string `'systemOrange'`, not a `UIColor` object. Reading back `'systemOrange'` after writing it to a color property goes through the same code as the other color names and is **not individually verified in the simulator**.
- The exact value is not documented.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.systemOrangeColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `systemOrange`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.systemOrangeColor`. In Swift the name is `UIColor.systemOrange`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
