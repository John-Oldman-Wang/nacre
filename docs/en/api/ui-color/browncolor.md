---
type: reference
native: UIColor.brownColor
---

# `UIColor.brownColor` static property

The **`UIColor.brownColor`** static property is a fixed color: `rgb(153, 102, 51)`, brown. Its value doesn't change between Light Mode and Dark Mode.

You don't need it in everyday code: write the string `'brown'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.brownColor === UIColor.brownColor` is `true`.
- Assigning it to a color property has the same effect as writing `'brown'`. It reads back as the string `'brown'`, not a `UIColor` object. Reading back `'brown'` after writing it to a color property goes through the same code as the other color names and is **not individually verified in the simulator**.
- The value comes from Apple's definition, converted to 0–255 and rounded. This value differs from CSS `brown` (`#a52a2a`).

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.brownColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `brown`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.brownColor`. In Swift the name is `UIColor.brown`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
