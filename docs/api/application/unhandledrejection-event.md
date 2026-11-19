---
type: reference
native: window unhandledrejection event
---

# `Application`：`unhandledrejection` 事件

**`unhandledrejection`** 事件在一个 Promise 被拒绝、并且到上报时仍然没有挂处理函数时派发。它由运行时自己派发。

## 语法

```
application.addEventListener('unhandledrejection', (event) => { })
```

## 事件对象

[`PromiseRejectionEvent`](../promise-rejection-event.md)：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `reason` | `unknown` | 拒绝的原因 |
| `promise` | `Promise` | 被拒绝的那个 Promise |

`target` 是 `application`。`cancelable` 是 `true`：调 `preventDefault()` 的效果是运行时不再输出默认的错误日志。

## 什么时候派发

- `Promise` 被拒绝，并且没有挂处理函数时派发。`async` 函数里抛出的异常属于这一种。
- 不是在拒绝发生的那一刻派发的。运行时把上报排到任务队列的末尾，所以拒绝之后用 `setTimeout(fn, 0)` 补挂处理函数来得及，不会被上报。见[定时器](../timers.md)。
- 上报之后才补挂处理函数，不会得到更正通知：没有 `rejectionhandled` 事件。
- 没有监听器调 `preventDefault()` 时，运行时输出一条错误级别的日志，开头是 `Uncaught (in promise)`，后面是拒绝的原因。

## 示例

```js
application.addEventListener('unhandledrejection', (e) => {
  console.log('没处理的拒绝', String(e.reason));
  e.preventDefault();
});

Promise.reject(new Error('没人接的拒绝'));
```

**结果**

- 控制台输出 `没处理的拒绝 Error: 没人接的拒绝`。
- 因为调了 `preventDefault()`，运行时不再输出默认日志。

## 对应的 iOS API

没有对应的系统 API。对应浏览器的 `window` 上的 `unhandledrejection` 事件。

## 参见

- [统一处理错误](../../guides/handle-errors.md)
- [`error`](error-event.md)
