---
type: reference
native: WKWebView.loading
---

# `WebContents`：`did-stop-loading` 事件

**`did-stop-loading`** 事件在网页不再加载时派发。加载成功、失败、被停掉都会派发。

## 语法

```
contents.addEventListener('did-stop-loading', (event) => {})
```

## 事件对象

`Event`，没有附加的字段。不可取消。

## 什么时候派发

和 [`did-start-loading`](did-start-loading-event.md) 成对出现。成功的加载里排在 `did-navigate` 之后、`did-finish-load` 之前。派发之后 [`isLoading()`](isloading.md) 是 `false`。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('did-stop-loading', () => console.log(contents.isLoading()));
contents.loadURL('https://example.com/');
```

**结果**：加载结束后输出 `false`。

## 和 Electron 的差别

和 Electron 的 `did-stop-loading` 相同。对应的 iOS 原生成员是 `WKWebView.loading` 变成 `NO`。

## 参见

- [`did-start-loading`](did-start-loading-event.md)
