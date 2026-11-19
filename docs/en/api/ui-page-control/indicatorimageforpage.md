---
type: reference
native: "-[UIPageControl indicatorImageForPage:]"
---

# `UIPageControl`: `indicatorImageForPage()` method

The **`indicatorImageForPage()`** method returns the image set separately for a page with [`setIndicatorImage()`](setindicatorimage.md).

## Syntax

```
indicatorImageForPage(page)
```

### Parameters

**`page`**

The page index, counting from 0. Fractions are truncated toward zero. Must be less than [`numberOfPages`](numberofpages.md).

### Return value

[`UIImage`](../ui-image.md), or `null`. It returns the object that was set. `null` if nothing was set separately; it doesn't return [`preferredIndicatorImage`](preferredindicatorimage.md).

### Exceptions

**`TypeError`**

- The page index is out of range or negative: `indicatorImageForPage: page 3 is out of range; expected 0 to 2` (with 3 pages). With no pages at all, it is `indicatorImageForPage: page 0 is out of range; there are none`.
- The page index can\'t be converted to a finite number: `indicatorImageForPage must be a finite number, got "first"`.

## Examples

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
console.log(pages.indicatorImageForPage(0));
```

**Result**: Prints `null`.

## Corresponding iOS API

`-[UIPageControl indicatorImageForPage:]`.

## See also

- [`setIndicatorImage()`](setindicatorimage.md)
