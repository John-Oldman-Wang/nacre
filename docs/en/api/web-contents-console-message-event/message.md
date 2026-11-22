---
type: reference
native: WebContentsConsoleMessageEvent.message
---

# `WebContentsConsoleMessageEvent`: `message` property

The **`message`** property is the log text.

## Value

A string. Arguments are joined with a single space; objects and arrays are written as JSON; error objects are written as "name: message". An uncaught exception is `'Uncaught '` followed by the error. For the full rules, see [`console-message`](../web-contents/console-message-event.md).

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is an empty string.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('console-message', (e) => {
  console.log('[网页] ' + e.message);
});
```

**Effect**: when the page calls `console.log('hello', 1)`, prints `[网页] hello 1`.

## Corresponding iOS API

There is no corresponding system API.

## See also

- [`WebContentsConsoleMessageEvent`](../web-contents-console-message-event.md)
