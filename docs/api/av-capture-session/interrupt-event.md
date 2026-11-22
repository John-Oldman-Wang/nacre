---
type: reference
native: AVCaptureSessionWasInterruptedNotification
---

# `AVCaptureSession`：`interrupt` 事件

**`interrupt`** 事件在系统打断会话时派发。被打断期间会话暂时不取景。

## 语法

```
session.addEventListener('interrupt', (event) => { })
```

## 事件对象

`AVCaptureSessionInterruptEvent`，多出一个字段：

**`reason`**

为什么被打断，字符串，下面六个之一；系统没说原因时是 `null`：

| 取值 | 含义 |
| --- | --- |
| `'videoDeviceNotAvailableInBackground'` | App 到后台了 |
| `'audioDeviceInUseByAnotherClient'` | 麦克风被别的 App 占着 |
| `'videoDeviceInUseByAnotherClient'` | 摄像头被别的 App 占着 |
| `'videoDeviceNotAvailableWithMultipleForegroundApps'` | 前台不止一个 App |
| `'videoDeviceNotAvailableDueToSystemPressure'` | 设备太热一类的原因，系统收回了摄像头 |
| `'sensitiveContentMitigationActivated'` | 系统的敏感内容保护开始起作用 |

`target` 是这个会话。不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- 系统打断会话之后的下一轮。这时 [`isInterrupted`](isinterrupted.md) 是 `true`。
- 打断结束时派发 [`interruptend`](interruptend-event.md)。

这个事件的实际派发、各原因在什么情形下出现、被打断期间取景图层的样子，都**未在真机验证**。

## 示例

```js
const session = new AVCaptureSession();
session.addEventListener('interrupt', (e) => {
  if (e.reason === 'videoDeviceInUseByAnotherClient') {
    console.log('摄像头被别的 App 占着');
  } else {
    console.log('被打断了', e.reason);
  }
});
```

**效果**（**未在真机验证**）：会话被打断时输出一行。别的 App 占用摄像头时输出 `摄像头被别的 App 占着`。

## 对应的 iOS API

通知 `AVCaptureSessionWasInterruptedNotification`。`userInfo[AVCaptureSessionInterruptionReasonKey]` 是 `e.reason`，`AVCaptureSessionInterruptionReasonVideoDeviceInUseByAnotherClient` 写成 `'videoDeviceInUseByAnotherClient'`，其余同理。

## 参见

- [`interruptend`](interruptend-event.md)：打断结束了
- [`isInterrupted`](isinterrupted.md)
- [被打断时](../../guides/scanning.md#被打断时)
