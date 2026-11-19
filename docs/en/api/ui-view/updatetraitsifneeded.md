---
type: reference
native: "-[UIView updateTraitsIfNeeded]"
---

# `UIView`: `updateTraitsIfNeeded()` method

The **`updateTraitsIfNeeded()`** method immediately performs any pending trait update.

## Syntax

```
updateTraitsIfNeeded()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

This method was added later and hasn't been called in the simulator. Its effect is **not verified in the simulator**.

## Examples

```js
const view = new UIView();
view.updateTraitsIfNeeded();
```

**Effect**: No visible change. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIView updateTraitsIfNeeded]`.

## See also

- [`traitCollection`](traitcollection.md)
