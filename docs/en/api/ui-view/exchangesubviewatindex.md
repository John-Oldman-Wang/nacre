---
type: reference
native: "-[UIView exchangeSubviewAtIndex:withSubviewAtIndex:]"
---

# `UIView`: `exchangeSubviewAtIndex()` method

The **`exchangeSubviewAtIndex()`** method swaps the positions of two subviews in [`subviews`](subviews.md), that is, swaps their stacking order.

## Syntax

```
exchangeSubviewAtIndex(index1, { withSubviewAtIndex })
```

### Parameters

**`index1`**

The index of one subview, an integer starting at 0. Converted as an integer; fractions are truncated toward zero.

**`options.withSubviewAtIndex`**

The index of the other subview. Required.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `withSubviewAtIndex` not given: `exchangeSubviewAtIndex needs { withSubviewAtIndex }`.
- An index doesn't convert to a finite number: `exchangeSubviewAtIndex must be a finite number, got …` (for the second index, `withSubviewAtIndex must be …`).

The result when an index is out of range is **not verified in the simulator**.

## Description

This method was added later and hasn't been called in the simulator; its effect is **not verified in the simulator**.

## Examples

```js
const page = new UIView();
const a = new UIView();
const b = new UIView();
page.addSubview(a);
page.addSubview(b);

page.exchangeSubviewAtIndex(0, { withSubviewAtIndex: 1 });
console.log(page.subviews[0] === b);
```

**Result**: Prints `true`; `b` has moved below `a`. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIView exchangeSubviewAtIndex:withSubviewAtIndex:]`.

## See also

- [`bringSubviewToFront()`](bringsubviewtofront.md), [`insertSubview()`](insertsubview.md)
