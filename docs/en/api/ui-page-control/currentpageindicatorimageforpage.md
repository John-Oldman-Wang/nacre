---
type: reference
native: "-[UIPageControl currentPageIndicatorImageForPage:]"
---

# `UIPageControl`: `currentPageIndicatorImageForPage()` method

The **`currentPageIndicatorImageForPage()`** method returns the current-page image set for a page with [`setCurrentPageIndicatorImage()`](setcurrentpageindicatorimage.md).

## Syntax

```
currentPageIndicatorImageForPage(page)
```

### Parameters

**`page`**

The page index, counting from 0. Fractions are truncated toward zero. Must be less than [`numberOfPages`](numberofpages.md).

### Return value

[`UIImage`](../ui-image.md), or `null`. It returns the object that was set. `null` if nothing was set; it doesn't return [`preferredCurrentPageIndicatorImage`](preferredcurrentpageindicatorimage.md).

### Exceptions

**`TypeError`**

- The page index is out of range or negative: `currentPageIndicatorImageForPage: page 3 is out of range; expected 0 to 2` (with 3 pages). With no pages at all, it is `currentPageIndicatorImageForPage: page 0 is out of range; there are none`.
- The page index can\'t be converted to a finite number: `currentPageIndicatorImageForPage must be a finite number, got "first"`.

## Examples

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
const dot = UIImage.systemImageNamed('circle.fill');
pages.setCurrentPageIndicatorImage(dot, { forPage: 1 });
console.log(pages.currentPageIndicatorImageForPage(1) === dot);
```

**Result**: Prints `true`.

## Corresponding iOS API

`-[UIPageControl currentPageIndicatorImageForPage:]`.

## See also

- [`setCurrentPageIndicatorImage()`](setcurrentpageindicatorimage.md)
