---
type: reference
native: UIPageControl.allowsContinuousInteraction
---

# `UIPageControl`: `allowsContinuousInteraction` property

The **`allowsContinuousInteraction`** property determines whether the user can press and drag along the dots to turn pages continuously.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Pressing and dragging along the dots changes pages one at a time, firing [`change`](../ui-control/change-event.md) once per page |
| `false` | Dragging does nothing. A tap still turns to the adjacent page |

- Readable and writable.
- Defaults to `true`.
- Writes are converted by JS truthiness.
- The effects of both values and how many times `change` fires are **not verified in the simulator**.

## Examples

```js
const pages = new UIPageControl();
pages.numberOfPages = 5;
pages.allowsContinuousInteraction = false;
```

**Effect**: Pressing and dragging along the dots does nothing; a tap turns to the adjacent page. **Not verified in the simulator.**

## Corresponding iOS API

`UIPageControl.allowsContinuousInteraction`.

## See also

- [`interactionState`](interactionstate.md)
