---
type: reference
native: UIColor.systemBackgroundColor
---

# `UIColor.systemBackgroundColor` static property

The **`UIColor.systemBackgroundColor`** static property is a semantic color: the page background. White in Light Mode and black in Dark Mode (from Apple's definition). Semantic colors are named by purpose; their values are determined by the system and change with Light Mode, Dark Mode, and the Increase Contrast setting.

You don't need it in everyday code: write the string `'systemBackground'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.systemBackgroundColor === UIColor.systemBackgroundColor` is `true`.
- Assigning it to a color property has the same effect as writing `'systemBackground'`. It reads back as the string `'systemBackground'`, not a `UIColor` object. Reading back `'systemBackground'` exactly after writing it to a color property has been verified in the acceptance tests.
- The value is determined by the system.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.systemBackgroundColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `systemBackground`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.systemBackgroundColor`. In Swift the name is `UIColor.systemBackground`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
