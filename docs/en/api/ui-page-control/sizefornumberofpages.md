---
type: reference
native: "-[UIPageControl sizeForNumberOfPages:]"
---

# `UIPageControl`: `sizeForNumberOfPages()` method

The **`sizeForNumberOfPages()`** method returns the minimum size needed to show a given number of pages. Use it to set the page control's `frame`.

## Syntax

```
sizeForNumberOfPages(pageCount)
```

### Parameters

**`pageCount`**

The number of pages, a count. Fractions are truncated toward zero. Can't be negative.

### Return value

A [`CGSize`](../structs.md), in [pt](../units.md).

- Measured on iOS 27.2 with horizontal layout: 3 pages is 73 × 25.67 pt, 10 pages is 196.67 × 25.67 pt.
- The result changes with [`direction`](direction.md): with vertical layout it is narrow and tall. **Not verified in the simulator.**
- When `pageCount` is 0, the returned width is a meaningless large number (measured at about 1.48 × 10²⁰); don't use it.

### Exceptions

**`TypeError`**

- `pageCount` is negative: `sizeForNumberOfPages must be a non-negative integer, got -1`.
- `pageCount` can't be converted to a finite number: `sizeForNumberOfPages must be a finite number, got "many"`.

## Examples

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
const size = pages.sizeForNumberOfPages(3);
pages.frame = new CGRect(40, 300, size.width, size.height);
console.log(size.width, size.height);
```

**Result**: Prints the width and height, about 73 and 25.67 on iOS 27.2. The page control is sized to just fit three dots.

## Corresponding iOS API

`-[UIPageControl sizeForNumberOfPages:]`. Native throws a native exception that JS can't catch for a negative number; here it throws `TypeError`.

## See also

- [`numberOfPages`](numberofpages.md)
- [Structs](../structs.md): `CGSize`
