---
type: reference
native: UIPageControl.preferredIndicatorImage
---

# `UIPageControl`: `preferredIndicatorImage` property

The **`preferredIndicatorImage`** property is the image used for all dots. Once set, every page shows this image instead of a dot.

## Value

[`UIImage`](../ui-image.md), or `null`.

- Readable and writable.
- Defaults to `null`. `null` means dots are used.
- Pages that have an image set separately with [`setIndicatorImage()`](setindicatorimage.md) use that image.
- What you read is the object you wrote; comparing with `===` gives `true`.
- How the image looks on screen is **not verified in the simulator**.

### Invalid values

Writing something that is neither a `UIImage` nor `null` throws `TypeError`: `preferredIndicatorImage needs a native object or null, got "circle.fill"`.

## Examples

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
pages.preferredIndicatorImage = UIImage.systemImageNamed('star');
pages.preferredCurrentPageIndicatorImage = UIImage.systemImageNamed('star.fill');
```

**Effect**: Each page is an outlined star, and the current page is a filled star. **Not verified in the simulator.**

`systemImageNamed` gets an SF Symbol, the system's built-in set of icons. When the name doesn't exist it returns `null`, and writing `null` means dots are used.

## Corresponding iOS API

`UIPageControl.preferredIndicatorImage`.

## See also

- [`setIndicatorImage()`](setindicatorimage.md): changing the image for a single page
- [`UIImage`](../ui-image.md): getting SF Symbols and your own images
