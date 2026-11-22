---
type: reference
native: AVCaptureSessionRuntimeErrorEvent.error
---

# `AVCaptureSessionRuntimeErrorEvent`：`error` 属性

**`error`** 属性是系统给的错误。

## 值

[`NSError`](../ns-error.md)。`message` 是系统给的说明，按系统语言；`domain` 和 `code` 是系统的错误域和错误码。

- 只读。给它赋值抛 `TypeError`。
- 判断出了什么错用 `domain` 和 `code`，不要用 `message`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const session = new AVCaptureSession();
session.addEventListener('runtimeerror', (e) => {
  console.log('取景出错', e.error.domain, e.error.code, e.error.message);
});
```

**效果**：取景出错时，输出错误域、错误码和说明。**未在真机验证**：这个事件触发不了。

## 对应的 iOS API

`AVCaptureSessionRuntimeErrorNotification` 的 `userInfo[AVCaptureSessionErrorKey]`。

## 参见

- [`AVCaptureSessionRuntimeErrorEvent`](../av-capture-session-runtime-error-event.md)
