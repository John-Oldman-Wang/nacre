---
type: reference
native: UIColor.yellowColor
---

# `UIColor.yellowColor` static property

The **`UIColor.yellowColor`** static property is a fixed color: `rgb(255, 255, 0)`, yellow. Its value doesn't change between Light Mode and Dark Mode.

You don't need it in everyday code: write the string `'yellow'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.yellowColor === UIColor.yellowColor` is `true`.
- Assigning it to a color property has the same effect as writing `'yellow'`. It reads back as the string `'yellow'`, not a `UIColor` object. Reading back `'yellow'` after writing it to a color property goes through the same code as the other color names and is **not individually verified in the simulator**.
- The value comes from Apple's definition, converted to 0–255 and rounded.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.yellowColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `yellow`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.yellowColor`. In Swift the name is `UIColor.yellow`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
