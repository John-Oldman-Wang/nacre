---
type: reference
native: WebContentsConsoleMessageEvent.lineNumber
---

# `WebContentsConsoleMessageEvent`：`lineNumber` 属性

**`lineNumber`** 属性是网页在第几行调的 `console`。

## 值

数。拿不到时是 `0`。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `0`。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('console-message', (e) => {
  console.log(e.sourceId + ':' + e.lineNumber);
});
```

**效果**：网页每写一条日志，输出调用的文件和行号。

## 对应的 iOS API

没有对应的系统 API。

## 参见

- [`WebContentsConsoleMessageEvent`](../web-contents-console-message-event.md)
