---
type: reference
native: WebContentsWillNavigateEvent.isMainFrame
---

# `WebContentsWillNavigateEvent`: `isMainFrame` property

The **`isMainFrame`** property is always `true`: navigations inside an `<iframe>` don't fire this event.

## Value

A boolean.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `true`.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('will-navigate', (e) => {
  console.log(e.isMainFrame);
});
```

**Effect**: each time the page starts a navigation, prints `true`.

## Corresponding iOS API

`navigationAction.targetFrame.isMainFrame`.

## See also

- [`WebContentsWillNavigateEvent`](../web-contents-will-navigate-event.md)
