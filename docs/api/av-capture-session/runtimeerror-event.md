---
type: reference
native: AVCaptureSessionRuntimeErrorNotification
---

# `AVCaptureSession`：`runtimeerror` 事件

**`runtimeerror`** 事件在会话开始取景或取景中出错时派发。

## 语法

```
session.addEventListener('runtimeerror', (event) => { })
```

## 事件对象

[`AVCaptureSessionRuntimeErrorEvent`](../av-capture-session-runtime-error-event.md)，多出一个字段：

**[`error`](../av-capture-session-runtime-error-event/error.md)**

系统给的错误，一个 [`NSError`](../ns-error.md)：`message` 是系统给的说明，按系统语言；`domain` 和 `code` 是系统的错误域和错误码。

`target` 是这个会话。不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- [`startRunning()`](startrunning.md) 没能开起会话时。这时 `startRunning()` 的 Promise 照样兑现，[`isRunning`](isrunning.md) 是 `false`。
- 取景中出错、系统停下会话时。之后还会派发 [`stop`](stop-event.md)。
- 回调在出错之后的下一轮执行。

这个事件的实际派发、什么情形下出错，都**未在真机验证**。

## 示例

```js
const session = new AVCaptureSession();
session.addEventListener('runtimeerror', (e) => {
  console.log('取景出错', e.error.domain, e.error.code, e.error.message);
});
```

**效果**（**未在真机验证**）：出错时输出错误域、错误码和系统给的说明。

## 对应的 iOS API

通知 `AVCaptureSessionRuntimeErrorNotification`。`userInfo[AVCaptureSessionErrorKey]` 是 `e.error`。

## 参见

- [`startRunning()`](startrunning.md)
- [`stop`](stop-event.md)：停了
