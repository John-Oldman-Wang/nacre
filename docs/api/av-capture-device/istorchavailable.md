---
type: reference
native: AVCaptureDevice.torchAvailable
---

# `AVCaptureDevice`：`isTorchAvailable` 属性

**`isTorchAvailable`** 属性表示这个摄像头的手电筒现在能不能用。

## 值

布尔值。

- `true`：现在能用。
- `false`：现在不能用。没有手电筒的摄像头一直是 `false`；有手电筒的，设备太热时系统会暂时停掉它，这时也是 `false`。设备变热时这个值的变化**未在真机验证**。
- 只读。给它赋值抛 `TypeError`。
- 它由系统改，变的时候没有事件。要开手电筒之前再读一次。

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null && device.hasTorch && !device.isTorchAvailable) {
  console.log('手电筒暂时不能用');
}
```

**效果**：只有在手电筒被系统暂时停掉时输出一行。平时什么都不输出。

## 对应的 iOS API

`AVCaptureDevice.torchAvailable`，ObjC 的 getter 是 `isTorchAvailable`。

## 参见

- [`hasTorch`](hastorch.md)：有没有手电筒
- [`torchMode`](torchmode.md)：开关手电筒
