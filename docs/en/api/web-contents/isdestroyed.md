---
type: reference
native: WKWebView
---

# `WebContents`: `isDestroyed()` method

The **`isDestroyed()`** method returns whether the web page has been destroyed by [`close()`](close.md).

## Syntax

```
isDestroyed()
```

### Parameters

None.

### Return value

A boolean.

- `true`: destroyed. From then on, every method other than `close()` and `isDestroyed()` throws `TypeError: Object has been destroyed`.
- `false`: still alive.

[`destroyed`](destroyed-event.md) fires when it becomes `true`.

### Exceptions

None. It can be called after destruction.

## Examples

```js
const contents = new WebView().webContents;
console.log(contents.isDestroyed());
contents.close();
console.log(contents.isDestroyed());
```

**Result**: It prints `false`, then `true`.

## Differences from Electron

Same as Electron's `contents.isDestroyed()`.

## See also

- [`close()`](close.md)
