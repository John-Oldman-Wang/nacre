---
type: reference
native: "-[UIView needsUpdateConstraints]"
---

# `UIView`: `needsUpdateConstraints()` method

The **`needsUpdateConstraints()`** method returns whether this view has a pending constraint update.

## Syntax

```
needsUpdateConstraints()
```

### Parameters

None.

### Return value

A boolean. `true`: the view has been marked and not yet updated. `false`: there is no pending update.

### Exceptions

None.

## Description

This method was added later and hasn't been called in the simulator. Its effect is **not verified in the simulator**.

## Examples

```js
const view = new UIView();
view.setNeedsUpdateConstraints();
console.log(view.needsUpdateConstraints());
```

**Result**: Logs `true`. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIView needsUpdateConstraints]`.

## See also

- [`setNeedsUpdateConstraints()`](setneedsupdateconstraints.md)
