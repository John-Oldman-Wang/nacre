---
type: reference
native: UIColor.tertiarySystemGroupedBackgroundColor
---

# `UIColor.tertiarySystemGroupedBackgroundColor` static property

The **`UIColor.tertiarySystemGroupedBackgroundColor`** static property is a semantic color: the background for content placed one more layer inside a group. Semantic colors are named by purpose; their values are determined by the system and change with Light Mode, Dark Mode, and the Increase Contrast setting.

You don't need it in everyday code: write the string `'tertiarySystemGroupedBackground'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.tertiarySystemGroupedBackgroundColor === UIColor.tertiarySystemGroupedBackgroundColor` is `true`.
- Assigning it to a color property has the same effect as writing `'tertiarySystemGroupedBackground'`. It reads back as the string `'tertiarySystemGroupedBackground'`, not a `UIColor` object (verified by testing).
- The exact value has not been measured.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.tertiarySystemGroupedBackgroundColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `tertiarySystemGroupedBackground`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.tertiarySystemGroupedBackgroundColor`. In Swift the name is `UIColor.tertiarySystemGroupedBackground`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
