---
type: reference
native: "+[UIFont boldSystemFontOfSize:]"
---

# `UIFont.boldSystemFontOfSize()` static method

The **`UIFont.boldSystemFontOfSize()`** static method returns the bold system font at the given size.

## Syntax

```
UIFont.boldSystemFontOfSize(size)
```

### Parameters

**`size`**

The font size, a number in [pt](../units.md).

### Return value

A `UIFont`; never `null`.

### Exceptions

None. This method does not accept `weight`.

## Description

For other weights, use the `weight` of [`systemFontOfSize()`](systemfontofsize.md).

## Examples

```js
const label = new UILabel();
label.text = 'Bold';
label.font = UIFont.boldSystemFontOfSize(17);
```

**Effect**: the text becomes 17 pt bold. **Not verified in the simulator.**

## Corresponding iOS API

`+[UIFont boldSystemFontOfSize:]`.

## See also

- [Weights](../ui-font.md#weights)
- [Setting fonts](../../guides/fonts.md)
