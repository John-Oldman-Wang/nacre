---
type: reference
native: UIColor.systemYellowColor
---

# `UIColor.systemYellowColor` static property

The **`UIColor.systemYellowColor`** static property is the yellow among the system colors. System colors are a set of colors commonly used in iOS interfaces; their values are determined by the system and differ slightly between Light Mode and Dark Mode.

You don't need it in everyday code: write the string `'systemYellow'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.systemYellowColor === UIColor.systemYellowColor` is `true`.
- Assigning it to a color property has the same effect as writing `'systemYellow'`. It reads back as the string `'systemYellow'`, not a `UIColor` object. Reading back `'systemYellow'` exactly after writing it to a color property has been verified in the acceptance tests.
- The exact value is not documented.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.systemYellowColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `systemYellow`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.systemYellowColor`. In Swift the name is `UIColor.systemYellow`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
