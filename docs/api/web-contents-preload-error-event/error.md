---
type: reference
native: WebContentsPreloadErrorEvent.error
---

# `WebContentsPreloadErrorEvent`：`error` 属性

**`error`** 属性是预加载脚本抛出来的错误。

## 值

`Error`。`message` 是网页那边 `String(error)` 的结果，比如 `'Error: boom'`。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const contents = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } }).webContents;
contents.addEventListener('preload-error', (e) => {
  console.log(e.error.message);
});
```

**效果**：预加载脚本里执行 `throw new Error('boom')` 时，输出 `Error: boom`。

## 对应的 iOS API

没有对应的系统 API。

## 参见

- [`WebContentsPreloadErrorEvent`](../web-contents-preload-error-event.md)
