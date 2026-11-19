---
type: reference
native: UIColor.magentaColor
---

# `UIColor.magentaColor` static property

The **`UIColor.magentaColor`** static property is a fixed color: `rgb(255, 0, 255)`, magenta. Its value doesn't change between Light Mode and Dark Mode.

You don't need it in everyday code: write the string `'magenta'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.magentaColor === UIColor.magentaColor` is `true`.
- Assigning it to a color property has the same effect as writing `'magenta'`. It reads back as the string `'magenta'`, not a `UIColor` object. Reading back `'magenta'` after writing it to a color property goes through the same code as the other color names and is **not individually verified in the simulator**.
- The value comes from Apple's definition, converted to 0–255 and rounded.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.magentaColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `magenta`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.magentaColor`. In Swift the name is `UIColor.magenta`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
