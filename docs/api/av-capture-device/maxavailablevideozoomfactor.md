---
type: reference
native: AVCaptureDevice.maxAvailableVideoZoomFactor
---

# `AVCaptureDevice`：`maxAvailableVideoZoomFactor` 属性

**`maxAvailableVideoZoomFactor`** 属性是 [`videoZoomFactor`](videozoomfactor.md) 现在能写的最大值。

## 值

数，单位是倍。

- 只读。给它赋值抛 `TypeError`（实测）。
- iPhone 14 的后置摄像头上实测是 `123.75`。不同的摄像头、机型不一样。
- 它由系统给出，没有变化事件。要用时再读。它在什么情况下会变**未在真机验证**。

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  // 扫码用不到太大的倍数，自己定一个上限
  const limit = Math.min(4, device.maxAvailableVideoZoomFactor);
  console.log('最多放大到 ' + limit + ' 倍');
}
```

**效果**：iPhone 14 上输出 `最多放大到 4 倍`。

## 对应的 iOS API

`AVCaptureDevice.maxAvailableVideoZoomFactor`。

## 参见

- [`minAvailableVideoZoomFactor`](minavailablevideozoomfactor.md)：最小值
- [`videoZoomFactor`](videozoomfactor.md)：变焦倍数
