---
type: reference
native: WebContentsDidFailLoadEvent.isMainFrame
---

# `WebContentsDidFailLoadEvent`: `isMainFrame` property

The **`isMainFrame`** property is always `true`: load failures inside an `<iframe>` don't fire this event.

## Value

A boolean.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `true`.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('did-fail-load', (e) => {
  console.log(e.isMainFrame);
});
```

**Effect**: on a load failure, prints `true`.

## Corresponding iOS API

There is no corresponding system API.

## See also

- [`WebContentsDidFailLoadEvent`](../web-contents-did-fail-load-event.md)
