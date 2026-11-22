---
type: reference
native: WebContentsConsoleMessageEvent.level
---

# `WebContentsConsoleMessageEvent`：`level` 属性

**`level`** 属性是日志的级别。

## 值

字符串，下面之一：

- 只读。给它赋值抛 `TypeError`。
- `'info'`：`console.log()`、`console.info()`。
- `'warning'`：`console.warn()`。
- `'error'`：`console.error()`，以及没被捕获的异常和没人处理的 Promise 拒绝。
- `'debug'`：`console.debug()`。
- 用 [`new`](constructor.md) 创建时没给，是 `'info'`。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('console-message', (e) => {
  if (e.level === 'error') console.log('网页出错', e.message);
});
```

**效果**：网页调 `console.error()` 或者有异常没被捕获时，输出 `网页出错` 和日志的文字。

## 对应的 iOS API

没有对应的系统 API。

## 参见

- [`WebContentsConsoleMessageEvent`](../web-contents-console-message-event.md)
