---
type: reference
native: UIPageControl.pageIndicatorTintColor
---

# `UIPageControl`: `pageIndicatorTintColor` property

The **`pageIndicatorTintColor`** property is the color of the dots that aren't the current page.

## Value

A color string, or `null`.

- Readable and writable.
- Defaults to `null`: the system default color.
- Write a color string (`'#ff3b30'`, `'secondaryLabel'`) or a `UIColor` object; a string you write reads back as is.
- Writing `null` returns to the system default color.
- The on-screen effect of the color is **not verified in the simulator**.

### Invalid values

Writing an unrecognized color doesn't throw; a warning is printed to the console and the property keeps its previous value. For how to write colors, see [Colors](../ui-color.md).

## Examples

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
pages.pageIndicatorTintColor = '#C7C7CC';
console.log(pages.pageIndicatorTintColor);
```

**Effect**: Prints `#C7C7CC`. The dots that aren't the current page are light gray. **How the color looks is not verified in the simulator.**

## Corresponding iOS API

`UIPageControl.pageIndicatorTintColor`; the native type is `UIColor`.

## See also

- [Colors](../ui-color.md)
- [`pageIndicatorTintColor`](pageindicatortintcolor.md), [`currentPageIndicatorTintColor`](currentpageindicatortintcolor.md)
