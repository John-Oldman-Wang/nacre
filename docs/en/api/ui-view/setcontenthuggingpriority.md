---
type: reference
native: "-[UIView setContentHuggingPriority:forAxis:]"
---

# `UIView`: `setContentHuggingPriority()` method

The **`setContentHuggingPriority()`** method sets how strongly the view resists being made larger than its intrinsic size along one axis (its content hugging priority).

## Syntax

```
setContentHuggingPriority(priority, { forAxis })
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

- `forAxis` is missing: `setContentHuggingPriority needs { forAxis }`.
- Invalid axis: `forAxis has no value "diagonal"; expected one of: horizontal / vertical`.
- Invalid priority name: `priority has no value "veryImportant"; expected one of: …`.

## Description

When there is extra space, the view with the **lowest** hugging priority is stretched to take it up. Extra or missing space isn't shared proportionally; the single view with the lowest priority absorbs all of it. When two views have equal priority, the system doesn't know which one to change. That means the constraints are insufficient, so when placing two labels side by side, change the priority of one of them. For a view with no intrinsic size, this priority has no effect. Which view stretches and which shrinks is **not verified in the simulator**.

## Examples

```js
const caption = new UILabel();
caption.text = 'Account balance';
const amount = new UILabel();
amount.text = '128.00';
const line = new UIStackView([caption, amount]);

amount.setContentHuggingPriority('defaultHigh', { forAxis: 'horizontal' });
console.log(amount.contentHuggingPriorityForAxis('horizontal'));
```

**Effect**: `amount` holds to its own width more firmly, so all the extra width goes to `caption`: "128.00" sits against the right end of the row, and "Account balance" fills the rest of the width on the left (**not verified in the simulator**). Logs `750`.

## Corresponding iOS API

`-[UIView setContentHuggingPriority:forAxis:]`. `[v setContentHuggingPriority:UILayoutPriorityDefaultLow forAxis:UILayoutConstraintAxisHorizontal]` is written `v.setContentHuggingPriority('defaultLow', { forAxis: 'horizontal' })`.

## See also

- [`contentHuggingPriorityForAxis()`](contenthuggingpriorityforaxis.md)
- [Content hugging and compression resistance](../auto-layout.md#content-hugging-and-compression-resistance)
- [One view sized to its content, the other filling the remaining space](../../guides/auto-layout.md#one-view-sized-to-its-content-the-other-filling-the-remaining-space)
