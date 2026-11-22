---
type: reference
native: WebContentsConsoleMessageEvent.level
---

# `WebContentsConsoleMessageEvent`: `level` property

The **`level`** property is the log level.

## Value

A string, one of:

- Read-only. Assigning to it throws `TypeError`.
- `'info'`: `console.log()` and `console.info()`.
- `'warning'`: `console.warn()`.
- `'error'`: `console.error()`, plus uncaught exceptions and unhandled Promise rejections.
- `'debug'`: `console.debug()`.
- When the event is created with [`new`](constructor.md) without it, it is `'info'`.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('console-message', (e) => {
  if (e.level === 'error') console.log('网页出错', e.message);
});
```

**Effect**: when the page calls `console.error()` or has an uncaught exception, prints `网页出错` and the log text.

## Corresponding iOS API

There is no corresponding system API.

## See also

- [`WebContentsConsoleMessageEvent`](../web-contents-console-message-event.md)
