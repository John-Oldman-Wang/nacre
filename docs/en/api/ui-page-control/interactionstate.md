---
type: reference
native: UIPageControl.interactionState
---

# `UIPageControl`: `interactionState` property

The **`interactionState`** property indicates how the most recent page change happened: a single tap, or pressing and dragging.

## Value

A string, one of these three:

| Value | Meaning |
| --- | --- |
| `'none'` | The user hasn't interacted with it yet |
| `'discrete'` | The user tapped once and changed one page |
| `'continuous'` | The user changed pages by pressing and dragging along the dots |

- Read-only. Assigning to it throws `TypeError`.
- Defaults to `'none'`.
- Read it in the [`change`](../ui-control/change-event.md) callback. A drag passes through several pages at once, so you can use it to decide whether to scroll the content with animation.
- Its values after user interaction are **not verified in the simulator**.

## Examples

```js
const pages = new UIPageControl();
pages.numberOfPages = 5;
pages.addEventListener('change', () => {
  const animated = pages.interactionState !== 'continuous';
  console.log('Page', pages.currentPage, 'animated:', animated);
});
```

**Effect**: Changing pages with a tap prints "animated: true"; changing pages by pressing and dragging prints "animated: false". **Not verified in the simulator.**

## Corresponding iOS API

`UIPageControl.interactionState`. `UIPageControlInteractionStateDiscrete` is written as `'discrete'`, and likewise for the rest.

## See also

- [`allowsContinuousInteraction`](allowscontinuousinteraction.md): turning off drag-to-page
