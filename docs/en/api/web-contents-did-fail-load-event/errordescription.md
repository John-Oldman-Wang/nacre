---
type: reference
native: WebContentsDidFailLoadEvent.errorDescription
---

# `WebContentsDidFailLoadEvent`: `errorDescription` property

The **`errorDescription`** property is the system's description of the error.

## Value

A string. Its language follows the system, so it is only good for logging; don't make decisions on it. Use [`errorCode`](errorcode.md) for that.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is an empty string.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('did-fail-load', (e) => {
  console.log('加载失败：' + e.errorDescription);
});
contents.loadURL('https://no-such-host.invalid').catch(() => {});
```

**Effect**: prints `加载失败：` and the system's description.

## Corresponding iOS API

`error.localizedDescription`.

## See also

- [`WebContentsDidFailLoadEvent`](../web-contents-did-fail-load-event.md)
