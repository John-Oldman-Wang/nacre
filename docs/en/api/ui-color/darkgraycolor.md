---
type: reference
native: UIColor.darkGrayColor
---

# `UIColor.darkGrayColor` static property

The **`UIColor.darkGrayColor`** static property is a fixed color: `rgb(85, 85, 85)`, dark gray. Its value doesn't change between Light Mode and Dark Mode.

You don't need it in everyday code: write the string `'darkGray'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.darkGrayColor === UIColor.darkGrayColor` is `true`.
- Assigning it to a color property has the same effect as writing `'darkGray'`. It reads back as the string `'darkGray'`, not a `UIColor` object. Reading back `'darkGray'` after writing it to a color property goes through the same code as the other color names and is **not individually verified in the simulator**.
- The value comes from Apple's definition, converted to 0–255 and rounded. This value differs from CSS `darkgray` (`#a9a9a9`).

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.darkGrayColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `darkGray`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.darkGrayColor`. In Swift the name is `UIColor.darkGray`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
