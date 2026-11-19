---
type: reference
native: UIPageControl.preferredCurrentPageIndicatorImage
---

# `UIPageControl`: `preferredCurrentPageIndicatorImage` property

The **`preferredCurrentPageIndicatorImage`** property is the image used for the current page's dot.

## Value

[`UIImage`](../ui-image.md), or `null`.

- Readable and writable.
- Defaults to `null`. `null` means the current page uses the same image as the other pages; see [`preferredIndicatorImage`](preferredindicatorimage.md).
- What you read is the object you wrote; comparing with `===` gives `true`.
- How the image looks on screen is **not verified in the simulator**.

### Invalid values

Writing something that is neither a `UIImage` nor `null` throws `TypeError`: `preferredCurrentPageIndicatorImage needs a native object or null, got "circle.fill"`.

## Examples

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
pages.preferredCurrentPageIndicatorImage = UIImage.systemImageNamed('circle.fill');
```

**Effect**: The current page shows a filled circle; the other pages are still dots. **Not verified in the simulator.**

## Corresponding iOS API

`UIPageControl.preferredCurrentPageIndicatorImage`.

## See also

- [`setIndicatorImage()`](setindicatorimage.md): changing the image for a single page
- [`UIImage`](../ui-image.md): getting SF Symbols and your own images
