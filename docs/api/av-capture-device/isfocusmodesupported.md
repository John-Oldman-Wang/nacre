---
type: reference
native: "-[AVCaptureDevice isFocusModeSupported:]"
---

# `AVCaptureDevice`：`isFocusModeSupported()` 方法

**`isFocusModeSupported()`** 方法问这个摄像头支不支持某种对焦方式。

## 语法

```
isFocusModeSupported(focusMode)
```

### 参数

**`focusMode`**

对焦方式：`'locked'`、`'autoFocus'`、`'continuousAutoFocus'` 之一，含义见 [`focusMode`](focusmode.md)。

### 返回值

布尔值。`true` 是支持，可以写进 `focusMode`。iPhone 14 的后置摄像头上，`'continuousAutoFocus'` 和 `'locked'` 都是 `true`（实测）。

不用先锁，随时可以问。

### 异常

**`TypeError`**

`focusMode` 不是上面三个之一：`isFocusModeSupported has no value "auto"; expected one of: …`，后面列出全部取值。

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  console.log(device.isFocusModeSupported('continuousAutoFocus'));
}
```

**效果**：iPhone 14 上输出 `true`。

## 对应的 iOS API

`-[AVCaptureDevice isFocusModeSupported:]`。`AVCaptureFocusModeLocked` 写成 `'locked'`，其余同理。

## 参见

- [`focusMode`](focusmode.md)：对焦方式
