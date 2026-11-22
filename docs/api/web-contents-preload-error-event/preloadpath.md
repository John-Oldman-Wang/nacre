---
type: reference
native: WebContentsPreloadErrorEvent.preloadPath
---

# `WebContentsPreloadErrorEvent`：`preloadPath` 属性

**`preloadPath`** 属性是预加载脚本的路径。

## 值

字符串，就是建 `WebView` 时 `webPreferences.preload` 给的那个路径。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 空串。

## 示例

```js
const contents = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } }).webContents;
contents.addEventListener('preload-error', (e) => {
  console.log('出错的脚本', e.preloadPath);
});
```

**效果**：预加载脚本抛了异常时，输出 `出错的脚本 JS/web/preload.js`。

## 对应的 iOS API

没有对应的系统 API。

## 参见

- [`WebContentsPreloadErrorEvent`](../web-contents-preload-error-event.md)
