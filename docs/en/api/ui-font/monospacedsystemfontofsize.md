---
type: reference
native: "+[UIFont monospacedSystemFontOfSize:weight:]"
---

# `UIFont.monospacedSystemFontOfSize()` static method

The **`UIFont.monospacedSystemFontOfSize()`** static method returns the system monospaced font at the given size. In a monospaced font every character takes the same width, which suits code and text that must line up in columns.

## Syntax

```
UIFont.monospacedSystemFontOfSize(size, [{ weight }])
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

The native method requires a weight. Here `weight` can be omitted and defaults to `'regular'`.

## Examples

```js
const label = new UILabel();
label.text = '0123456789';
label.font = UIFont.monospacedSystemFontOfSize(20, { weight: 'medium' });
console.log(label.font.fontName);
```

**Effect**

- Each of the ten digits takes the same width.
- The console logs the name of this monospaced font. This documentation does not record the specific name.

## Corresponding iOS API

`+[UIFont monospacedSystemFontOfSize:weight:]`. Weight constants drop the prefix and lowercase the first letter: `UIFontWeightSemibold` is written `'semibold'`.

## See also

- [Weights](../ui-font.md#weights)
- [Setting fonts](../../guides/fonts.md)
