---
type: reference
native: "-[UIView setNeedsUpdateConstraints]"
---

# `UIView`: `setNeedsUpdateConstraints()` method

The **`setNeedsUpdateConstraints()`** method marks this view's constraints as needing an update. The system updates them before the next layout pass.

## Syntax

```
setNeedsUpdateConstraints()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

The effect is **not verified in the simulator**.

## Examples

```js
const view = new UIView();
view.setNeedsUpdateConstraints();
```

**Effect**: No visible change. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIView setNeedsUpdateConstraints]`.

## See also

- [`updateConstraintsIfNeeded()`](updateconstraintsifneeded.md), [`needsUpdateConstraints()`](needsupdateconstraints.md)
