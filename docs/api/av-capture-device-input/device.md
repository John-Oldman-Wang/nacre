---
type: reference
native: AVCaptureDeviceInput.device
---

# `AVCaptureDeviceInput`：`device` 属性

**`device`** 属性表示这个输入接的是哪个摄像头。

## 值

一个 [`AVCaptureDevice`](../av-capture-device.md)：建输入时传进去的那个，是同一个对象（实测）。

- 只读。给它赋值抛 `TypeError`（实测）。
- 建好之后不会变，没有变化通知。

## 示例

```js
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null && AVCaptureDevice.authorizationStatusForMediaType('video') === 'authorized') {
  const input = new AVCaptureDeviceInput(camera);
  console.log(input.device === camera, input.device.position);
}
```

**效果**：已经授权时，控制台输出 `true back`。

## 对应的 iOS API

`AVCaptureDeviceInput.device`。

## 参见

- [`AVCaptureDeviceInput()`](constructor.md)
- [`AVCaptureDevice`](../av-capture-device.md)：手电筒、变焦、对焦都在摄像头上改
