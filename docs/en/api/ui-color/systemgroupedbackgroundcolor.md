---
type: reference
native: UIColor.systemGroupedBackgroundColor
---

# `UIColor.systemGroupedBackgroundColor` static property

The **`UIColor.systemGroupedBackgroundColor`** static property is a semantic color: the page background in a grouped style: one background for the page with groups placed on it, like the system Settings app. Semantic colors are named by purpose; their values are determined by the system and change with Light Mode, Dark Mode, and the Increase Contrast setting.

You don't need it in everyday code: write the string `'systemGroupedBackground'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.systemGroupedBackgroundColor === UIColor.systemGroupedBackgroundColor` is `true`.
- Assigning it to a color property has the same effect as writing `'systemGroupedBackground'`. It reads back as the string `'systemGroupedBackground'`, not a `UIColor` object (verified by testing).
- The exact value has not been measured.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.systemGroupedBackgroundColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `systemGroupedBackground`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.systemGroupedBackgroundColor`. In Swift the name is `UIColor.systemGroupedBackground`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
