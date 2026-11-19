---
type: reference
native: "-[WKWebView callAsyncJavaScript:arguments:inFrame:inContentWorld:completionHandler:]"
---

# `WebContents`：`executeJavaScript()` 方法

**`executeJavaScript()`** 方法在网页里执行一段代码，把结果带回 App。

## 语法

```
executeJavaScript(code)
```

### 参数

**`code`**

要在网页里执行的代码，字符串。它在网页的环境里执行，能用 `document`、`window`，用不了 App 这边的变量。

代码分两种写法，结果不同：

- **一个表达式**，比如 `'document.title'`、`'fetch("/api").then((r) => r.status)'`。结尾的分号不影响判断，`'foo();'` 也算表达式。
- **多条语句**，比如 `'var a = 1; a + 1'`。以 `{`（语句块）、`function`、`class` 开头的代码也按多条语句处理；`function` 和 `class` 声明的名字会进网页的全局。

### 返回值

`Promise<any>`。

| 情况 | 结果 |
| --- | --- |
| 代码是一个表达式 | 兑现它的值。值是 Promise 时等它；它被拒绝，这边也被拒绝 |
| 代码是多条语句 | 兑现最后一个表达式的值，不等 Promise。值是对象时成员顺序不保证 |
| 网页里抛了异常，或者代码有语法错 | 以 `Error` 拒绝，`message` 是网页那边的原文，比如 `Error: boom`、`SyntaxError: …` |
| 结果传不回来（函数、DOM 节点、多条语句得到的 Promise） | 以 `TypeError` 拒绝：`executeJavaScript: the result cannot be passed back; it is a function, a DOM node, or a Promise produced by multi-statement code` |
| 网页已经销毁 | 以 `TypeError` 拒绝：`Object has been destroyed` |

结果按 JSON 传回来：日期变成字符串，`NaN` 变成 `null`，`Map` 变成 `{}`。全部规则见[值怎么传](../web-contents.md#值怎么传)。

### 异常

不直接抛。所有错误都通过返回的 Promise 拒绝。

## 说明

- 还没加载任何网页时也能执行，那时是一张空白文档。
- 网页禁止了脚本（内容安全策略）时照常能执行。
- 结果是网页给的，属于不可信的输入，用之前检查类型和取值范围。

## 示例

### 读网页里的内容

```js
const contents = new WebView().webContents;
await contents.loadURL('https://example.com/');
const title = await contents.executeJavaScript('document.title');
const count = await contents.executeJavaScript('document.querySelectorAll("a").length');
console.log(title, count);
```

**结果**：输出网页的标题和链接的个数。

### 多条语句里等 Promise

多条语句不等 Promise。要在里面用 `await`，包成一个立即执行的异步函数，整段就成了一个表达式：

```js
const contents = new WebView().webContents;
await contents.loadURL('https://example.com/');
const text = await contents.executeJavaScript(`(async () => {
  const response = await fetch('/api/user');
  return (await response.json()).name;
})()`);
```

**结果**：`text` 是接口返回的 `name`。

### 网页里抛了异常

```js
const contents = new WebView().webContents;
contents.executeJavaScript('throw new Error("boom")').catch((err) => console.log(err.message));
```

**结果**：输出 `Error: boom`。

## 和 Electron 的差别

和 Electron 的 `contents.executeJavaScript(code)` 相同，有三处不同：多条语句的代码不等 Promise；多条语句带回的对象不保证成员顺序；结果按 JSON 传（日期是字符串，`Map` 是 `{}`）。不支持 Electron 的第二个参数 `userGesture`。

对应的 iOS 原生写法是 `[webView evaluateJavaScript:completionHandler:]` 和 `callAsyncJavaScript:…`。

## 参见

- [值怎么传](../web-contents.md#值怎么传)
- [读网页里的内容](../../guides/web-pages.md#读网页里的内容)
