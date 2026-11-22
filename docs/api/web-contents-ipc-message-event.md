---
type: reference
native: WebContentsIpcMessageEvent
---

# `WebContentsIpcMessageEvent`

**`WebContentsIpcMessageEvent`** 表示网页通过消息通道发来的一条消息。

[`WebContents`](web-contents.md) 的 [`ipc-message`](web-contents/ipc-message-event.md) 事件是它。网页里调 [`ipcRenderer.send()`](ipc-renderer.md) 发出，带着频道名和参数。

**继承关系**：[`Event`](event.md) → `WebContentsIpcMessageEvent`

## 构造函数

[`WebContentsIpcMessageEvent()`](web-contents-ipc-message-event/constructor.md)

创建一个 `WebContentsIpcMessageEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`channel`](web-contents-ipc-message-event/channel.md) <small>只读</small> | 频道名 |
| [`args`](web-contents-ipc-message-event/args.md) <small>只读</small> | 跟在频道名后面的参数 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`WebContents`](web-contents.md) | [`ipc-message`](web-contents/ipc-message-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const contents = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } }).webContents;
contents.addEventListener('ipc-message', (e) => {
  console.log(e instanceof WebContentsIpcMessageEvent, e.channel, e.args.length);
});
```

**效果**：网页每发一条消息，输出 `true`、频道名和参数的个数。

## 对应的 iOS API

没有对应的系统 API。事件名和字段名照 Electron 的 `webContents` 的同名事件。

## 参见

- [`ipc-message`](web-contents/ipc-message-event.md)：什么时候派发
- [`ipcRenderer`](ipc-renderer.md)：网页那一头
