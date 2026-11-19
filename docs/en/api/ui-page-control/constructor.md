---
type: reference
native: "-[UIPageControl init]"
---

# `UIPageControl()` constructor

The **`UIPageControl()`** constructor creates a page control. A new page control has 0 pages and displays nothing.

## Syntax

```
new UIPageControl()
```

### Parameters

None.

### Return value

A new `UIPageControl`. [`numberOfPages`](numberofpages.md) is 0 and [`currentPage`](currentpage.md) is 0. Write `numberOfPages` before any dots become visible.

## Examples

```js
const pages = new UIPageControl();
pages.numberOfPages = 5;
const size = pages.sizeForNumberOfPages(5);
pages.frame = new CGRect(0, 0, size.width, size.height);
```

**Effect**: You get a page control with a row of five dots, sized to just fit five pages. It becomes visible once added to a page. **How it looks on screen is not verified in the simulator.**

## Corresponding iOS API

`[[UIPageControl alloc] init]`.

## See also

- [`numberOfPages`](numberofpages.md)
- [`sizeForNumberOfPages()`](sizefornumberofpages.md)
