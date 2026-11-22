---
type: reference
native: AVCaptureDevice.videoZoomFactor
---

# `AVCaptureDevice`：`videoZoomFactor` 属性

**`videoZoomFactor`** 属性是画面的变焦倍数。写它，画面立刻放大到这个倍数。

## 值

数，单位是倍。

- 可读，可写。
- 默认值是 `1`，表示不变焦（实测）。
- 能写的范围是 [`minAvailableVideoZoomFactor`](minavailablevideozoomfactor.md) 到 [`maxAvailableVideoZoomFactor`](maxavailablevideozoomfactor.md)。iPhone 14 的后置摄像头上实测是 1 到 123.75。
- 写之前要先调 [`lockForConfiguration()`](lockforconfiguration.md)，写完调 [`unlockForConfiguration()`](unlockforconfiguration.md)。
- 写入的值照 `Number()` 转换：`'1.5'` 得到 `1.5`（实测）。
- 写了之后读回来是写入的值（实测）。画面放大的样子**未在真机验证**。
- [`rampToVideoZoomFactor()`](ramptovideozoomfactor.md) 平滑变焦的过程中读到的值**未在真机验证**。
- 它由 App 自己写，变的时候没有事件。

### 写错时

- 没锁就写：抛 [`DOMException`](../dom-exception.md)，`name` 是 `'InvalidStateError'`，值不变（实测）。信息是 `videoZoomFactor: the system refused (…)`，括号里是系统给的原因，说的是要先锁（`-lockForConfiguration:`）。
- 超出能写的范围：抛 `RangeError`，值不变（实测）。信息是 `videoZoomFactor: the system refused (…)`，括号里是系统给的原因。
- 转不出有限数：抛 `TypeError`，比如 `videoZoomFactor must be a finite number, got "abc"`。

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  const factor = Math.min(2, device.maxAvailableVideoZoomFactor);
  device.lockForConfiguration();
  try {
    device.videoZoomFactor = factor;
  } finally {
    device.unlockForConfiguration();
  }
  console.log(device.videoZoomFactor);
}
```

**效果**：画面放大到 2 倍，控制台输出 `2`。画面的变化**未在真机验证**。

## 对应的 iOS API

`AVCaptureDevice.videoZoomFactor`。ObjC 里没锁就写抛 `NSGenericException`，这里抛 `DOMException`，`name` 是 `'InvalidStateError'`。

## 参见

- [`rampToVideoZoomFactor()`](ramptovideozoomfactor.md)：平滑地变焦
- [改设置之前先锁住](../av-capture-device.md#改设置之前先锁住)
- [放大画面](../../guides/scanning.md#放大画面)
