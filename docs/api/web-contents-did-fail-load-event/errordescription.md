---
type: reference
native: WebContentsDidFailLoadEvent.errorDescription
---

# `WebContentsDidFailLoadEvent`：`errorDescription` 属性

**`errorDescription`** 属性是系统给的错误说明。

## 值

字符串。语言跟着系统走，只适合打日志，不要拿来判断。判断用 [`errorCode`](errorcode.md)。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 空串。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('did-fail-load', (e) => {
  console.log('加载失败：' + e.errorDescription);
});
contents.loadURL('https://no-such-host.invalid').catch(() => {});
```

**效果**：输出 `加载失败：` 和系统的说明。

## 对应的 iOS API

`error.localizedDescription`。

## 参见

- [`WebContentsDidFailLoadEvent`](../web-contents-did-fail-load-event.md)
