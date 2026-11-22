---
type: reference
native: "（没有对应的系统接口）"
---

# `WebContents`：`console-message` 事件

**`console-message`** 事件在网页调了 `console` 的方法、或者网页里有异常没被捕获时派发。用它把网页的日志和报错收进 App 的日志或者崩溃上报。

## 语法

```
contents.addEventListener('console-message', (event) => {})
```

## 事件对象

[`WebContentsConsoleMessageEvent`](../web-contents-console-message-event.md)，除 `type`、`target` 以外带四个字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`level`](../web-contents-console-message-event/level.md) | 字符串 | `'info'`、`'warning'`、`'error'`、`'debug'` 之一 |
| [`message`](../web-contents-console-message-event/message.md) | 字符串 | 日志的文字 |
| [`lineNumber`](../web-contents-console-message-event/linenumber.md) | 数 | 在第几行调的。拿不到时是 `0` |
| [`sourceId`](../web-contents-console-message-event/sourceid.md) | 字符串 | 在哪个文件调的：脚本文件的地址，或者网页自己的地址。拿不到时是空串 |

`target` 是这张网页的 `webContents`。不可取消。

## 什么时候派发

| 网页里 | `level` | `message` |
| --- | --- | --- |
| `console.log()`、`console.info()` | `'info'` | 参数连成的文字 |
| `console.warn()` | `'warning'` | 同上 |
| `console.error()` | `'error'` | 同上 |
| `console.debug()` | `'debug'` | 同上 |
| 有异常没被捕获 | `'error'` | `'Uncaught '` 加上错误，比如 `'Uncaught Error: boom'` |
| 有 Promise 被拒绝、没人处理 | `'error'` | `'Uncaught (in promise) '` 加上原因，比如 `'Uncaught (in promise) Error: nope'` |
| App 用 [`executeJavaScript()`](executejavascript.md) 执行的代码里调了 `console` | 同上 | 同上 |

参数连成文字的规则：

- 参数之间用一个空格连起来：`console.log('hello', 1, true)` 是 `'hello 1 true'`。
- 对象和数组写成 JSON：`{ a: 1 }` 是 `'{"a":1}'`。`null` 是 `'null'`，`undefined` 是 `'undefined'`。
- 错误对象写成「名字: 说明」：`new Error('x')` 是 `'Error: x'`。
- 第一个参数是字符串、后面还有参数时，照浏览器的写法替换 `%s`、`%d`、`%i`、`%f`、`%o`、`%O`、`%%`，`%c`（样式）去掉：`console.log('%s=%d%%', 'a', 5)` 是 `'a=5%'`。

以上全部实测。

- `<iframe>` 里的日志也会派发。**未在模拟器验证。**
- `console.trace()`、`console.table()`、`console.assert()` 这几个不派发。
- 建 `WebView` 时 `webPreferences.javascript` 是 `false` 的网页，网页自己的脚本不跑，也就没有它自己的日志；App 用 `executeJavaScript()` 执行的代码里调 `console`，照样派发（实测）。
- 回调不是在网页调 `console` 的那一刻同步执行，而是稍后执行。网页的 `console` 方法照常执行、照常返回。

> **注意**：网页里的任何脚本都能往 `console` 里写，内容由它决定。打进日志可以，不要当成指令来执行。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('console-message', (e) => {
  console.log('[网页 ' + e.level + '] ' + e.message + '（' + e.lineNumber + ' 行）');
});
await contents.loadURL('data:text/html;charset=utf-8,' +
  encodeURIComponent('<title>t</title><script>\nconsole.warn("w");\n</script>'));
```

**效果**：App 的控制台输出 `[网页 warning] w（2 行）`。

## 和 Electron 的差别

和 Electron 的 `console-message` 相同，字段名和 `level` 的四个值一样。差别：

- 没有 `frame` 字段。
- Electron 的文档没说没被捕获的异常会不会派发这个事件；这里会，文字照 Chromium 控制台的写法。
- `message` 里对象的写法（JSON）是这里自己定的。

## 对应的 iOS API

没有对应的系统接口。

## 参见

- [`executeJavaScript()`](executejavascript.md)
- [`preload-error`](preload-error-event.md)：预加载脚本自己抛的异常
