---
type: reference
native: "-[AVCaptureDevice cancelVideoZoomRamp]"
---

# `AVCaptureDevice`：`cancelVideoZoomRamp()` 方法

**`cancelVideoZoomRamp()`** 方法停下 [`rampToVideoZoomFactor()`](ramptovideozoomfactor.md) 开始的平滑变焦，画面停在当时的倍数上。

## 语法

```
cancelVideoZoomRamp()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。没调 [`lockForConfiguration()`](lockforconfiguration.md) 时调它也不抛（实测）。

## 说明

- 停下之后画面停在什么倍数、读 [`videoZoomFactor`](videozoomfactor.md) 得到什么，**未在真机验证**。
- 没有正在进行的变焦时调它不抛（实测）。

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  device.lockForConfiguration();
  try {
    device.rampToVideoZoomFactor(Math.min(8, device.maxAvailableVideoZoomFactor), { withRate: 1 });
  } finally {
    device.unlockForConfiguration();
  }
  // 一秒之后停下
  setTimeout(() => {
    device.lockForConfiguration();
    try {
      device.cancelVideoZoomRamp();
    } finally {
      device.unlockForConfiguration();
    }
  }, 1000);
}
```

**效果**：画面慢慢放大，一秒之后停下，停在大约 2 倍。**未在真机验证。**

## 对应的 iOS API

`-[AVCaptureDevice cancelVideoZoomRamp]`。

## 参见

- [`rampToVideoZoomFactor()`](ramptovideozoomfactor.md)：开始平滑变焦
