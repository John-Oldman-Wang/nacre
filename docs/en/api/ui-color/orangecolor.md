---
type: reference
native: UIColor.orangeColor
---

# `UIColor.orangeColor` static property

The **`UIColor.orangeColor`** static property is a fixed color: `rgb(255, 128, 0)`, orange. Its value doesn't change between Light Mode and Dark Mode.

You don't need it in everyday code: write the string `'orange'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.orangeColor === UIColor.orangeColor` is `true`.
- Assigning it to a color property has the same effect as writing `'orange'`. It reads back as the string `'orange'`, not a `UIColor` object. Reading back `'orange'` after writing it to a color property goes through the same code as the other color names and is **not individually verified in the simulator**.
- The value comes from Apple's definition, converted to 0–255 and rounded. This value differs from CSS `orange` (`#ffa500`).

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.orangeColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `orange`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.orangeColor`. In Swift the name is `UIColor.orange`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
