---
type: reference
native: "-[UIView contentCompressionResistancePriorityForAxis:]"
---

# `UIView`: `contentCompressionResistancePriorityForAxis()` method

The **`contentCompressionResistancePriorityForAxis()`** method returns the view's priority, along one axis, for "resisting being squeezed smaller than its intrinsic size" (the compression resistance priority).

## Syntax

```
contentCompressionResistancePriorityForAxis(axis)
```

### Parameters

**`axis`**

`'horizontal'` (horizontal, affects width) or `'vertical'` (vertical, affects height).

### Return value

A number from 1 to 1000, with no unit. The default is `750`: `UILabel` and a plain `UIView` are both 750 (measured, both horizontally and vertically).

### Exceptions

**`TypeError`**

Invalid axis: `axis has no value "diagonal"; expected one of: horizontal / vertical`.

## Examples

```js
const label = new UILabel();
console.log(label.contentCompressionResistancePriorityForAxis('horizontal'));
```

**Result**: Prints `750`.

## Corresponding iOS API

`-[UIView contentCompressionResistancePriorityForAxis:]`. `UILayoutConstraintAxisHorizontal` is written as `'horizontal'`.

## See also

- [`setContentCompressionResistancePriority()`](setcontentcompressionresistancepriority.md)
- [Content hugging and compression resistance](../auto-layout.md#content-hugging-and-compression-resistance)
