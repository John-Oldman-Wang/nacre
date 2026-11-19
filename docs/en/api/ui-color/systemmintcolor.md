---
type: reference
native: UIColor.systemMintColor
---

# `UIColor.systemMintColor` static property

The **`UIColor.systemMintColor`** static property is the mint among the system colors. System colors are a set of colors commonly used in iOS interfaces; their values are determined by the system and differ slightly between Light Mode and Dark Mode.

You don't need it in everyday code: write the string `'systemMint'` directly to a color property for the same effect.

## Value

`UIColor`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it always returns the same object: `UIColor.systemMintColor === UIColor.systemMintColor` is `true`.
- Assigning it to a color property has the same effect as writing `'systemMint'`. It reads back as the string `'systemMint'`, not a `UIColor` object. Reading back `'systemMint'` after writing it to a color property goes through the same code as the other color names and is **not individually verified in the simulator**.
- The exact value is not documented.

## Examples

```js
const box = new UIView();
box.backgroundColor = UIColor.systemMintColor;
console.log(box.backgroundColor);
```

**Result**: The console prints `systemMint`. The on-screen color is **not verified in the simulator**.

## Corresponding iOS API

`UIColor.systemMintColor`. In Swift the name is `UIColor.systemMint`, which matches the color name string here.

## See also

- [Color names you can use](../ui-color.md#color-names-you-can-use)
- [When you need a `UIColor` object](../ui-color.md#when-you-need-a-uicolor-object)
