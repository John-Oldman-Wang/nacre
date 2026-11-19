---
type: reference
native: "-[UIView contentHuggingPriorityForAxis:]"
---

# `UIView`: `contentHuggingPriorityForAxis()` method

The **`contentHuggingPriorityForAxis()`** method returns the view's priority, along one axis, for "resisting being stretched larger than its intrinsic size" (the content hugging priority).

## Syntax

```
contentHuggingPriorityForAxis(axis)
```

### Parameters

**`axis`**

`'horizontal'` (horizontal, affects width) or `'vertical'` (vertical, affects height).

### Return value

A number from 1 to 1000, with no unit. The default is `250`: `UILabel` and a plain `UIView` are both 250 (measured, both horizontally and vertically).

### Exceptions

**`TypeError`**

Invalid axis: `axis has no value "diagonal"; expected one of: horizontal / vertical`.

## Examples

```js
const label = new UILabel();
console.log(label.contentHuggingPriorityForAxis('horizontal'));
```

**Result**: Prints `250`.

## Corresponding iOS API

`-[UIView contentHuggingPriorityForAxis:]`. `UILayoutConstraintAxisHorizontal` is written as `'horizontal'`.

## See also

- [`setContentHuggingPriority()`](setcontenthuggingpriority.md)
- [Content hugging and compression resistance](../auto-layout.md#content-hugging-and-compression-resistance)
