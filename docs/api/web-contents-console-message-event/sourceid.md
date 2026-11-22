---
type: reference
native: WebContentsConsoleMessageEvent.sourceId
---

# `WebContentsConsoleMessageEvent`：`sourceId` 属性

**`sourceId`** 属性是网页在哪个文件里调的 `console`。

## 值

字符串：脚本文件的地址，或者网页自己的地址。拿不到时是空串。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 空串。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('console-message', (e) => {
  if (e.sourceId.endsWith('/app.js')) console.log('app.js 写了日志');
});
```

**效果**：网页的 `app.js` 写日志时，输出 `app.js 写了日志`。

## 对应的 iOS API

没有对应的系统 API。

## 参见

- [`WebContentsConsoleMessageEvent`](../web-contents-console-message-event.md)
