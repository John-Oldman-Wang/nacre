---
type: reference
native: "+[UIFont monospacedDigitSystemFontOfSize:weight:]"
---

# `UIFont.monospacedDigitSystemFontOfSize()` static method

The **`UIFont.monospacedDigitSystemFontOfSize()`** static method returns the system font at the given size in which only the digits have equal width; letters look the same as in the ordinary system font.

## Syntax

```
UIFont.monospacedDigitSystemFontOfSize(size, [{ weight }])
```

### Parameters

**`size`**

The font size, a number in [pt](../units.md).

**`options.weight`**

Optional. A [weight](../ui-font.md#weights) name, one of these nine, from thinnest to heaviest: `'ultraLight'`, `'thin'`, `'light'`, `'regular'`, `'medium'`, `'semibold'`, `'bold'`, `'heavy'`, `'black'`. Defaults to `'regular'`.

### Return value

A `UIFont`; never `null`.

### Exceptions

**`TypeError`**

`weight` is not one of the nine names, for example:

```
TypeError: weight has no value "extrabold"; expected one of: ultraLight / thin / light / regular / medium / semibold / bold / heavy / black
```

## Description

Numbers such as timers, countdowns, and prices change constantly. In the ordinary system font, digits have different widths, so when a number changes, the width of the whole line changes with it (**not verified in the simulator**). A font from this method avoids that jumping.

The native method requires a weight. Here `weight` can be omitted and defaults to `'regular'`.

## Examples

```js
const label = new UILabel();
label.text = '00:59';
label.font = UIFont.monospacedDigitSystemFontOfSize(17, { weight: 'regular' });
label.text = '01:11';
```

**Effect**: the text looks the same as in the ordinary system font. When `text` changes from `'00:59'` to `'01:11'`, the total width of the text stays the same. **Not verified in the simulator.**

## Corresponding iOS API

`+[UIFont monospacedDigitSystemFontOfSize:weight:]`. Weight constants drop the prefix and lowercase the first letter: `UIFontWeightSemibold` is written `'semibold'`.

## See also

- [Weights](../ui-font.md#weights)
- [Setting fonts](../../guides/fonts.md)
