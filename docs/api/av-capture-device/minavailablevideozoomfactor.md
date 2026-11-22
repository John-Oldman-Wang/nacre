---
type: reference
native: AVCaptureDevice.minAvailableVideoZoomFactor
---

# `AVCaptureDevice`：`minAvailableVideoZoomFactor` 属性

**`minAvailableVideoZoomFactor`** 属性是 [`videoZoomFactor`](videozoomfactor.md) 现在能写的最小值。

## 值

数，单位是倍。

- 只读。给它赋值抛 `TypeError`。
- iPhone 14 的后置摄像头上实测是 `1`。
- 它由系统给出，没有变化事件。要用时再读。它在什么情况下会变**未在真机验证**。

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  console.log(device.minAvailableVideoZoomFactor + ' 到 ' + device.maxAvailableVideoZoomFactor);
}
```

**效果**：iPhone 14 上输出 `1 到 123.75`。

## 对应的 iOS API

`AVCaptureDevice.minAvailableVideoZoomFactor`。

## 参见

- [`maxAvailableVideoZoomFactor`](maxavailablevideozoomfactor.md)：最大值
- [`videoZoomFactor`](videozoomfactor.md)：变焦倍数
