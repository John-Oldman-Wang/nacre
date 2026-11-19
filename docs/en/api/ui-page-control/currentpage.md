---
type: reference
native: UIPageControl.currentPage
---

# `UIPageControl`: `currentPage` property

The **`currentPage`** property is the current page, counting from 0. This page's dot is shown brighter than the others.

## Value

A number, a page index.

- Readable and writable.
- Defaults to 0.
- Writes are first converted to a number, and fractions are truncated toward zero.
- An out-of-range value doesn't throw; it is clamped to between 0 and the last page: writing 9 gives the last page, writing -1 gives 0. With no pages at all, it is always 0.

### Observing changes

When the user taps or drags along the dots to change the page, the control first updates `currentPage` and then fires [`change`](../ui-control/change-event.md). Writes from code don't fire it: in the acceptance tests, no `change` was received within 300 milliseconds after a write. So writing it in a callback for scrolling content doesn't trigger `change` in turn.

Changes caused by reducing [`numberOfPages`](numberofpages.md) don't fire events either.

### Invalid values

Throws `TypeError` when the value can't be converted to a finite number: `currentPage must be a finite number, got "next"`.

## Examples

```js
const pages = new UIPageControl();
pages.numberOfPages = 5;
pages.currentPage = 9;
console.log(pages.currentPage);
pages.addEventListener('change', () => {
  console.log('Changed to page', pages.currentPage);
});
```

**Effect**: First prints `4`. Afterward, when the user taps another dot, the console prints the new page index. **The effect of tapping is not verified in the simulator.**

## Corresponding iOS API

`UIPageControl.currentPage`.

## See also

- The [`change`](../ui-control/change-event.md) event
- [`interactionState`](interactionstate.md): whether this page change was a tap or a drag
