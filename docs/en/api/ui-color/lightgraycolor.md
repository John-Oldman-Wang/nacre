---
type: reference
native: UIColor.lightGrayColor
---

# `UIColor.lightGrayColor` static property

The **`UIColor.lightGrayColor`** static property is a fixed color: `rgb(170, 170, 170)`, light gray. Its value doesn't change between Light Mode and Dark Mode.

You don't need it in everyday code: write the string `'lightGray'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.lightGrayColor === UIColor.lightGrayColor` is `true`.
- Assigning it to a color property has the same effect as writing `'lightGray'`. It reads back as the string `'lightGray'`, not a `UIColor` object. Reading back `'lightGray'` after writing it to a color property goes through the same code as the other color names and is **not individually verified in the simulator**.
- The value comes from Apple's definition, converted to 0–255 and rounded. This value differs from CSS `lightgray` (`#d3d3d3`).

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.lightGrayColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `lightGray`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.lightGrayColor`. In Swift the name is `UIColor.lightGray`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
