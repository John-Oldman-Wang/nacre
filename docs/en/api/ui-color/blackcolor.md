---
type: reference
native: UIColor.blackColor
---

# `UIColor.blackColor` static property

The **`UIColor.blackColor`** static property is a fixed color: `rgb(0, 0, 0)`, black. Its value doesn't change between Light Mode and Dark Mode.

You don't need it in everyday code: write the string `'black'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.blackColor === UIColor.blackColor` is `true`.
- Assigning it to a color property has the same effect as writing `'black'`. It reads back as the string `'black'`, not a `UIColor` object. Reading back `'black'` exactly after writing it to a color property has been verified in the acceptance tests.
- The value comes from Apple's definition, converted to 0–255 and rounded.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.blackColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `black`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.blackColor`. In Swift the name is `UIColor.black`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
