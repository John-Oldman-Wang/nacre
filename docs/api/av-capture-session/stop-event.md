---
type: reference
native: AVCaptureSessionDidStopRunningNotification
---

# `AVCaptureSession`：`stop` 事件

**`stop`** 事件在会话停止取景时派发，包括 App 调 [`stopRunning()`](stoprunning.md) 和系统自己停下会话。

## 语法

```
session.addEventListener('stop', (event) => { })
```

## 事件对象

`Event`，没有多出的字段。`target` 是这个会话。不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- `stopRunning()` 停好会话之后，派发一次（实测）。这时 [`isRunning`](isrunning.md) 是 `false`。
- 系统自己停下会话时，比如取景中出了错（先派发 [`runtimeerror`](runtimeerror-event.md)）。这一条**未在真机验证**。
- 回调在会话停下之后的下一轮执行。它和 `stopRunning()` 返回的 Promise 谁先谁后，**未在真机验证**，不要依赖这个顺序。

## 示例

```js
const session = new AVCaptureSession();
session.addEventListener('stop', () => {
  console.log('停止取景');
});
```

**效果**：会话每次停止取景时输出 `停止取景`。

## 对应的 iOS API

通知 `AVCaptureSessionDidStopRunningNotification`，`object` 是这个会话。不用注册通知中心，用 `addEventListener`。

## 参见

- [`start`](start-event.md)：开始取景了
- [`stopRunning()`](stoprunning.md)
