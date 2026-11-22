---
type: reference
native: AVCaptureInput
status: partial
---

# `AVCaptureInput`

**`AVCaptureInput`** 表示 [`AVCaptureSession`](av-capture-session.md) 的一个输入：画面从哪里来。它是输入的共同基类，App 用的是它的子类 [`AVCaptureDeviceInput`](av-capture-device-input.md)，把一个摄像头接进会话。

会话的 [`addInput()`](av-capture-session/addinput.md)、[`canAddInput()`](av-capture-session/canaddinput.md)、[`removeInput()`](av-capture-session/removeinput.md) 收的参数类型是它，[`inputs`](av-capture-session/inputs.md) 里的元素类型也是它。

它属于 `@nacrejs/av-capture` 这个包，安装见 [`AVCaptureSession`](av-capture-session.md#先装上)。

**继承关系**：`EventTarget` → `NSObject` → `AVCaptureInput`

## 构造函数

不能用 `new` 创建：`new AVCaptureInput()` 抛 `TypeError`，信息是 `Illegal constructor: AVCaptureInput cannot be constructed`（实测）。要接摄像头，用 [`new AVCaptureDeviceInput(device)`](av-capture-device-input/constructor.md)。

## 实例属性

没有自己的属性。还继承 `NSObject` 的属性。

## 实例方法

没有自己的方法。

## 示例

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  session.addInput(new AVCaptureDeviceInput(camera));
}
for (const input of session.inputs) {
  if (input instanceof AVCaptureDeviceInput) {
    console.log('接着摄像头：' + input.device.localizedName);
  }
}
```

**效果**：用户已经同意 App 使用摄像头时，控制台输出 `接着摄像头：` 和摄像头的名字，iPhone 14 上是 `Back Camera`。

`inputs` 的元素类型是 `AVCaptureInput`。要读 `device`，先用 `instanceof AVCaptureDeviceInput` 判断。

## 对应的 iOS API

`AVCaptureInput`。`[session.inputs firstObject]` 写成 `session.inputs[0]`。

## 参见

- [`AVCaptureDeviceInput`](av-capture-device-input.md)：把摄像头接进会话
- [`AVCaptureSession`](av-capture-session.md)：加减输入
