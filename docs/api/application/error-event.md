---
type: reference
native: window error event
---

# `Application`：`error` 事件

**`error`** 事件在有没被捕获的异常时派发。它由运行时自己派发，不来自系统。

## 语法

```
application.addEventListener('error', (event) => { })
```

## 事件对象

[`ErrorEvent`](../error-event.md)：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`message`](../error-event/message.md) | 字符串 | 错误的摘要文字，由引擎生成 |
| [`error`](../error-event/error.md) | `unknown` | 抛出来的那个值 |
| [`filename`](../error-event/filename.md) | 字符串 | 出错的脚本名，例如 `'main.js'` |
| [`lineno`](../error-event/lineno.md) | 数字 | 出错的行号 |

`target` 是 `application`。`cancelable` 是 `true`：调 `preventDefault()` 的效果是运行时不再输出默认的错误日志。

## 什么时候派发

- 异常出现在 `main.js` 顶层、定时器的回调、事件监听器的回调（包括 `sceneconnect` 的回调、按钮的点击回调），并且没有被 `try` / `catch` 接住时派发。脚本顶层的验证过；定时器回调里的**未在模拟器验证**。
- 事件监听器抛出异常时，`error` 在同一个事件的下一个监听器执行之前就派发了，其余监听器照常执行（实测）。
- `error` 的监听器自己抛出的异常不会再次派发 `error`，只向控制台输出默认日志。
- `Promise` 的拒绝不走这里，走 [`unhandledrejection`](unhandledrejection-event.md)。
- 没有监听器调 `preventDefault()` 时，运行时用 `console.error` 的级别输出一条以 `Uncaught` 开头的日志。调了只取消这条日志：异常已经发生，被中断的代码不会恢复执行。

## 示例

```js
application.addEventListener('error', (e) => {
  console.log('出错位置', e.filename, e.lineno);
  console.log('是 Error 对象吗', e.error instanceof Error);
  e.preventDefault();
});

throw new Error('没人接的异常');
```

**结果**

- 控制台输出 `出错位置 main.js` 加上 `throw` 那一行的行号。
- 控制台输出 `是 Error 对象吗 true`。
- 因为调了 `preventDefault()`，运行时不再输出默认的错误日志。

> **注意**：监听器要写在 `main.js` 的最前面。排在它前面的顶层代码抛出的异常它收不到。

## 对应的 iOS API

没有对应的系统 API。对应浏览器的 `window` 上的 `error` 事件。

## 参见

- [统一处理错误](../../guides/handle-errors.md)
- [没处理的异常不会让 App 退出](../application.md#没处理的异常不会让-app-退出)
