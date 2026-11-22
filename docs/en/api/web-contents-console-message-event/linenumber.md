---
type: reference
native: WebContentsConsoleMessageEvent.lineNumber
---

# `WebContentsConsoleMessageEvent`: `lineNumber` property

The **`lineNumber`** property is the line where the page called `console`.

## Value

A number. It is `0` when not available.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `0`.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('console-message', (e) => {
  console.log(e.sourceId + ':' + e.lineNumber);
});
```

**Effect**: for each log the page writes, prints the file and line of the call.

## Corresponding iOS API

There is no corresponding system API.

## See also

- [`WebContentsConsoleMessageEvent`](../web-contents-console-message-event.md)
