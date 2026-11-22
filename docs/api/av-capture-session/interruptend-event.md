---
type: reference
native: AVCaptureSessionInterruptionEndedNotification
---

# `AVCaptureSession`：`interruptend` 事件

**`interruptend`** 事件在会话的打断结束时派发。

## 语法

```
session.addEventListener('interruptend', (event) => { })
```

## 事件对象

`Event`，没有多出的字段。`target` 是这个会话。不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- 打断结束之后的下一轮，比如来电挂断、App 回到前台、别的 App 放开了摄像头。这时 [`isInterrupted`](isinterrupted.md) 是 `false`。
- 打断结束之后会话是不是自己接着取景、要不要再调 [`startRunning()`](startrunning.md)，**未在真机验证**。在这个事件里读 [`isRunning`](isrunning.md)，是 `false` 再调 `startRunning()`。

这个事件的实际派发**未在真机验证**。

## 示例

```js
const session = new AVCaptureSession();
session.addEventListener('interruptend', () => {
  if (!session.isRunning) {
    session.startRunning();
  }
});
```

**效果**（**未在真机验证**）：打断结束时，会话没在取景就重新开始取景。

## 对应的 iOS API

通知 `AVCaptureSessionInterruptionEndedNotification`，`object` 是这个会话。

## 参见

- [`interrupt`](interrupt-event.md)：被打断了
- [被打断时](../../guides/scanning.md#被打断时)
