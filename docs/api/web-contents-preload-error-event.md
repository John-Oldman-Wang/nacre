---
type: reference
native: WebContentsPreloadErrorEvent
---

# `WebContentsPreloadErrorEvent`

**`WebContentsPreloadErrorEvent`** 表示预加载脚本执行时抛了异常。

[`WebContents`](web-contents.md) 的 [`preload-error`](web-contents/preload-error-event.md) 事件是它，带着脚本的路径和抛出来的错误。预加载脚本见 [`WebView`](web-view.md#预加载脚本)。

**继承关系**：[`Event`](event.md) → `WebContentsPreloadErrorEvent`

## 构造函数

[`WebContentsPreloadErrorEvent()`](web-contents-preload-error-event/constructor.md)

创建一个 `WebContentsPreloadErrorEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`preloadPath`](web-contents-preload-error-event/preloadpath.md) <small>只读</small> | 预加载脚本的路径 |
| [`error`](web-contents-preload-error-event/error.md) <small>只读</small> | 抛出来的错误 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`WebContents`](web-contents.md) | [`preload-error`](web-contents/preload-error-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const contents = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } }).webContents;
contents.addEventListener('preload-error', (e) => {
  console.log(e instanceof WebContentsPreloadErrorEvent, e.preloadPath, e.error.message);
});
```

**效果**：预加载脚本抛了异常时，输出 `true`、脚本的路径和错误的文字。

## 对应的 iOS API

没有对应的系统 API。事件名和字段名照 Electron 的 `webContents` 的同名事件。

## 参见

- [`preload-error`](web-contents/preload-error-event.md)：什么时候派发
- [`WebView`](web-view.md)
