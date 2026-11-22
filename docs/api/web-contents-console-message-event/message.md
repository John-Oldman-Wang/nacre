---
type: reference
native: WebContentsConsoleMessageEvent.message
---

# `WebContentsConsoleMessageEvent`：`message` 属性

**`message`** 属性是日志的文字。

## 值

字符串。参数之间用一个空格连起来，对象和数组写成 JSON，错误对象写成「名字: 说明」。没被捕获的异常是 `'Uncaught '` 加上错误。完整的规则见 [`console-message`](../web-contents/console-message-event.md)。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 空串。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('console-message', (e) => {
  console.log('[网页] ' + e.message);
});
```

**效果**：网页调 `console.log('hello', 1)` 时，输出 `[网页] hello 1`。

## 对应的 iOS API

没有对应的系统 API。

## 参见

- [`WebContentsConsoleMessageEvent`](../web-contents-console-message-event.md)
