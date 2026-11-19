---
type: reference
native: "+[UIFont italicSystemFontOfSize:]"
---

# `UIFont.italicSystemFontOfSize()` static method

The **`UIFont.italicSystemFontOfSize()`** static method returns the italic system font at the given size, at regular weight.

## Syntax

```
UIFont.italicSystemFontOfSize(size)
```

### Parameters

**`size`**

The font size, a number in [pt](../units.md).

### Return value

A `UIFont`; never `null`.

### Exceptions

None. This method does not accept `weight`.

## Description

Italic and weight cannot be specified together; the corresponding native capability, `UIFontDescriptor`, is not provided yet.

## Examples

```js
const label = new UILabel();
label.text = 'The quick brown fox';
label.font = UIFont.italicSystemFontOfSize(17);
```

**Effect**: the text becomes 17 pt italic, with letterforms slanted to the right. **Not verified in the simulator.**

## Corresponding iOS API

`+[UIFont italicSystemFontOfSize:]`.

## See also

- [Weights](../ui-font.md#weights)
- [Setting fonts](../../guides/fonts.md)
