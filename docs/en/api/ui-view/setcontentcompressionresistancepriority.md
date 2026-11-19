---
type: reference
native: "-[UIView setContentCompressionResistancePriority:forAxis:]"
---

# `UIView`: `setContentCompressionResistancePriority()` method

The **`setContentCompressionResistancePriority()`** method sets how strongly the view resists being made smaller than its intrinsic size along one axis (its compression resistance priority).

## Syntax

```
setContentCompressionResistancePriority(priority, { forAxis })
```

### Parameters

**`priority`**

A number (1 to 1000, unitless), or a priority name: `'required'` (1000), `'defaultHigh'` (750), `'dragThatCanResizeScene'` (510), `'sceneSizeStayPut'` (500), `'dragThatCannotResizeScene'` (490), `'defaultLow'` (250), `'fittingSizeLevel'` (50). It always reads back as a number.

**`options.forAxis`**

`'horizontal'` (affects width) or `'vertical'` (affects height). Required.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `forAxis` is missing: `setContentCompressionResistancePriority needs { forAxis }`.
- Invalid axis: `forAxis has no value "diagonal"; expected one of: horizontal / vertical`.
- Invalid priority name: `priority has no value "veryImportant"; expected one of: …`.

## Description

When there isn't enough space, the view with the **lowest** compression resistance priority is shrunk. When a label is shrunk, its text is truncated. Extra or missing space isn't shared proportionally; the single view with the lowest priority absorbs all of it. When two views have equal priority, the system doesn't know which one to change. That means the constraints are insufficient, so when placing two labels side by side, change the priority of one of them. For a view with no intrinsic size, this priority has no effect. Which view stretches and which shrinks is **not verified in the simulator**.

## Examples

```js
const title = new UILabel();
const value = new UILabel();
value.setContentCompressionResistancePriority('required', { forAxis: 'horizontal' });
console.log(value.contentCompressionResistancePriorityForAxis('horizontal'));
```

**Effect**: When space runs short, `title` is shrunk first and `value` is shown in full (**not verified in the simulator**). Logs `1000`.

## Corresponding iOS API

`-[UIView setContentCompressionResistancePriority:forAxis:]`. `[v setContentCompressionResistancePriority:UILayoutPriorityDefaultLow forAxis:UILayoutConstraintAxisHorizontal]` is written `v.setContentCompressionResistancePriority('defaultLow', { forAxis: 'horizontal' })`.

## See also

- [`contentCompressionResistancePriorityForAxis()`](contentcompressionresistancepriorityforaxis.md)
- [Content hugging and compression resistance](../auto-layout.md#content-hugging-and-compression-resistance)
- [One view sized to its content, the other filling the remaining space](../../guides/auto-layout.md#one-view-sized-to-its-content-the-other-filling-the-remaining-space)
