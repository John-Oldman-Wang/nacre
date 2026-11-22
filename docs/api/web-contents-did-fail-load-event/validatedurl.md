---
type: reference
native: WebContentsDidFailLoadEvent.validatedURL
---

# `WebContentsDidFailLoadEvent`：`validatedURL` 属性

**`validatedURL`** 属性是加载失败的那个地址。

## 值

字符串。拿不到时是空串。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 空串。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('did-fail-load', (e) => {
  console.log(e.validatedURL);
});
contents.loadURL('https://no-such-host.invalid').catch(() => {});
```

**效果**：输出 `https://no-such-host.invalid/`。**未在模拟器验证。**

## 对应的 iOS API

`error.userInfo[NSURLErrorFailingURLStringErrorKey]`。

## 参见

- [`WebContentsDidFailLoadEvent`](../web-contents-did-fail-load-event.md)
