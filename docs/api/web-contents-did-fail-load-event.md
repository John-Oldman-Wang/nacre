---
type: reference
native: WebContentsDidFailLoadEvent
---

# `WebContentsDidFailLoadEvent`

**`WebContentsDidFailLoadEvent`** 表示网页加载失败了。

[`WebContents`](web-contents.md) 的 [`did-fail-load`](web-contents/did-fail-load-event.md) 事件是它，带着系统的错误码、说明和失败的地址。服务器返回 404、500 不算失败。

**继承关系**：[`Event`](event.md) → `WebContentsDidFailLoadEvent`

## 构造函数

[`WebContentsDidFailLoadEvent()`](web-contents-did-fail-load-event/constructor.md)

创建一个 `WebContentsDidFailLoadEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`errorCode`](web-contents-did-fail-load-event/errorcode.md) <small>只读</small> | 系统的错误码 |
| [`errorDescription`](web-contents-did-fail-load-event/errordescription.md) <small>只读</small> | 错误的文字说明 |
| [`validatedURL`](web-contents-did-fail-load-event/validatedurl.md) <small>只读</small> | 加载失败的那个地址 |
| [`isMainFrame`](web-contents-did-fail-load-event/ismainframe.md) <small>只读</small> | 总是 `true` |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`WebContents`](web-contents.md) | [`did-fail-load`](web-contents/did-fail-load-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('did-fail-load', (e) => {
  console.log(e instanceof WebContentsDidFailLoadEvent, e.errorCode, e.validatedURL);
});
contents.loadURL('https://no-such-host.invalid').catch(() => {});
```

**效果**：加载失败，输出 `true`、错误码（比如 `-1003`）和失败的地址。

## 对应的 iOS API

没有对应的系统 API。事件名和字段名照 Electron 的 `webContents` 的同名事件。错误码是系统的那一套，不是 Chromium 的。原生写法是 `webView:didFailNavigation:withError:` 和 `webView:didFailProvisionalNavigation:withError:`。

## 参见

- [`did-fail-load`](web-contents/did-fail-load-event.md)：什么时候派发
- [`WebContents`](web-contents.md)
