---
type: reference
native: "-[UIStackView setCustomSpacing:afterView:]"
---

# `UIStackView`: `setCustomSpacing()` method

The **`setCustomSpacing()`** method sets the spacing after one particular arranged subview. This value takes precedence over the [`spacing`](spacing.md) property.

## Syntax

```
setCustomSpacing(spacing, { afterView })
```

### Parameters

**`spacing`**

The spacing, one of three kinds:

| Value | Effect |
| --- | --- |
| A number | The spacing after this item is this many [pt](../units.md) |
| `'system'` | Uses the system's recommended spacing after this item |
| `'default'` | Removes the custom setting; the value of the `spacing` property is used after this item again |

**`options.afterView`**

A `UIView`, required. The spacing is added after this arranged subview.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `afterView` is missing, or written as `{ afterView: undefined }`: `setCustomSpacing needs { afterView }`.
- `afterView` is not a view: `setCustomSpacing needs a UIView`.
- `spacing` is not a number, `'system'`, or `'default'`: `setCustomSpacing has no value "wide"; expected one of: a number / "system" / "default"`.

When it throws, the spacing is unchanged.

## Description

After a view is removed from the arrangement, the spacing set for it no longer applies. When an arranged subview changes position in the arrangement, the spacing moves with it. **Neither is verified in the simulator.**

## Examples

```js
const red = new UIView();
const orange = new UIView();
const teal = new UIView();
const row = new UIStackView([red, orange, teal]);
row.spacing = 12;

row.setCustomSpacing(40, { afterView: red });
console.log(row.customSpacingAfterView(red));

row.setCustomSpacing('default', { afterView: red });
console.log(row.customSpacingAfterView(red));
```

**Effect**

- After the first call, the gap between the red and orange blocks is 40 pt, while the gap between the orange and teal blocks is still 12 pt. The console prints `40`.
- After removing it, the value of `spacing` is used after the red block again. The console prints `default`.

## Corresponding iOS API

`-[UIStackView setCustomSpacing:afterView:]`. `UIStackViewSpacingUseSystem` is written `'system'`, and `UIStackViewSpacingUseDefault` is written `'default'`.

## See also

- [`customSpacingAfterView()`](customspacingafterview.md): reading it back
- [`spacing`](spacing.md)
