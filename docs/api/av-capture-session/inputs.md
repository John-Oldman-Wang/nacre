---
type: reference
native: AVCaptureSession.inputs
---

# `AVCaptureSession`：`inputs` 属性

**`inputs`** 属性是会话现在的全部输入。

## 值

[`AVCaptureInput`](../av-capture-input.md) 的数组。里面的元素实际是 [`AVCaptureDeviceInput`](../av-capture-device-input.md)。

- 只读。给它赋值抛 `TypeError`。
- 新建的会话是空数组。
- 用 [`addInput()`](addinput.md) 加进去的输入，读出来是同一个对象（实测）。
- 每次读得到一个新数组。改这个数组不影响会话，加减输入用 `addInput()` 和 [`removeInput()`](removeinput.md)。
- 只有 App 自己加减输入时它才变，所以没有变化事件。

## 示例

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  const input = new AVCaptureDeviceInput(camera);
  session.addInput(input);
  for (const item of session.inputs) {
    if (item instanceof AVCaptureDeviceInput) console.log(item.device.localizedName);
  }
}
```

**效果**：用户已经同意 App 使用摄像头时，输出摄像头的名字，比如 `Back Camera`。

## 对应的 iOS API

`AVCaptureSession.inputs`。

## 参见

- [`outputs`](outputs.md)：全部输出
- [`addInput()`](addinput.md)、[`removeInput()`](removeinput.md)
