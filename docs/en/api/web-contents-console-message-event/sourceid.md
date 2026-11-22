---
type: reference
native: WebContentsConsoleMessageEvent.sourceId
---

# `WebContentsConsoleMessageEvent`: `sourceId` property

The **`sourceId`** property is the file in which the page called `console`.

## Value

A string: the URL of the script file, or of the page itself. It is an empty string when not available.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is an empty string.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('console-message', (e) => {
  if (e.sourceId.endsWith('/app.js')) console.log('app.js 写了日志');
});
```

**Effect**: when the page's `app.js` writes a log, prints `app.js 写了日志`.

## Corresponding iOS API

There is no corresponding system API.

## See also

- [`WebContentsConsoleMessageEvent`](../web-contents-console-message-event.md)
