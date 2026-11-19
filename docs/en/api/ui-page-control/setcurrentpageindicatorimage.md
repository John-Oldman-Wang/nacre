---
type: reference
native: "-[UIPageControl setCurrentPageIndicatorImage:forPage:]"
---

# `UIPageControl`: `setCurrentPageIndicatorImage()` method

The **`setCurrentPageIndicatorImage()`** method sets the image used when a specific page is the current page.

## Syntax

```
setCurrentPageIndicatorImage(image, { forPage })
```

### Parameters

**`image`**

[`UIImage`](../ui-image.md), or `null`. `null` removes the image set separately for this page and returns to the default.

**`options.forPage`**

The page index, counting from 0, required. Fractions are truncated toward zero. Must be less than [`numberOfPages`](numberofpages.md).

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `forPage` not passed: `setCurrentPageIndicatorImage needs { forPage }`.
- The page index is out of range or negative: `setCurrentPageIndicatorImage: page 3 is out of range; expected 0 to 2` (with 3 pages). With no pages at all, it is `setCurrentPageIndicatorImage: page 0 is out of range; there are none`.
- `image` is neither a `UIImage` nor `null`: `setCurrentPageIndicatorImage needs a UIImage or null`.

## Examples

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
pages.setIndicatorImage(UIImage.systemImageNamed('location'), { forPage: 0 });
pages.setCurrentPageIndicatorImage(UIImage.systemImageNamed('location.fill'), { forPage: 0 });
```

**Effect**: Page 0 is an outlined arrow when it isn't the current page, and a filled arrow when it is. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIPageControl setCurrentPageIndicatorImage:forPage:]`. Native throws a native exception that JS can\'t catch when the page index is out of range; here it throws `TypeError`.

## See also

- [`currentPageIndicatorImageForPage()`](currentpageindicatorimageforpage.md)
- [`preferredCurrentPageIndicatorImage`](preferredcurrentpageindicatorimage.md): setting the current-page image for all pages
