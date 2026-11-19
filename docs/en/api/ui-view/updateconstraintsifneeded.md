---
type: reference
native: "-[UIView updateConstraintsIfNeeded]"
---

# `UIView`: `updateConstraintsIfNeeded()` method

The **`updateConstraintsIfNeeded()`** method immediately performs any pending constraint update, including for descendants.

## Syntax

```
updateConstraintsIfNeeded()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

This method was added later and hasn't been called in the simulator. Its effect is **not verified in the simulator**.

This method only triggers the system's own constraint update.

## Examples

```js
const view = new UIView();
view.updateConstraintsIfNeeded();
```

**Effect**: No visible change. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIView updateConstraintsIfNeeded]`.

## See also

- [`setNeedsUpdateConstraints()`](setneedsupdateconstraints.md), [`needsUpdateConstraints()`](needsupdateconstraints.md)
