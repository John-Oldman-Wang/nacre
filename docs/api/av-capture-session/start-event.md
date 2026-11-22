---
type: reference
native: AVCaptureSessionDidStartRunningNotification
---

# `AVCaptureSession`：`start` 事件

**`start`** 事件在会话开始取景时派发。

## 语法

```
session.addEventListener('start', (event) => { })
```

## 事件对象

`Event`，没有多出的字段。`target` 是这个会话。不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- [`startRunning()`](startrunning.md) 开好会话之后，派发一次（实测）。这时 [`isRunning`](isrunning.md) 是 `true`。
- 回调在会话开好之后的下一轮执行。它和 `startRunning()` 返回的 Promise 谁先谁后，**未在真机验证**，不要依赖这个顺序。
- 会话已经在取景时再调 `startRunning()`，会不会再派发一次，**未在真机验证**。

## 示例

```js
const session = new AVCaptureSession();
session.addEventListener('start', () => {
  console.log('开始取景');
});
```

**效果**：会话每次开始取景时输出 `开始取景`。

## 对应的 iOS API

通知 `AVCaptureSessionDidStartRunningNotification`，`object` 是这个会话。不用注册通知中心，用 `addEventListener`。

## 参见

- [`stop`](stop-event.md)：停了
- [`startRunning()`](startrunning.md)
