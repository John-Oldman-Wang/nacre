---
type: reference
native: "-[UIView updatePropertiesIfNeeded]"
---

# `UIView`: `updatePropertiesIfNeeded()` method

The **`updatePropertiesIfNeeded()`** method immediately performs any pending property update.

## Syntax

```
updatePropertiesIfNeeded()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

This method was added later and hasn't been called in the simulator. Its effect is **not verified in the simulator**.

In ObjC, the property update step is done by overriding `updateProperties`. That can't be overridden here, so for now this method only triggers the system's own update.

## Examples

```js
const view = new UIView();
view.updatePropertiesIfNeeded();
```

**Effect**: No visible change. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIView updatePropertiesIfNeeded]`.

## See also

- [`setNeedsUpdateProperties()`](setneedsupdateproperties.md)
