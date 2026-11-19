---
type: reference
native: "-[UIPageControl setIndicatorImage:forPage:]"
---

# `UIPageControl`: `setIndicatorImage()` method

The **`setIndicatorImage()`** method changes the image for a single page's dot. The other pages are unchanged.

## Syntax

```
setIndicatorImage(image, { forPage })
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

- `forPage` not passed: `setIndicatorImage needs { forPage }`.
- The page index is out of range or negative: `setIndicatorImage: page 3 is out of range; expected 0 to 2` (with 3 pages). With no pages at all, it is `setIndicatorImage: page 0 is out of range; there are none`.
- `image` is neither a `UIImage` nor `null`: `setIndicatorImage needs a UIImage or null`.

## Examples

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
const arrow = UIImage.systemImageNamed('location.fill');
pages.setIndicatorImage(arrow, { forPage: 0 });
console.log(pages.indicatorImageForPage(0) === arrow);
```

**Effect**: Prints `true`. Page 0's dot is a location arrow; the other dots are unchanged. **How it looks on screen is not verified in the simulator.**

## Corresponding iOS API

`-[UIPageControl setIndicatorImage:forPage:]`. Native throws a native exception that JS can\'t catch when the page index is out of range; here it throws `TypeError`.

## See also

- [`indicatorImageForPage()`](indicatorimageforpage.md)
- [`preferredIndicatorImage`](preferredindicatorimage.md): changing the image for all pages
