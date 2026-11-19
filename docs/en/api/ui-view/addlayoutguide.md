---
type: reference
native: "-[UIView addLayoutGuide:]"
---

# `UIView`: `addLayoutGuide()` method

The **`addLayoutGuide()`** method adds a layout guide to this view. A layout guide you create must be added to a view before you can build constraints with it.

## Syntax

```
addLayoutGuide(guide)
```

### Parameters

**`guide`**

A [`UILayoutGuide`](../ui-layout-guide.md).

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

The argument isn't a `UILayoutGuide` (including `null`): `addLayoutGuide needs a UILayoutGuide`.

## Examples

```js
const card = new UIView();
const spacer = new UILayoutGuide();
card.addLayoutGuide(spacer);
```

**Result**: `spacer.owningView === card`, and `card.layoutGuides` contains it.

## Corresponding iOS API

`-[UIView addLayoutGuide:]`.

## See also

- [`UILayoutGuide`](../ui-layout-guide.md)
- [`layoutGuides`](layoutguides.md)
