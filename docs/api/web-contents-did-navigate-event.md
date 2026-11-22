---
type: reference
native: WebContentsDidNavigateEvent
---

# `WebContentsDidNavigateEvent`

**`WebContentsDidNavigateEvent`** 表示网页换到了一个新的地址。

[`WebContents`](web-contents.md) 的 [`did-navigate`](web-contents/did-navigate-event.md) 事件是它，带着新的地址和 HTTP 状态码。

**继承关系**：[`Event`](event.md) → `WebContentsDidNavigateEvent`

## 构造函数

[`WebContentsDidNavigateEvent()`](web-contents-did-navigate-event/constructor.md)

创建一个 `WebContentsDidNavigateEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`url`](web-contents-did-navigate-event/url.md) <small>只读</small> | 新的地址 |
| [`httpResponseCode`](web-contents-did-navigate-event/httpresponsecode.md) <small>只读</small> | HTTP 状态码 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`WebContents`](web-contents.md) | [`did-navigate`](web-contents/did-navigate-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('did-navigate', (e) => {
  console.log(e instanceof WebContentsDidNavigateEvent, e.httpResponseCode, e.url);
});
contents.loadURL('https://example.com');
```

**效果**：网页加载出来后，输出 `true 200 https://example.com/`。**未在模拟器验证。**

## 对应的 iOS API

没有对应的系统 API。事件名和字段名照 Electron 的 `webContents` 的同名事件。原生写法是 `webView:didCommitNavigation:`。

## 参见

- [`did-navigate`](web-contents/did-navigate-event.md)：什么时候派发
- [`WebContents`](web-contents.md)
