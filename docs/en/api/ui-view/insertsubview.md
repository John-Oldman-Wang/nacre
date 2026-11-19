---
type: reference
native: "-[UIView insertSubview:atIndex:]"
---

# `UIView`: `insertSubview()` method

The **`insertSubview()`** method adds a view as a subview and specifies its position in the stacking order.

## Syntax

```
insertSubview(view, { atIndex })
insertSubview(view, { belowSubview })
insertSubview(view, { aboveSubview })
```

### Parameters

**`view`**

The `UIView` to add.

**`options.atIndex`**

The position in [`subviews`](subviews.md). An integer starting at 0, where 0 is the bottom. Converted as an integer: `'0'` becomes 0, and fractions are truncated toward zero.

**`options.belowSubview`**

A subview. `view` is placed one level below it.

**`options.aboveSubview`**

A subview. `view` is placed one level above it.

Give one of the three keys.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- None of the three keys is in `options`: `insertSubview needs one of { atIndex } / { belowSubview } / { aboveSubview }`.
- `atIndex` doesn't convert to a finite number: `atIndex must be a finite number, got NaN`, where after `got` is the value received.
- The argument isn't a view (another native object, `null`, a number, or missing): `insertSubview needs a UIView`.
- Other cases are the same as [`addSubview()`](addsubview.md).

On error the view hierarchy is unchanged.

## Description

If `view` already has a superview, it is first removed from that superview. **Not verified in the simulator.**

## Examples

```js
const page = new UIView();
const a = new UIView();
a.frame = new CGRect(40, 300, 120, 120);
a.backgroundColor = 'systemRed';
page.addSubview(a);

const c = new UIView();
c.frame = new CGRect(70, 330, 120, 120);
c.backgroundColor = 'systemOrange';
page.insertSubview(c, { belowSubview: a });
console.log(page.subviews[0] === c);
```

**Effect**: The orange square is added one level below the red square, and where they overlap, red shows. The console prints `true`.

## Corresponding iOS API

`-[UIView insertSubview:atIndex:]`, `insertSubview:belowSubview:`, and `insertSubview:aboveSubview:` are a single method in JS, with the second part written as an options key.

## See also

- [`addSubview()`](addsubview.md)
- [`bringSubviewToFront()`](bringsubviewtofront.md), [`sendSubviewToBack()`](sendsubviewtoback.md)
