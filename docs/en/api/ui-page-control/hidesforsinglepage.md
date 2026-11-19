---
type: reference
native: UIPageControl.hidesForSinglePage
---

# `UIPageControl`: `hidesForSinglePage` property

The **`hidesForSinglePage`** property determines whether the page control is hidden when there is only one page.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Hidden when [`numberOfPages`](numberofpages.md) is 1. It reappears when the number of pages becomes 2 or more |
| `false` | Shows one dot even with a single page |

- Readable and writable.
- Defaults to `false`.
- Writes are converted by JS truthiness.
- The on-screen effect of both values is **not verified in the simulator**.

## Examples

```js
const pages = new UIPageControl();
pages.hidesForSinglePage = true;
pages.numberOfPages = 1;
```

**Effect**: The page control isn't shown. Change `numberOfPages` to 2 and it reappears. **Not verified in the simulator.**

## Corresponding iOS API

`UIPageControl.hidesForSinglePage`.

## See also

- [`numberOfPages`](numberofpages.md)
