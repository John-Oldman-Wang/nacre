# 统一处理错误

这一篇讲怎么在一个地方接住 App 里所有没被捕获的异常和没被处理的 Promise 拒绝。用到 [`application`](../api/application.md) 上的两个事件：[`error`](../api/application/error-event.md) 和 [`unhandledrejection`](../api/application/unhandledrejection-event.md)。

## 推荐的做法

- **两个事件的监听器写在 `main.js` 的最前面，交给同一个函数处理。** 写在最前面，是因为排在它前面的顶层代码抛出的异常它收不到。
- **不用把回调包起来。** 事件监听器里抛出的异常也派发 `error`，所以 `sceneconnect` 的回调、点击的回调里出的错，同样进这个函数。
- **要不要 `preventDefault()`，看你自己的处理有没有替代默认日志。** `preventDefault()` 取消的只是运行时输出的那条默认日志。异常已经发生，被中断的代码不会恢复执行。

没被捕获的异常不会让 App 退出：抛出异常的那一段代码停止执行，其余部分照常运行，见[没处理的异常不会让 App 退出](../api/application.md#没处理的异常不会让-app-退出)。

## 第一个错误处理

```js
/** @param {unknown} reason */
function report(reason) {
  console.error('出错了', String(reason));
}

application.addEventListener('error', (e) => {
  report(e.error);
  e.preventDefault();
});
application.addEventListener('unhandledrejection', (e) => {
  report(e.reason);
  e.preventDefault();
});

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();
  throw new Error('建界面时出错');
});
```

**效果**

- 屏幕显示空白页面。`throw` 之前的代码已经执行完，窗口照常显示。
- 控制台输出 `出错了 Error: 建界面时出错`。调了 `preventDefault()`，所以没有以 `Uncaught` 开头的那条默认日志。
- App 继续运行。

验收用例验证过：监听器抛出异常后 `error` 事件收到一次，`e.error` 就是抛出的那个对象，同一个事件的其余监听器照常执行。这段代码没有作为一个整体在模拟器运行过。

> **注意**：`error` 的监听器自己抛出异常时，运行时不会为它再派发一次 `error`，只向控制台输出默认日志。

## 看出错的位置

```js
application.addEventListener('error', (e) => {
  console.log('出错位置', e.filename, e.lineno);
  console.log('是 Error 对象吗', e.error instanceof Error);
  e.preventDefault();
});

throw new Error('没人接的异常');
```

**效果**

- 控制台输出 `出错位置 main.js` 加上 `throw` 那一行的行号。
- 控制台输出 `是 Error 对象吗 true`。
- 因为调了 `preventDefault()`，运行时不再输出默认的错误日志。不调时，运行时用 `console.error` 的级别输出一条以 `Uncaught` 开头的日志。

[`filename`](../api/error-event/filename.md) 和 [`lineno`](../api/error-event/lineno.md) 指向打包后的 `main.js`，不是打包前的源文件。要找到出错的代码，打开打包产物看这一行。

> **注意**：脚本顶层抛出的异常会让 `main.js` 剩下的顶层代码不再执行。`error` 事件只是通知，不会恢复执行。已经注册的监听器仍然有效。

## 接住没处理的 Promise 拒绝

```js
application.addEventListener('unhandledrejection', (e) => {
  console.log('没处理的拒绝', String(e.reason));
  e.preventDefault();
});

Promise.reject(new Error('没人接的拒绝'));
```

**效果**

- 控制台输出 `没处理的拒绝 Error: 没人接的拒绝`。
- 因为调了 `preventDefault()`，运行时不再输出默认日志。不调时，运行时输出一条错误级别的日志，开头是 `Uncaught (in promise)`，后面是拒绝的原因。

`async` 函数里抛出、没人 `await` 的异常也走这里。拒绝之后很快补挂了处理函数的 Promise 不会被上报：运行时把上报排到任务队列的末尾，拒绝之后用 `setTimeout(fn, 0)` 补挂处理函数来得及。

## 参见

- [`error`](../api/application/error-event.md)、[`ErrorEvent`](../api/error-event.md)
- [`unhandledrejection`](../api/application/unhandledrejection-event.md)、[`PromiseRejectionEvent`](../api/promise-rejection-event.md)
- [定时器](../api/timers.md)：`unhandledrejection` 的上报时机和它有关
