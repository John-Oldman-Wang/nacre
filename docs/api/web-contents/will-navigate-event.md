---
type: reference
native: "webView:decidePolicyForNavigationAction:decisionHandler:"
---

# `WebContents`：`will-navigate` 事件

**`will-navigate`** 事件在网页自己要跳到别的地址、还没开始跳时派发。在监听器里调 `preventDefault()`，这次跳转就不发生。

## 语法

```
contents.addEventListener('will-navigate', (event) => {})
```

## 事件对象

`WebContentsWillNavigateEvent`，除 `type`、`target` 以外带三个字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `url` | 字符串 | 要去的地址 |
| `navigationType` | 字符串 | 这次跳转是怎么引起的，取值见下 |
| `isMainFrame` | 布尔 | 总是 `true`。`<iframe>` 里的跳转不派发这个事件 |

`navigationType` 的取值：

| 取值 | 含义 |
| --- | --- |
| `'linkActivated'` | 点了链接 |
| `'formSubmitted'` | 提交了表单 |
| `'backForward'` | 网页的脚本后退或前进 |
| `'reload'` | 网页的脚本刷新 |
| `'formResubmitted'` | 重新提交表单，比如后退到一个由表单提交得到的页面（**未在模拟器验证**） |
| `'other'` | 其余的。最常见的是脚本改 `location` |

**可以取消**：`cancelable` 是 `true`。调 `preventDefault()` 之后网页留在原地，不派发任何加载事件。监听器里抛了异常，按没拦算。

放不放行在监听器**返回的那一刻**就定了。`await` 之后再调 `preventDefault()` 没有效果。需要异步判断时，先拦住，查完再自己调 `loadURL()`，见[要先查一下再决定放不放行](../../guides/web-pages.md#要先查一下再决定放不放行)。

## 什么时候派发

只有**网页自己发起的、会换成另一个文档的**跳转才派发。

| 情况 | 派发吗 | `navigationType` |
| --- | --- | --- |
| 用户点链接 | 是 | `'linkActivated'` |
| 网页的脚本改 `location` | 是 | `'other'` |
| 提交表单 | 是 | `'formSubmitted'` |
| 网页的脚本调 `location.reload()` | 是 | `'reload'` |
| 网页的脚本调 `history.back()` / `forward()` | 是 | `'backForward'` |
| `tel:`、`mailto:`、自定义协议的链接 | 是 | 同上，按它是怎么引起的 |
| App 调 `loadURL()`、`reload()`、`navigationHistory.goBack()` / `goForward()` | 否 | |
| 服务器重定向（301、302） | 否。只为重定向之前的那个地址派发一次 | |
| 只改 `#` 后面的部分 | 否 | |
| `history.pushState()` | 否 | |
| `<iframe>` 里的跳转 | 否 | |

用户点一下链接，到跳转真正开始，中间要等监听器执行完。监听器里不要做耗时的事。

`url` 是网页给的，属于不可信的输入，按它做事之前先检查。

## 示例

### 只允许跳到自己的域名

```js
const contents = new WebView().webContents;
contents.addEventListener('will-navigate', (e) => {
  if (!e.url.startsWith('https://my.app/')) {
    e.preventDefault();
    console.log('拦住了', e.url, e.navigationType);
  }
});
```

**效果**

- 网页里点一个指向 `https://other.site/` 的链接：输出 `拦住了 https://other.site/ linkActivated`，网页留在原地，一个加载事件都不派发。
- 点指向 `https://my.app/` 下面的链接：照常跳转。

### 处理电话链接

```js
const contents = new WebView().webContents;
contents.addEventListener('will-navigate', (e) => {
  if (e.url.startsWith('tel:')) {
    e.preventDefault();
    application.openURL(e.url);
  }
});
```

**效果**：点 `tel:10086` 的链接，网页留在原地，不派发 `did-fail-load`，地址交给系统。系统弹出拨号确认**未在模拟器验证**（模拟器不能拨号）。不拦的话派发 `did-fail-load`，`errorCode` 是 `-1002`。

## 和 Electron 的差别

Electron 写成 `contents.on('will-navigate', (details) => details.preventDefault())`，这里是 `contents.addEventListener('will-navigate', (e) => e.preventDefault())`。多一个 `navigationType`；没有 `frame`、`initiator`。没有 Electron 的 `will-redirect`、`will-frame-navigate`。

对应的 iOS 原生写法是 `webView:decidePolicyForNavigationAction:decisionHandler:`，`decisionHandler(.cancel)` 对应 `e.preventDefault()`；`navigationType` 对应 `navigationAction.navigationType`。

## 参见

- [只允许网页跳到自己的域名](../../guides/web-pages.md#只允许网页跳到自己的域名)
- [处理电话、邮件和自定义协议的链接](../../guides/web-pages.md#处理电话邮件和自定义协议的链接)
