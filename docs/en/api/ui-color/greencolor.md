---
type: reference
native: UIColor.greenColor
---

# `UIColor.greenColor` static property

The **`UIColor.greenColor`** static property is a fixed color: `rgb(0, 255, 0)`, green. Its value doesn't change between Light Mode and Dark Mode.

You don't need it in everyday code: write the string `'green'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.greenColor === UIColor.greenColor` is `true`.
- Assigning it to a color property has the same effect as writing `'green'`. It reads back as the string `'green'`, not a `UIColor` object. Reading back `'green'` after writing it to a color property goes through the same code as the other color names and is **not individually verified in the simulator**.
- The value comes from Apple's definition, converted to 0–255 and rounded. This value differs from CSS `green` (`#008000`), and equals CSS `lime`.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.greenColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `green`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.greenColor`. In Swift the name is `UIColor.green`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
