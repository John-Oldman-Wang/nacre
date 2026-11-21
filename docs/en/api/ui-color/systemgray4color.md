---
type: reference
native: UIColor.systemGray4Color
---

# `UIColor.systemGray4Color` static property

The **`UIColor.systemGray4Color`** static property is the level-4 gray among the system colors. From `systemGray2` to `systemGray6` the grays get closer to the background: lighter and lighter in Light Mode, darker and darker in Dark Mode.

You don't need it in everyday code: write the string `'systemGray4'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.systemGray4Color === UIColor.systemGray4Color` is `true`.
- Assigning it to a color property has the same effect as writing `'systemGray4'`. It reads back as the string `'systemGray4'`, not a `UIColor` object (verified by testing).
- The exact value has not been measured.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.systemGray4Color;
console.log(box.backgroundColor);
```

**Result**: The console prints `systemGray4`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.systemGray4Color`. In Swift the name is `UIColor.systemGray4`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
