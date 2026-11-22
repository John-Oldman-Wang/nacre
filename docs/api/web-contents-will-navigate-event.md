---
type: reference
native: WebContentsWillNavigateEvent
---

# `WebContentsWillNavigateEvent`

**`WebContentsWillNavigateEvent`** 表示网页自己发起了一次跳转，在跳转开始之前。

[`WebContents`](web-contents.md) 的 [`will-navigate`](web-contents/will-navigate-event.md) 事件是它。监听器调 `preventDefault()`，网页就留在原地。

**继承关系**：[`Event`](event.md) → `WebContentsWillNavigateEvent`

## 构造函数

[`WebContentsWillNavigateEvent()`](web-contents-will-navigate-event/constructor.md)

创建一个 `WebContentsWillNavigateEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`url`](web-contents-will-navigate-event/url.md) <small>只读</small> | 要去的地址 |
| [`isMainFrame`](web-contents-will-navigate-event/ismainframe.md) <small>只读</small> | 总是 `true` |
| [`navigationType`](web-contents-will-navigate-event/navigationtype.md) <small>只读</small> | 这次跳转是怎么引起的 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`WebContents`](web-contents.md) | [`will-navigate`](web-contents/will-navigate-event.md) |

可以取消：`cancelable` 是 `true`。放不放行在监听器返回的那一刻就定了，`await` 之后再调 `preventDefault()` 没有效果。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('will-navigate', (e) => {
  console.log(e instanceof WebContentsWillNavigateEvent, e.navigationType, e.url);
  if (e.url.startsWith('tel:')) {
    e.preventDefault();
  }
});
```

**效果**：网页每次自己发起跳转，输出 `true`、引起的方式和地址。`tel:` 链接被拦下。

## 对应的 iOS API

没有对应的系统 API。事件名和字段名照 Electron 的 `webContents` 的同名事件。原生写法是 `webView:decidePolicyForNavigationAction:decisionHandler:`，`decisionHandler(.cancel)` 对应 `e.preventDefault()`。

## 参见

- [`will-navigate`](web-contents/will-navigate-event.md)：什么时候派发
- [`WebContents`](web-contents.md)
