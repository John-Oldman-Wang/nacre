---
type: reference
native: "+[UIFont systemFontOfSize:weight:]"
---

# `UIFont.systemFontOfSize()` static method

The **`UIFont.systemFontOfSize()`** static method returns the system font at the given size, with an optional weight. The system font is the font the iOS interface uses by default.

## Syntax

```
UIFont.systemFontOfSize(size, [{ weight }])
```

### Parameters

**`size`**

The font size, a number in [pt](../units.md).

**`options.weight`**

Optional. A [weight](../ui-font.md#weights) name, one of these nine, from thinnest to heaviest: `'ultraLight'`, `'thin'`, `'light'`, `'regular'`, `'medium'`, `'semibold'`, `'bold'`, `'heavy'`, `'black'`. Defaults to `'regular'`.

### Return value

A `UIFont`; never `null`. When both size and weight are the same, the same object is returned each time.

### Exceptions

**`TypeError`**

`weight` is not one of the nine names, for example:

```
TypeError: weight has no value "extrabold"; expected one of: ultraLight / thin / light / regular / medium / semibold / bold / heavy / black
```

## Description

The same arguments give the same object: `UIFont.systemFontOfSize(17) === UIFont.systemFontOfSize(17)` is `true`.

## Examples

```js
const regular = UIFont.systemFontOfSize(17);
const heavy = UIFont.systemFontOfSize(28, { weight: 'heavy' });
console.log(regular.fontName, heavy.pointSize);
```

**Result**: the console logs `.SFUI-Regular 28`.

## Corresponding iOS API

`+[UIFont systemFontOfSize:weight:]`. Weight constants drop the prefix and lowercase the first letter: `UIFontWeightSemibold` is written `'semibold'`.

## See also

- [Weights](../ui-font.md#weights)
- [Setting fonts](../../guides/fonts.md)
