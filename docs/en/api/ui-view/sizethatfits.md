---
type: reference
native: "-[UIView sizeThatFits:]"
---

# `UIView`: `sizeThatFits()` method

The **`sizeThatFits()`** method asks the view how large it needs to be to show all its content without exceeding `size`. It doesn't change the view.

## Syntax

```
sizeThatFits(size)
```

### Parameters

**`size`**

A [`CGSize`](../cg-size.md) or `{ width, height }`: the maximum available space, in [pt](../units.md).

### Return value

A `CGSize`, in pt. Returned synchronously, not a Promise.

### Exceptions

**`TypeError`**

- `size` isn't an object: `sizeThatFits needs an object with all of: width, height`.
- `size` is missing a field: `sizeThatFits is missing width, or it is not a finite number`.

## Description

It asks about the view's own content: views such as labels and buttons know how much space their content needs. To compute a size from the constraints between subviews, use [`systemLayoutSizeFittingSize()`](systemlayoutsizefittingsize.md).

## Examples

```js
const label = new UILabel();
label.text = 'Hello, Nacre';

const need = label.sizeThatFits(new CGSize(300, 1000));
label.frame = new CGRect(40, 500, need.width, need.height);
```

**Effect**: The view's size exactly matches the size of the text.

## Corresponding iOS API

`-[UIView sizeThatFits:]`.

## See also

- [`sizeToFit()`](sizetofit.md): measures the size and resizes to it
- [`systemLayoutSizeFittingSize()`](systemlayoutsizefittingsize.md): computes a size from constraints
