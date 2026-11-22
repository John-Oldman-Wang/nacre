---
type: reference
native: AVCaptureDevice.hasTorch
---

# `AVCaptureDevice`：`hasTorch` 属性

**`hasTorch`** 属性表示这个摄像头有没有手电筒。手电筒是摄像头旁边那盏常亮的补光灯。

## 值

布尔值。

- `true`：有手电筒，可以用 [`torchMode`](torchmode.md) 打开。iPhone 14 的后置摄像头是 `true`（实测）。
- `false`：没有手电筒。这时把 `torchMode` 写成 `'on'` 会被系统拒绝，抛 `TypeError`（**未在真机验证**）。
- 只读。给它赋值抛 `TypeError`。
- 一个摄像头的这个值不会变，所以没有变化事件。

有手电筒不等于现在能开：还要看 [`isTorchAvailable`](istorchavailable.md)。

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
console.log(device !== null && device.hasTorch ? '可以显示手电筒按钮' : '不显示手电筒按钮');
```

**效果**：iPhone 14 上输出 `可以显示手电筒按钮`。

## 对应的 iOS API

`AVCaptureDevice.hasTorch`。

## 参见

- [`torchMode`](torchmode.md)：开关手电筒
- [`isTorchAvailable`](istorchavailable.md)：现在能不能开
- [打开手电筒](../../guides/scanning.md#打开手电筒)
