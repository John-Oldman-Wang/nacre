---
type: reference
native: "UIScrollViewDelegate scrollViewDidChangeAdjustedContentInset:"
---

# `UIScrollView`: `adjustedcontentinsetchange` event

The **`adjustedcontentinsetchange`** event fires when [`adjustedContentInset`](adjustedcontentinset.md) changes.

## Syntax

```
scroller.addEventListener('adjustedcontentinsetchange', (event) => { })
```

## Event object

`Event`. It has only `type` and `target` (this scroll view) and carries no other data. Not cancelable.

## When it fires

- A change in the space the system adds for the safe area, or the app changing `contentInset`, can cause it. In which cases it fires is **not verified in the simulator**.
- Fires after the change, once the current JS finishes running. When the callback runs, the scroll view's state is already the new one.
- No overhead without listeners.

## Examples

```js
const scroller = new UIScrollView();
scroller.addEventListener('adjustedcontentinsetchange', () => {
  console.log('Top inset', scroller.adjustedContentInset.top);
});
```

**Effect**: logs the new top space whenever the actual space changes.

## Corresponding iOS API

`scrollViewDidChangeAdjustedContentInset:` of `UIScrollViewDelegate`.

## See also

- [Safe area](../ui-scroll-view.md#safe-area)
