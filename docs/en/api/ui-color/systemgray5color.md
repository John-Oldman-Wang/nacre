---
type: reference
native: UIColor.systemGray5Color
---

# `UIColor.systemGray5Color` static property

The **`UIColor.systemGray5Color`** static property is the level-5 gray among the system colors. From `systemGray2` to `systemGray6` the grays get closer to the background: lighter and lighter in Light Mode, darker and darker in Dark Mode.

You don't need it in everyday code: write the string `'systemGray5'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.systemGray5Color === UIColor.systemGray5Color` is `true`.
- Assigning it to a color property has the same effect as writing `'systemGray5'`. It reads back as the string `'systemGray5'`, not a `UIColor` object (verified by testing).
- The exact value has not been measured.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.systemGray5Color;
console.log(box.backgroundColor);
```

**Result**: The console prints `systemGray5`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.systemGray5Color`. In Swift the name is `UIColor.systemGray5`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
