---
type: reference
native: "-[UIView removeLayoutGuide:]"
---

# `UIView`: `removeLayoutGuide()` method

The **`removeLayoutGuide()`** method removes a layout guide from this view.

## Syntax

```
removeLayoutGuide(guide)
```

### Parameters

**`guide`**

A [`UILayoutGuide`](../ui-layout-guide.md).

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

The argument isn't a `UILayoutGuide` (including `null`): `removeLayoutGuide needs a UILayoutGuide`.

## Examples

```js
const card = new UIView();
const spacer = new UILayoutGuide();
card.addLayoutGuide(spacer);
card.removeLayoutGuide(spacer);
```

**Result**: It is no longer in `card.layoutGuides`. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIView removeLayoutGuide:]`.

## See also

- [`UILayoutGuide`](../ui-layout-guide.md)
- [`layoutGuides`](layoutguides.md)
