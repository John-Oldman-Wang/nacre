---
type: reference
native: UIColor.systemGray6Color
---

# `UIColor.systemGray6Color` static property

The **`UIColor.systemGray6Color`** static property is the level-6 gray among the system colors. From `systemGray2` to `systemGray6` the grays get closer to the background: lighter and lighter in Light Mode, darker and darker in Dark Mode.

You don't need it in everyday code: write the string `'systemGray6'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.systemGray6Color === UIColor.systemGray6Color` is `true`.
- Assigning it to a color property has the same effect as writing `'systemGray6'`. It reads back as the string `'systemGray6'`, not a `UIColor` object (verified by testing).
- The exact value has not been measured.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.systemGray6Color;
console.log(box.backgroundColor);
```

**Result**: The console prints `systemGray6`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.systemGray6Color`. In Swift the name is `UIColor.systemGray6`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
