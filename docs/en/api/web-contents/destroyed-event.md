---
type: reference
native: WKWebView
---

# `WebContents`: `destroyed` event

The **`destroyed`** event fires after the web page is destroyed by [`close()`](close.md).

## Syntax

```
contents.addEventListener('destroyed', (event) => {})
```

## Event object

`Event`, with no extra fields. Not cancelable.

## When it fires

Fires once after `close()` is called. When `close()` returns, `isDestroyed()` is already `true`; the event arrives after that. Calling `close()` again doesn't fire it a second time.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('destroyed', () => console.log('Destroyed'));
contents.close();
console.log(contents.isDestroyed());
```

**Result**: It first prints `true`, then `Destroyed`.

## Differences from Electron

Same as Electron's `destroyed`.

## See also

- [`close()`](close.md)
