---
type: reference
native: UIPageControl.numberOfPages
---

# `UIPageControl`: `numberOfPages` property

The **`numberOfPages`** property is how many pages there are, that is, how many dots are shown.

## Value

A number, a count.

- Readable and writable.
- Defaults to 0: nothing is displayed.
- Writes are first converted to a number, and fractions are truncated toward zero: writing `3.7` gives 3.
- After it is reduced, if [`currentPage`](currentpage.md) is outside the new range, it becomes the last page.
- After it is reduced, images set separately with [`setIndicatorImage()`](setindicatorimage.md) on the removed pages are not kept; if it is increased again, those pages return to the default dot. **Not verified in the simulator.**
- Its changes don't fire events. Only your code changes the number of pages.

### Invalid values

Throws `TypeError`, and the property keeps its previous value.

- A negative number: `numberOfPages must be a non-negative integer, got -3`.
- Can't be converted to a finite number (`'many'`, `undefined`): `numberOfPages must be a finite number, got "many"`.

## Examples

```js
const pages = new UIPageControl();
pages.numberOfPages = 5;
pages.currentPage = 4;
pages.numberOfPages = 2;
console.log(pages.currentPage);
```

**Result**: Prints `1`. After the number of pages becomes 2, the previous page 4 is out of range and becomes the last page.

## Corresponding iOS API

`UIPageControl.numberOfPages`. Native treats a negative number as 0; here it throws `TypeError`.

## See also

- [`currentPage`](currentpage.md)
- [`hidesForSinglePage`](hidesforsinglepage.md): hiding when there is only one page
