---
type: reference
native: "-[UIView setNeedsUpdateProperties]"
---

# `UIView`: `setNeedsUpdateProperties()` method

The **`setNeedsUpdateProperties()`** method marks this view as needing a property update. The system runs the view's property update pass at the next update.

## Syntax

```
setNeedsUpdateProperties()
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
view.setNeedsUpdateProperties();
```

**Effect**: No visible change. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIView setNeedsUpdateProperties]`.

## See also

- [`updatePropertiesIfNeeded()`](updatepropertiesifneeded.md)
