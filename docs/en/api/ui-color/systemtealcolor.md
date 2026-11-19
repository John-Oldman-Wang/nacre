---
type: reference
native: UIColor.systemTealColor
---

# `UIColor.systemTealColor` static property

The **`UIColor.systemTealColor`** static property is the teal among the system colors. System colors are a set of colors commonly used in iOS interfaces; their values are determined by the system and differ slightly between Light Mode and Dark Mode.

You don't need it in everyday code: write the string `'systemTeal'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.systemTealColor === UIColor.systemTealColor` is `true`.
- Assigning it to a color property has the same effect as writing `'systemTeal'`. It reads back as the string `'systemTeal'`, not a `UIColor` object. Reading back `'systemTeal'` exactly after writing it to a color property has been verified in the acceptance tests.
- The exact value is not documented.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.systemTealColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `systemTeal`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.systemTealColor`. In Swift the name is `UIColor.systemTeal`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
