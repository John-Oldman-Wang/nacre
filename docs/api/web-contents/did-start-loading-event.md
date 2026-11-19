---
type: reference
native: WKWebView.loading
---

# `WebContents`：`did-start-loading` 事件

**`did-start-loading`** 事件在网页开始加载时派发。

## 语法

```
contents.addEventListener('did-start-loading', (event) => {})
```

## 事件对象

`Event`，没有附加的字段。不可取消。

## 什么时候派发

- App 调 `loadURL()`、`loadFile()`、`reload()`、后退前进时。
- 用户在网页里点链接、网页的脚本跳转时。

一次成功的加载，事件的顺序是 `did-start-loading` → `did-navigate` → `did-stop-loading` → `did-finish-load`。派发之后 [`isLoading()`](isloading.md) 是 `true`。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('did-start-loading', () => console.log('开始加载'));
contents.addEventListener('did-stop-loading', () => console.log('不再加载'));
contents.loadURL('https://example.com/');
```

**结果**：依次输出 `开始加载`、`不再加载`。显示加载指示用这一对事件。

## 和 Electron 的差别

和 Electron 的 `did-start-loading` 相同。对应的 iOS 原生成员是 `WKWebView.loading` 变成 `YES`。

## 参见

- [`did-stop-loading`](did-stop-loading-event.md)
- [知道加载到哪一步了](../../guides/web-pages.md#知道加载到哪一步了)
