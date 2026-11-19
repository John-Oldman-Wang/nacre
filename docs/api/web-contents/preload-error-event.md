---
type: reference
native: WKUserScript
---

# `WebContents`：`preload-error` 事件

**`preload-error`** 事件在预加载脚本执行时抛了异常时派发。网页照常加载。

## 语法

```
contents.addEventListener('preload-error', (event) => {})
```

## 事件对象

`WebContentsPreloadErrorEvent`，除 `type`、`target` 以外带两个字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `preloadPath` | 字符串 | 建 `WebView` 时给的预加载脚本路径 |
| `error` | `Error` | 预加载脚本抛出来的错误。`message` 是网页那边 `String(error)` 的结果 |

不可取消。

## 什么时候派发

每张网页开始加载、预加载脚本执行到抛异常的那一句时。抛之前的那几句已经执行了。

预加载脚本读不到、有语法错时不派发这个事件，而是 [`new WebView()`](../web-view/constructor.md) 当场抛。

## 示例

```js
const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
web.webContents.addEventListener('preload-error', (e) => {
  console.log(e.preloadPath, e.error.message);
});
```

**效果**：预加载脚本里执行了 `throw new Error('坏了')` 时，输出 `JS/web/preload.js` 和带着 `坏了` 的错误说明。

## 和 Electron 的差别

Electron 写成 `contents.on('preload-error', (event, preloadPath, error) => …)`，这里数据在事件对象上。

## 参见

- [预加载脚本](../web-view.md#预加载脚本)
