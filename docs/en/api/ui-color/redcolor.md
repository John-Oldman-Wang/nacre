---
type: reference
native: UIColor.redColor
---

# `UIColor.redColor` static property

The **`UIColor.redColor`** static property is a fixed color: `rgb(255, 0, 0)`, red. Its value doesn't change between Light Mode and Dark Mode.

You don't need it in everyday code: write the string `'red'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.redColor === UIColor.redColor` is `true`.
- Assigning it to a color property has the same effect as writing `'red'`. It reads back as the string `'red'`, not a `UIColor` object. Reading back `'red'` after writing it to a color property goes through the same code as the other color names and is **not individually verified in the simulator**.
- The value comes from Apple's definition, converted to 0–255 and rounded.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.redColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `red`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.redColor`. In Swift the name is `UIColor.red`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
