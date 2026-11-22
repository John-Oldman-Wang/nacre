---
type: reference
native: AVCaptureSessionInterruptEvent.reason
---

# `AVCaptureSessionInterruptEvent`：`reason` 属性

**`reason`** 属性是取景被打断的原因。

## 值

字符串或 `null`。系统没说原因时是 `null`。字符串是下面之一：

- 只读。给它赋值抛 `TypeError`。
- `'videoDeviceNotAvailableInBackground'`：App 到后台了。
- `'audioDeviceInUseByAnotherClient'`：麦克风被别的 App 占着。
- `'videoDeviceInUseByAnotherClient'`：摄像头被别的 App 占着。
- `'videoDeviceNotAvailableWithMultipleForegroundApps'`：前台不止一个 App。
- `'videoDeviceNotAvailableDueToSystemPressure'`：设备太热一类的原因，系统收回了摄像头。
- `'sensitiveContentMitigationActivated'`：系统的敏感内容保护开始起作用。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const session = new AVCaptureSession();
session.addEventListener('interrupt', (e) => {
  if (e.reason === 'videoDeviceInUseByAnotherClient') {
    console.log('摄像头被别的 App 占着');
  }
});
```

**效果**：摄像头被别的 App 占用、取景被打断时，输出 `摄像头被别的 App 占着`。**未在真机验证。**

## 对应的 iOS API

`AVCaptureSessionWasInterruptedNotification` 的 `userInfo[AVCaptureSessionInterruptionReasonKey]`。

## 参见

- [`AVCaptureSessionInterruptEvent`](../av-capture-session-interrupt-event.md)
