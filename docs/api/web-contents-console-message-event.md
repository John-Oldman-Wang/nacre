---
type: reference
native: WebContentsConsoleMessageEvent
---

# `WebContentsConsoleMessageEvent`

**`WebContentsConsoleMessageEvent`** 表示网页往 `console` 里写了一条日志。

[`WebContents`](web-contents.md) 的 [`console-message`](web-contents/console-message-event.md) 事件是它，带着日志的级别、文字和位置。网页里没被捕获的异常也报到这里。

**继承关系**：[`Event`](event.md) → `WebContentsConsoleMessageEvent`

## 构造函数

[`WebContentsConsoleMessageEvent()`](web-contents-console-message-event/constructor.md)

创建一个 `WebContentsConsoleMessageEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`level`](web-contents-console-message-event/level.md) <small>只读</small> | 日志的级别 |
| [`message`](web-contents-console-message-event/message.md) <small>只读</small> | 日志的文字 |
| [`lineNumber`](web-contents-console-message-event/linenumber.md) <small>只读</small> | 在第几行调的 |
| [`sourceId`](web-contents-console-message-event/sourceid.md) <small>只读</small> | 在哪个文件调的 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`WebContents`](web-contents.md) | [`console-message`](web-contents/console-message-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('console-message', (e) => {
  console.log(e instanceof WebContentsConsoleMessageEvent, '[网页 ' + e.level + '] ' + e.message);
});
contents.loadURL('data:text/html;charset=utf-8,' +
  encodeURIComponent('<script>console.warn("w");</script>'));
```

**效果**：输出 `true [网页 warning] w`。

## 对应的 iOS API

没有对应的系统 API。事件名和字段名照 Electron 的 `webContents` 的同名事件。

## 参见

- [`console-message`](web-contents/console-message-event.md)：什么时候派发、文字怎么拼
- [`WebContents`](web-contents.md)
